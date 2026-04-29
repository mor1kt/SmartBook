import { sendJson } from '../../../../_lib/http.js';
import { supabaseService } from '../../../../_lib/supabase.js';
import { requireAdmin } from '../../../../_lib/admin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    const bookingId = String(req.query?.bookingId || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });
    if (!bookingId) return sendJson(res, 400, { error: 'Missing bookingId' });

    const status = req.body?.status;
    if (!['attended', 'missed', 'pending'].includes(status)) {
      return sendJson(res, 400, { error: 'Invalid attendance status' });
    }

    const admin = await requireAdmin(req, slug);
    if (!admin.ok) return sendJson(res, admin.status, { error: admin.error });

    const supabase = supabaseService();
    const { data, error } = await supabase
      .from('bookings')
      .update({ attendance_status: status })
      .eq('id', bookingId)
      .eq('center_id', admin.center.id)
      .select()
      .single();

    if (error) return sendJson(res, 500, { error: error.message });
    if (!data) return sendJson(res, 404, { error: 'Booking not found' });
    return sendJson(res, 200, data);
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}

