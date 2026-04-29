import { sendJson } from '../../../_lib/http.js';
import { resolveCenterBySlug } from '../../../_lib/center.js';
import { supabaseService } from '../../../_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    const courseId = String(req.query?.courseId || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });
    if (!courseId) return sendJson(res, 400, { error: 'Missing courseId' });

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const [{ data: centerFull, error: centerError }, { data: course, error: courseError }] =
      await Promise.all([
        supabase
          .from('centers')
          .select('id,slug,name,description,logo_url,address,phone,schedule_settings')
          .eq('id', center.id)
          .single(),
        supabase
          .from('courses')
          .select(
            'id,center_id,category_id,name,description,teacher_name,teacher_info,price,booking_type,group_capacity,is_active',
          )
          .eq('id', courseId)
          .eq('center_id', center.id)
          .single(),
      ]);

    if (centerError || !centerFull) return sendJson(res, 404, { error: 'Center not found' });
    if (courseError || !course) return sendJson(res, 404, { error: 'Course not found' });

    if ((course as any).is_active === false) {
      return sendJson(res, 404, { error: 'Course not found' });
    }

    const { data: category } = await supabase
      .from('categories')
      .select('id,name')
      .eq('id', (course as any).category_id)
      .eq('center_id', center.id)
      .maybeSingle();

    return sendJson(res, 200, { center: centerFull, course, category });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
