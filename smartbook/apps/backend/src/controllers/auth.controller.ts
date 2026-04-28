import { Request, Response } from 'express';

import { supabase } from '../db/supabase.js';

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

export const me = async (req: Request, res: Response) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) return res.status(401).json({ error: userError.message });

    const authId = userData.user?.id;
    if (!authId) return res.status(401).json({ error: 'Invalid token' });

    const { data: usersRows, error: usersError } = await supabase
      .from('users')
      .select('center_id, role, email, full_name')
      .eq('auth_id', authId)
      .limit(1);

    if (usersError) return res.status(500).json({ error: usersError.message });
    const row: any = usersRows?.[0];
    if (!row?.center_id) return res.status(403).json({ error: 'No center attached to user' });
    if (row.role !== 'admin') return res.status(403).json({ error: 'Not an admin' });

    const { data: centerRows, error: centerError } = await supabase
      .from('centers')
      .select('id, slug, name')
      .eq('id', row.center_id)
      .limit(1);

    if (centerError) return res.status(500).json({ error: centerError.message });
    const center: any = centerRows?.[0];
    if (!center?.slug) return res.status(404).json({ error: 'Center not found' });

    return res.json({
      user: {
        authId,
        email: row.email ?? userData.user?.email ?? null,
        fullName: row.full_name ?? null,
        role: row.role,
      },
      center,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

