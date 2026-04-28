import { Request, Response } from 'express';
import * as CourseService from '../services/course.service.js'; // Импортируем сервис

export const getCourses = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId;
    console.log('Контроллер: запрашиваю курсы для центра:', centerId);

    // ВЫЗЫВАЕМ СЕРВИС, а не supabase напрямую
    const data = await CourseService.getCourses(centerId);

    // Отправляем чистый результат
    res.json(data);

  } catch (error) {
    console.error('Ошибка в контроллере курса:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
}


// controllers/course.controller.ts
export const create = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId;

    // Передаем всё тело запроса (там будет и название категории, и данные курса)
    const newCourse = await CourseService.createCourseWithCategory(req.body, centerId);

    res.status(201).json(newCourse);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
