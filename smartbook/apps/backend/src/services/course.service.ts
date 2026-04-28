import { supabase } from '../db/supabase.js'

export const getCourses = async (centerId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('center_id', centerId)

  if (error) throw error

  return data
}

export const createCourseWithCategory = async (data: any, centerId: string) => {
  const { categoryName, ...courseData } = data;

  // 1. Используем const, так как переменную не переназначаем.
  // Используем .maybeSingle(), чтобы не обрабатывать ошибку "запись не найдена"
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .eq('center_id', centerId)
    .maybeSingle(); // Вернет null, если категории нет, без ошибки PGRST116

  let categoryId: string;

  if (!category) {
    const { data: newCategory, error: createCatError } = await supabase
      .from('categories')
      .insert({ name: categoryName, center_id: centerId })
      .select()
      .single();

    if (createCatError) throw createCatError;
    categoryId = newCategory.id;
  } else {
    categoryId = category.id;
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      ...courseData,
      category_id: categoryId,
      center_id: centerId
    })
    .select()
    .single();

  if (courseError) throw courseError;
  return course;
};
