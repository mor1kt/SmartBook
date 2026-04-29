import { sendJson } from '../../_lib/http';
import { resolveCenterBySlug } from '../../_lib/center';
import { supabaseService } from '../../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const course_id = String(req.body?.course_id || '').trim();
    const time_slot_id = req.body?.time_slot_id ? String(req.body.time_slot_id).trim() : null;
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
      .select('id, booking_type')
      .eq('id', course_id)
      .eq('center_id', center.id)
      .single();
    if (courseError || !course) return sendJson(res, 404, { error: 'Course not found' });
    if ((course as any).booking_type !== 'individual') return sendJson(res, 400, { error: 'Invalid course type' });

    if (time_slot_id) {
      const { data: slot, error: slotError } = await supabase
        .from('time_slots')
        .select('id')
        .eq('id', time_slot_id)
        .eq('course_id', course_id)
        .eq('center_id', center.id)
        .single();
      if (slotError || !slot) return sendJson(res, 404, { error: 'Time slot not found' });

      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('time_slot_id', time_slot_id)
        .eq('status', 'confirmed')
        .maybeSingle();
      if (existing) return sendJson(res, 400, { error: 'Time slot already booked' });
    }

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        center_id: center.id,
        course_id,
        time_slot_id: time_slot_id ?? null,
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

