import { supabase } from "../db/supabase.js";
import { Request, Response } from 'express';
import * as BookingService from '../services/booking.service.js';


//групповая запись
export const createGroup = async (req: Request, res: Response) => {
  const { course_id, student_name, student_phone } = req.body;
  const { centerId } = req as any;

  try {
    // 1. ТЕСТ 2.3: Проверяем, существует ли курс и принадлежит ли он этому центру
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, group_capacity')
      .eq('id', course_id)
      .eq('center_id', centerId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ error: "Course not found in this center" });
    }

    // 2. ТЕСТ 3: Проверяем лимит группы
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course_id);

    if (countError) throw countError;

    if (count !== null && count >= course.group_capacity) {
      return res.status(400).json({ error: "Group capacity exceeded" });
    }

    // 3. Если проверки прошли — сохраняем
    const { data, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          course_id,
          student_name,
          student_phone,
          center_id: centerId
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json(data);

  } catch (error: any) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

//индивидуальная запись
export const bookIndividual = async (req: Request, res: Response) => {
  try {
    const { course_id, time_slot_id, student_name, student_phone } = req.body;
    const centerId = (req as any).centerId;

    const result = await BookingService.createIndividualBooking({
      course_id,
      time_slot_id,
      student_name,
      student_phone,
      centerId
    });

    return res.status(201).json(result);
  } catch (err: any) {
    // Если сервис выкинул ошибку с кодом, возвращаем её
    const status = err.status || 500;
    return res.status(status).json({ error: err.message });
  }
};

// Добавь в controllers/booking.controller.ts

export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // Ожидаем 'attended' или 'missed'
    const centerId = (req as any).centerId;

    if (!['attended', 'missed', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    const updatedBooking = await BookingService.updateAttendance(
      bookingId,
      status,
      centerId
    );

    res.json(updatedBooking);
  } catch (error: any) {
    const status = error.status || 500;
    res.status(status).json({ error: error.message });
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const centerId = (req as any).centerId;
    const bookings = await BookingService.getAllBookings(centerId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
