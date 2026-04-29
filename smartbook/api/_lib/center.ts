import { supabaseService } from './supabase.js';

export async function resolveCenterBySlug(slug: string) {
  const supabase = supabaseService();
  const { data, error } = await supabase
    .from('centers')
    .select('id,slug,name,description,logo_url,address,phone,schedule_settings')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return data;
}
