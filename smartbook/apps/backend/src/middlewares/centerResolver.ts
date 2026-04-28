import { Request, Response, NextFunction } from 'express';
import { supabase } from '../db/supabase.js';


export const centerResolver = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;

  console.log('Ищем центр со slug:', slug);

  const { data, error } = await supabase
    .from('centers')
    .select('*')
    .eq('slug', slug)
    .single(); // .single() вернет ошибку, если запись не найдена

  console.log('Ошибка Supabase:', error);
  console.log('Данные из базы:', data);

  if (error || !data) {
    return res.status(404).json({ message: 'center not found' });
  }

  // Если всё ок, сохраняем в req, чтобы контроллеры видели id центра
  req.centerId = data.id;
  next();
};
