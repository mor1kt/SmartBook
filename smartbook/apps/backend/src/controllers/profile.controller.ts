import { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';

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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });

    const { data: center, error: centerError } = await supabase
      .from('centers')
      .select('id,slug,name,description,logo_url,address,phone')
      .eq('id', centerId)
      .single();

    if (centerError || !center) {
      return res.status(404).json({ error: 'Center not found' });
    }

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
            'id,category_id,name,description,teacher_name,price,booking_type,group_capacity'
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

      const description =
        groupCourse?.description ?? individualCourse?.description ?? null;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        description,
        groupCourse:
          groupCourse && {
            id: groupCourse.id,
            name: groupCourse.name,
            price: groupCourse.price,
            groupCapacity: groupCourse.group_capacity,
            teacherName: groupCourse.teacher_name,
          },
        individualCourse:
          individualCourse && {
            id: individualCourse.id,
            name: individualCourse.name,
            price: individualCourse.price,
            teacherName: individualCourse.teacher_name,
          },
      };
    })
      .filter(Boolean);

    return res.json({ center, subjects });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Failed to fetch profile' });
  }
};
