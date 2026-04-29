import { sendJson } from '../../_lib/http.js';
import { supabaseService } from '../../_lib/supabase.js';
import { resolveCenterBySlug } from '../../_lib/center.js';

type CourseRow = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  teacher_name: string | null;
  price: number;
  booking_type: 'group' | 'individual';
  group_capacity: number | null;
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const slug = String(req.query?.slug || '').trim();
    if (!slug) return sendJson(res, 400, { error: 'Missing slug' });

    const supabase = supabaseService();
    const center = await resolveCenterBySlug(slug);
    if (!center) return sendJson(res, 404, { error: 'Center not found' });

    const centerId = center.id;

    const [{ data: categories, error: categoriesError }, { data: courses, error: coursesError }] =
      await Promise.all([
        supabase
          .from('categories')
          .select('id,name')
          .eq('center_id', centerId)
          .order('created_at', { ascending: true }),
        supabase
          .from('courses')
          .select(
            'id,category_id,name,description,teacher_name,price,booking_type,group_capacity,is_active',
          )
          .eq('center_id', centerId)
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
      ]);

    if (categoriesError) throw categoriesError;
    if (coursesError) throw coursesError;

    const coursesByCategory = new Map<string, CourseRow[]>();
    for (const course of (courses ?? []) as CourseRow[]) {
      const list = coursesByCategory.get(course.category_id) ?? [];
      list.push(course);
      coursesByCategory.set(course.category_id, list);
    }

    const subjects = (categories ?? [])
      .map((cat: { id: string; name: string }) => {
        const list = coursesByCategory.get(cat.id) ?? [];
        const groupCourse = list.find((c) => c.booking_type === 'group') ?? null;
        const individualCourse = list.find((c) => c.booking_type === 'individual') ?? null;
        if (!groupCourse && !individualCourse) return null;

        const description = groupCourse?.description ?? individualCourse?.description ?? null;
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          description,
          groupCourse: groupCourse && {
            id: groupCourse.id,
            name: groupCourse.name,
            price: groupCourse.price,
            groupCapacity: groupCourse.group_capacity,
            teacherName: groupCourse.teacher_name,
          },
          individualCourse: individualCourse && {
            id: individualCourse.id,
            name: individualCourse.name,
            price: individualCourse.price,
            teacherName: individualCourse.teacher_name,
          },
        };
      })
      .filter(Boolean);

    return sendJson(res, 200, { center, subjects });
  } catch (e: any) {
    return sendJson(res, 500, { error: e?.message ?? 'Internal Server Error' });
  }
}
