import { supabase } from "../db/supabase.js"

// services/waitlist.service.ts
export const addToWaitlist = async (data: any) => {
  const { centerId, course_id, student_name, student_phone, message } = data

  const { data: entry, error } = await supabase
    .from('waitlist_requests')
    .insert({
      center_id: centerId,
      course_id: course_id,
      student_name: student_name,
      student_phone: student_phone,
      message: message,
      status: 'waiting'
    })
    .select()
    .single()

  if (error) throw error
  return entry
}

//получить список waitlist
export const getWaitlist = async (centerId: string) => {
  const { data, error } = await supabase
    .from('waitlist_requests') // используем то имя, которое нашли раньше
    .select(`
      *,
      courses ( name )
    `)
    .eq('center_id', centerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateWaitlistStatus = async (
  id: string,
  status: 'waiting' | 'processed',
  centerId: string
) => {
  const { data, error } = await supabase
    .from('waitlist_requests')
    .update({ status })
    .eq('id', id)
    .eq('center_id', centerId)
    .select(`
      *,
      courses ( name )
    `)
    .single();

  if (error) throw error;
  return data;
};
