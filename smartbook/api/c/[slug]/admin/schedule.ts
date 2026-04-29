import { sendJson } from '../../../_lib/http.js';
import { supabaseService } from '../../../_lib/supabase.js';
import { requireAdmin } from '../../../_lib/admin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const admin = await requireAdmin(req, slug);
    if (!admin.ok) return sendJson(res, admin.status, { error: admin.error });

    const scheduleSettings = req.body?.scheduleSettings ?? req.body ?? {};

    const supabase = supabaseService();
    const { data, error } = await supabase
      .from('centers')
      .update({ schedule_settings: scheduleSettings })
      .eq('id', admin.center.id)
      .select('id,slug,name,schedule_settings')
      .single();

    if (error) return sendJson(res, 500, { error: error.message });
    return sendJson(res, 200, {
      center: { id: data.id, slug: data.slug, name: data.name },
      scheduleSettings: data.schedule_settings,
    });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
