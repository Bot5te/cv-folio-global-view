
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface CVData {
  id: string
  name: string
  age: number
  nationality: string
  file_url: string
  file_type: 'pdf' | 'image'
  upload_date: string
}
