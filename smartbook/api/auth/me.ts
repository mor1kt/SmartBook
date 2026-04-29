import { sendJson, getBearer } from '../_lib/http';
import { supabaseService } from '../_lib/supabase';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const token = getBearer(req);
    if (!token) return sendJson(res, 401, { error: 'Missing bearer token' });

    const supabase = supabaseService();

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) return sendJson(res, 401, { error: userError.message });
    const authId = userData.user?.id;
    if (!authId) return sendJson(res, 401, { error: 'Invalid token' });

    const { data: usersRows, error: usersError } = await supabase
      .from('users')
      .select('center_id, role, email, full_name')
      .eq('auth_id', authId)
      .limit(1);
    if (usersError) return sendJson(res, 500, { error: usersError.message });

    const row: any = usersRows?.[0];
    if (!row?.center_id) return sendJson(res, 403, { error: 'No center attached to user' });
    if (row.role !== 'admin') return sendJson(res, 403, { error: 'Not an admin' });

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('id, slug, name')
      .eq('id', row.center_id)
      .limit(1);
    if (centerError) return sendJson(res, 500, { error: centerError.message });

    const center: any = centerRows?.[0];
    if (!center?.slug) return sendJson(res, 404, { error: 'Center not found' });

    return sendJson(res, 200, {
      user: {
        authId,
        email: row.email ?? userData.user?.email ?? null,
        fullName: row.full_name ?? null,
        role: row.role,
      },
      center,
    });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
