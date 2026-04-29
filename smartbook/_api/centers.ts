import { sendJson } from './_lib/http.js';
import { supabaseService } from './_lib/supabase.js';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function ensureUniqueSlug(supabase: any, baseSlug: string) {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const { data, error } = await supabase.from('centers').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!data) return slug;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const supabase = supabaseService();
    const body: any = req.body || {};

    const center = body.center || {};
    const owner = body.owner || {};
    const services = Array.isArray(body.services) ? body.services : [];

    if (!center?.name || typeof center.name !== 'string' || !center.name.trim()) {
      return sendJson(res, 400, { error: 'Invalid payload', details: { fieldErrors: { 'center.name': ['Required'] } } });
    }
    if (!owner?.email || typeof owner.email !== 'string') {
      return sendJson(res, 400, { error: 'Invalid payload', details: { fieldErrors: { 'owner.email': ['Required'] } } });
    }
    if (!owner?.password || String(owner.password).length < 6) {
      return sendJson(res, 400, { error: 'Invalid payload', details: { fieldErrors: { 'owner.password': ['Min 6 chars'] } } });
    }
    if (services.length < 1) {
      return sendJson(res, 400, { error: 'Invalid payload', details: { fieldErrors: { services: ['Min 1 item'] } } });
    }

    const baseSlug = slugify(center.name);
    const slug = await ensureUniqueSlug(supabase, baseSlug);

    let centerId: string | null = null;
    let authUserId: string | null = null;

    try {
      const centerInsertBase: any = {
        name: center.name,
        slug,
        address: center.address ?? null,
        phone: center.phone ?? null,
        description: center.description ?? null,
        logo_url: center.logoDataUrl ?? null,
      };

      const schedule = body.schedule ?? null;
      if (schedule) centerInsertBase.schedule_settings = schedule;

      const { data: centerRow, error: centerError } = await supabase.from('centers').insert(centerInsertBase).select().single();
      if (centerError) throw centerError;
      centerId = centerRow.id;

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: owner.email,
        password: owner.password,
        email_confirm: true,
        user_metadata: { full_name: owner.fullName ?? null },
      });
      if (authError) throw authError;
      authUserId = authData.user?.id ?? null;
      if (!authUserId) throw new Error('Failed to create auth user');

      const { data: userRow, error: userError } = await supabase
        .from('users')
        .insert({
          center_id: centerId,
          auth_id: authUserId,
          email: owner.email,
          full_name: owner.fullName ?? null,
          role: 'admin',
        })
        .select()
        .single();
      if (userError) throw userError;

      const createdCourses: any[] = [];
      for (const svc of services) {
        const categoryName = String(svc.categoryName || '').trim();
        const courseName = String(svc.courseName || '').trim();
        if (!categoryName || !courseName) continue;

        const { data: existingCategory, error: catLookupError } = await supabase
          .from('categories')
          .select('id')
          .eq('center_id', centerId)
          .eq('name', categoryName)
          .maybeSingle();
        if (catLookupError) throw catLookupError;

        let categoryId: string;
        if (!existingCategory) {
          const { data: newCategory, error: catCreateError } = await supabase
            .from('categories')
            .insert({ center_id: centerId, name: categoryName })
            .select()
            .single();
          if (catCreateError) throw catCreateError;
          categoryId = newCategory.id;
        } else {
          categoryId = existingCategory.id;
        }

        const bookingType = svc.bookingType === 'individual' ? 'individual' : 'group';
        const groupCapacity = bookingType === 'group' ? Number(svc.groupCapacity ?? schedule?.defaultGroupLimit ?? 10) : null;

        const { data: courseRow, error: courseError } = await supabase
          .from('courses')
          .insert({
            center_id: centerId,
            category_id: categoryId,
            name: courseName,
            description: svc.description ?? null,
            price: Number(svc.price ?? 0),
            booking_type: bookingType,
            group_capacity: groupCapacity,
            teacher_name: svc.teacherName ?? null,
          })
          .select()
          .single();
        if (courseError) throw courseError;
        createdCourses.push(courseRow);
      }

      return sendJson(res, 201, { center: centerRow, admin: userRow, courses: createdCourses });
    } catch (err) {
      try {
        if (authUserId) await supabase.auth.admin.deleteUser(authUserId);
      } catch {
        // ignore
      }
      try {
        if (centerId) await supabase.from('centers').delete().eq('id', centerId);
      } catch {
        // ignore
      }
      throw err;
    }
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
