// services/category.service.ts
import { supabase } from '../db/supabase.js'

export const getCategories = async (centerId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('center_id', centerId)

  if (error) {
    console.error('Supabase error in categories:', error);
    throw error;
  }
  return data
}


export const createCategory = async (name: string, centerId: string) => {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      center_id: centerId
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};
