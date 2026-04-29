import { getBearer } from './http.js';
import { resolveCenterBySlug } from './center.js';
import { supabaseService } from './supabase.js';

export async function requireAdmin(req: any, slug: string) {
  const token = getBearer(req);
  if (!token) return { ok: false as const, status: 401, error: 'Missing bearer token' };

  const supabase = supabaseService();

  const center = await resolveCenterBySlug(slug);
  if (!center) return { ok: false as const, status: 404, error: 'Center not found' };

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError) return { ok: false as const, status: 401, error: userError.message };
  const authId = userData.user?.id;
  if (!authId) return { ok: false as const, status: 401, error: 'Invalid token' };

  const { data: usersRows, error: usersError } = await supabase
    .from('users')
    .select('role')
    .eq('auth_id', authId)
    .eq('center_id', center.id)
    .limit(1);

  if (usersError) return { ok: false as const, status: 500, error: usersError.message };
  const row: any = usersRows?.[0];
  if (!row) return { ok: false as const, status: 403, error: 'No access to this center' };
  if (row.role !== 'admin') return { ok: false as const, status: 403, error: 'Not an admin' };

  return { ok: true as const, center, authId };
}

