import { createClient } from "@supabase/supabase-js"
import 'dotenv/config';


const supabaseUrl = 'https://ivjwgqvoimcgccwypshl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2andncXZvaW1jZ2Njd3lwc2hsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTk5ODU4MywiZXhwIjoyMDkxNTc0NTgzfQ.AP-yE8jdsuV-hGIBM9gJSnHoU3UNz_5eyTSmk_elEeg'

// ДОБАВЬ ЭТОТ ЛОГ, чтобы проверить, видит ли код ключи
console.log('Проверка ключей:', {
  url: !!supabaseUrl,
  key: !!supabaseKey
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase env variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
