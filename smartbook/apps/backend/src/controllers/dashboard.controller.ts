import { Request, Response } from 'express';

import { supabase } from '../db/supabase.js';

export const summary = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const nowIso = new Date().toISOString();

    const [{ data: centerRows, error: centerError }, groupCountRes, waitlistCountRes, futureWaitCountRes, futureCountRes] =
      await Promise.all([
        supabase.from('centers').select('id,slug,name,schedule_settings').eq('id', centerId).limit(1),
        supabase
          .from('bookings')
          .select('id, courses!inner(booking_type)', { count: 'exact', head: true })
          .eq('center_id', centerId)
          .eq('status', 'confirmed')
          .eq('courses.booking_type', 'group'),
        supabase
          .from('waitlist_requests')
          .select('id', { count: 'exact', head: true })
          .eq('center_id', centerId)
          .eq('status', 'waiting'),
        supabase
          .from('waitlist_requests')
          .select('id', { count: 'exact', head: true })
          .eq('center_id', centerId)
          .eq('status', 'waiting')
          .like('message', 'future:%'),
        supabase
          .from('bookings')
          .select('id, time_slots!inner(starts_at)', { count: 'exact', head: true })
          .eq('center_id', centerId)
          .eq('status', 'confirmed')
          .gt('time_slots.starts_at', nowIso),
      ]);

    if (centerError) return res.status(500).json({ error: centerError.message });
    const center: any = centerRows?.[0];
    if (!center) return res.status(404).json({ error: 'Center not found' });

    if (groupCountRes.error) return res.status(500).json({ error: groupCountRes.error.message });
    if (waitlistCountRes.error) return res.status(500).json({ error: waitlistCountRes.error.message });
    if (futureWaitCountRes.error) return res.status(500).json({ error: futureWaitCountRes.error.message });
    if (futureCountRes.error) return res.status(500).json({ error: futureCountRes.error.message });

    return res.json({
      center: {
        id: center.id,
        slug: center.slug,
        name: center.name,
      },
      scheduleSettings: center.schedule_settings ?? {},
      counts: {
        groupBookings: groupCountRes.count ?? 0,
        individualWaitlist: waitlistCountRes.count ?? 0,
        futureBookings: (futureCountRes.count ?? 0) + (futureWaitCountRes.count ?? 0),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

export const updateScheduleSettings = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const scheduleSettings = req.body?.scheduleSettings ?? req.body ?? {};

    const { data, error } = await supabase
      .from('centers')
      .update({ schedule_settings: scheduleSettings })
      .eq('id', centerId)
      .select('id,slug,name,schedule_settings')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ center: { id: data.id, slug: data.slug, name: data.name }, scheduleSettings: data.schedule_settings });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};
