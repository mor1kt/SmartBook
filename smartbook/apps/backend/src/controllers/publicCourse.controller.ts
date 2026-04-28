import { Request, Response } from 'express';
import { supabase } from '../db/supabase.js';

export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const centerId = req.centerId;
    const { courseId } = req.params;

    if (!centerId) return res.status(400).json({ error: 'Missing centerId' });
    if (!courseId) return res.status(400).json({ error: 'Missing courseId' });

    const [{ data: center, error: centerError }, { data: course, error: courseError }] =
      await Promise.all([
        supabase
          .from('centers')
          .select('id,slug,name,description,logo_url,address,phone,schedule_settings')
          .eq('id', centerId)
          .single(),
        supabase
          .from('courses')
          .select(
            'id,center_id,category_id,name,description,teacher_name,price,booking_type,group_capacity,is_active'
          )
          .eq('id', courseId)
          .eq('center_id', centerId)
          .single(),
      ]);

    if (centerError || !center) return res.status(404).json({ error: 'Center not found' });
    if (courseError || !course) return res.status(404).json({ error: 'Course not found' });

    if (course.is_active === false) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { data: category } = await supabase
      .from('categories')
      .select('id,name')
      .eq('id', course.category_id)
      .eq('center_id', centerId)
      .maybeSingle();

    return res.json({ center, course, category });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message ?? 'Failed to fetch course' });
  }
};

