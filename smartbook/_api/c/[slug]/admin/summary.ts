import { sendJson } from '../../../_lib/http';
import { supabaseService } from '../../../_lib/supabase';
import { requireAdmin } from '../../../_lib/admin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const admin = await requireAdmin(req, slug);
    if (!admin.ok) return sendJson(res, admin.status, { error: admin.error });

    const supabase = supabaseService();
    const centerId = admin.center.id;
    const nowIso = new Date().toISOString();

    const [groupCountRes, waitCountRes, futureWaitCountRes, futureCountRes] = await Promise.all([
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

    if (groupCountRes.error) return sendJson(res, 500, { error: groupCountRes.error.message });
    if (waitCountRes.error) return sendJson(res, 500, { error: waitCountRes.error.message });
    if (futureWaitCountRes.error) return sendJson(res, 500, { error: futureWaitCountRes.error.message });
    if (futureCountRes.error) return sendJson(res, 500, { error: futureCountRes.error.message });

    return sendJson(res, 200, {
      center: { id: admin.center.id, slug: admin.center.slug, name: admin.center.name },
      scheduleSettings: (admin.center as any).schedule_settings ?? {},
      counts: {
        groupBookings: groupCountRes.count ?? 0,
        individualWaitlist: waitCountRes.count ?? 0,
        futureBookings: (futureCountRes.count ?? 0) + (futureWaitCountRes.count ?? 0),
      },
    });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}

