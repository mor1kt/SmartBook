import { sendJson } from '../../../_lib/http';
import { supabaseService } from '../../../_lib/supabase';
import { resolveCenterBySlug } from '../../../_lib/center';

async function ensureFutureCourse(supabase: any, centerId: string) {
  const categoryName = 'Будущие записи';
  const courseName = 'Запись на будущее';

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
    .select('id')
    .eq('center_id', centerId)
    .eq('category_id', categoryId)
    .eq('name', courseName)
    .limit(1);
  if (courseError) throw courseError;

  const existing: any = courseRows?.[0];
  if (existing?.id) return String(existing.id);

  const { data: course, error: createError } = await supabase
    .from('courses')
    .insert({
      center_id: centerId,
      category_id: categoryId,
      name: courseName,
      description: null,
      teacher_name: null,
      price: 0,
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

    const student_phone = String(req.body?.student_phone ?? '').trim();
    const wishes = String(req.body?.wishes ?? '').trim();
    if (!student_phone) return sendJson(res, 400, { error: 'Введите номер телефона' });

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const courseId = await ensureFutureCourse(supabase, (center as any).id);
    const message = `future:${wishes || '-'}`;

    const { data: entry, error } = await supabase
      .from('waitlist_requests')
      .insert({
        center_id: (center as any).id,
        course_id: courseId,
        student_name: 'Без имени',
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

