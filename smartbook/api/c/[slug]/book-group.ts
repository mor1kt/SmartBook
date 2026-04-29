import { sendJson } from '../../_lib/http.js';
import { resolveCenterBySlug } from '../../_lib/center.js';
import { supabaseService } from '../../_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const course_id = String(req.body?.course_id || '').trim();
    const student_name = String(req.body?.student_name || '').trim();
    const student_phone = String(req.body?.student_phone || '').trim();
    if (!course_id || !student_name || !student_phone) {
      return sendJson(res, 400, { error: 'Missing required fields' });
    }

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, booking_type, group_capacity')
      .eq('id', course_id)
      .eq('center_id', center.id)
      .single();

    if (courseError || !course)
      return sendJson(res, 404, { error: 'Course not found in this center' });
    if ((course as any).booking_type !== 'group')
      return sendJson(res, 400, { error: 'Invalid course type' });

    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course_id)
      .eq('status', 'confirmed');
    if (countError) throw countError;

    const capacity = Number((course as any).group_capacity ?? 0);
    if (capacity > 0 && (count ?? 0) >= capacity) {
      return sendJson(res, 400, { error: 'Group capacity exceeded' });
    }

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        center_id: center.id,
        course_id,
        student_name,
        student_phone,
        status: 'confirmed',
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return sendJson(res, 201, booking);
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
