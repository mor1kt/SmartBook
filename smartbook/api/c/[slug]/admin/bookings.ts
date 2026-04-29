import { sendJson } from '../../../_lib/http.js';
import { supabaseService } from '../../../_lib/supabase.js';
import { requireAdmin } from '../../../_lib/admin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const admin = await requireAdmin(req, slug);
    if (!admin.ok) return sendJson(res, admin.status, { error: admin.error });

    const supabase = supabaseService();
    const { data, error } = await supabase
      .from('bookings')
      .select('*, courses ( name, booking_type ), time_slots ( starts_at, ends_at )')
      .eq('center_id', admin.center.id)
      .order('created_at', { ascending: false });

    if (error) return sendJson(res, 500, { error: error.message });
    return sendJson(res, 200, data ?? []);
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
