import { supabase } from '../db/supabase.js'

//групповая запись
export const createGroupBooking = async (
  centerId: string,
  courseId: string,
  name: string,
  phone: string
) => {
  // 1. Проверяем курс
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('center_id', centerId)
    .single()

  if (!course) throw new Error('Course not found')

  if (course.booking_type !== 'group') {
    throw new Error('Invalid course type')
  }

  // 2. Создаём запись
  const { data, error } = await supabase.from('bookings').insert({
    center_id: centerId,
    course_id: courseId,
    student_name: name,
    student_phone: phone,
    status: 'confirmed'
  })

  if (error) throw error

  return data
}

//индивидуальная запись
export const createIndividualBooking = async (data: any) => {
  const { course_id, time_slot_id, student_name, student_phone, centerId } = data;

  // 1. Проверка курса
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', course_id)
    .eq('center_id', centerId)
    .single();

  if (!course) throw { status: 404, message: 'Course not found' };
  if (course.booking_type !== 'individual') throw { status: 400, message: 'Invalid course type' };

  const slotId = time_slot_id ? String(time_slot_id) : null;
  if (slotId) {
    // 2. Проверка слота
    const { data: slot } = await supabase
      .from('time_slots')
      .select('*')
      .eq('id', slotId)
      .eq('course_id', course_id)
      .single();

    if (!slot) throw { status: 404, message: 'Time slot not found' };

    // 3. Проверка занятости (Double-booking protection)
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('time_slot_id', slotId)
      .eq('status', 'confirmed')
      .maybeSingle();

    if (existing) throw { status: 400, message: 'Time slot already booked' };
  }

  // 4. Создание
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      center_id: centerId,
      course_id,
      time_slot_id: slotId,
      student_name: student_name,
      student_phone: student_phone,
      status: 'confirmed'
    })
    .select()
    .single();

  console.log('Данные для вставки:', { student_name: student_name, student_phone: student_phone });
  if (error) throw error;
  return booking;

};


// services/booking.service.ts

export const getAllBookings = async (centerId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      courses ( name, booking_type )
      ,
      time_slots ( starts_at, ends_at )
    `)
    .eq('center_id', centerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};


export const updateAttendance = async (bookingId: string, status: string, centerId: string) => {
  // Валидация статуса
  const validStatuses = ['attended', 'missed', 'pending'];
  if (!validStatuses.includes(status)) {
    throw { status: 400, message: 'Invalid status' };
  }

  const { data, error } = await supabase
    .from('bookings')
    .update({ attendance_status: status })
    .eq('id', bookingId)
    .eq('center_id', centerId) // КРИТИЧЕСКИ: изоляция центра
    .select()
    .single();

  if (error) throw error;
  if (!data) throw { status: 404, message: 'Booking not found in this center' };

  return data;
}
