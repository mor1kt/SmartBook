import { Request, Response, NextFunction } from 'express';

import { supabase } from '../db/supabase.js';

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) return res.status(401).json({ error: userError.message });

    const authId = userData.user?.id;
    if (!authId) return res.status(401).json({ error: 'Invalid token' });

    const { data: usersRows, error: usersError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', authId)
      .eq('center_id', centerId)
      .limit(1);

    if (usersError) return res.status(500).json({ error: usersError.message });
    const row: any = usersRows?.[0];
    if (!row) return res.status(403).json({ error: 'No access to this center' });
    if (row.role !== 'admin') return res.status(403).json({ error: 'Not an admin' });

    return next();
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Internal Server Error' });
  }
};

