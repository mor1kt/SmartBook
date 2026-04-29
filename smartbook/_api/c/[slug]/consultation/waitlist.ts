import { sendJson } from '../../../_lib/http';
import { supabaseService } from '../../../_lib/supabase';
import { resolveCenterBySlug } from '../../../_lib/center';

function parseTimeHHMM(value: any, fallback: string) {
  const raw = String(value ?? '').trim();
  if (!/^\d{2}:\d{2}$/.test(raw)) return fallback;
  return raw;
}

async function ensureConsultationCourse(supabase: any, centerId: string, price: number) {
  const categoryName = 'Консультации';
  const courseName = 'Индивидуальная консультация';

  const { data: catRows, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('center_id', centerId)
    .eq('name', categoryName)
    .limit(1);
  if (catError) throw catError;

  let categoryId = catRows?.[0]?.id as string | undefined;
  if (!categoryId) {
    const { data: newCat, error: newCatError } = await supabase
      .from('categories')
      .insert({ center_id: centerId, name: categoryName })
      .select()
      .single();
    if (newCatError) throw newCatError;
    categoryId = newCat.id;
  }

  const { data: courseRows, error: courseError } = await supabase
    .from('courses')
    .select('id, price')
    .eq('center_id', centerId)
    .eq('category_id', categoryId)
    .eq('name', courseName)
    .limit(1);
  if (courseError) throw courseError;

  const existing: any = courseRows?.[0];
  if (existing?.id) {
    const currentPrice = Number(existing.price ?? 0);
    if (Number.isFinite(price) && currentPrice !== price) {
      await supabase.from('courses').update({ price }).eq('id', existing.id).eq('center_id', centerId);
    }
    return String(existing.id);
  }

  const { data: course, error: createError } = await supabase
    .from('courses')
    .insert({
      center_id: centerId,
      category_id: categoryId,
      name: courseName,
      description: null,
      teacher_name: null,
      price,
      booking_type: 'individual',
      group_capacity: null,
      is_active: false,
    })
    .select()
    .single();
  if (createError) throw createError;
  return String(course.id);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const student_name = String(req.body?.student_name ?? '').trim();
    const student_phone = String(req.body?.student_phone ?? '').trim();
    const starts_at = String(req.body?.starts_at ?? '').trim();
    const ends_at = String(req.body?.ends_at ?? '').trim();
    if (!student_name || !student_phone || !starts_at || !ends_at) {
      return sendJson(res, 400, { error: 'Missing required fields' });
    }

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const ss: any = (center as any).schedule_settings ?? {};
    const consultationPrice = Math.max(0, Number.parseInt(String(ss.consultationPrice ?? '0'), 10) || 0);
    parseTimeHHMM(ss.workStart, '09:00'); // keep parse for validation symmetry

    const courseId = await ensureConsultationCourse(supabase, (center as any).id, consultationPrice);
    const message = `slot:${starts_at}|${ends_at}`;

    const { data: existingRows, error: existingError } = await supabase
      .from('waitlist_requests')
      .select('id')
      .eq('center_id', (center as any).id)
      .eq('status', 'waiting')
      .eq('message', message)
      .limit(1);
    if (existingError) return sendJson(res, 500, { error: existingError.message });
    if (existingRows?.[0]?.id) return sendJson(res, 400, { error: 'Этот слот уже занят' });

    const { data: entry, error } = await supabase
      .from('waitlist_requests')
      .insert({
        center_id: (center as any).id,
        course_id: courseId,
        student_name,
        student_phone,
        message,
        status: 'waiting',
      })
      .select('*, courses ( name )')
      .single();

    if (error) return sendJson(res, 500, { error: error.message });
    return sendJson(res, 201, entry);
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
