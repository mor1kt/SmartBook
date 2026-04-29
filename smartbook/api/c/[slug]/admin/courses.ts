import { sendJson } from '../../../_lib/http.js';
import { supabaseService } from '../../../_lib/supabase.js';
import { requireAdmin } from '../../../_lib/admin.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const admin = await requireAdmin(req, slug);
    if (!admin.ok) return sendJson(res, admin.status, { error: admin.error });

    const supabase = supabaseService();
    const centerId = admin.center.id;

    const categoryName = String(req.body?.categoryName || '').trim();
    if (!categoryName) return sendJson(res, 400, { error: 'Missing categoryName' });

    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('center_id', centerId)
      .eq('name', categoryName)
      .maybeSingle();

    let categoryId = cat?.id;
    if (!categoryId) {
      const { data: newCat, error: catError } = await supabase
        .from('categories')
        .insert({ center_id: centerId, name: categoryName })
        .select()
        .single();
      if (catError) return sendJson(res, 500, { error: catError.message });
      categoryId = newCat.id;
    }

    const courseData: any = { ...req.body };
    delete courseData.categoryName;

    const { data: course, error } = await supabase
      .from('courses')
      .insert({ ...courseData, center_id: centerId, category_id: categoryId })
      .select()
      .single();

    if (error) return sendJson(res, 500, { error: error.message });
    return sendJson(res, 201, course);
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
