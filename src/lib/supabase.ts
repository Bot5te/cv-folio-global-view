
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface CV {
  id: string;
  name: string;
  age: number;
  nationality: string;
  file_name: string;
  file_type: 'pdf' | 'image';
  file_url: string | null;
  upload_date: string;
}

export const uploadFile = async (file: File, fileName: string) => {
  const { data, error } = await supabase.storage
    .from('cv-files')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('cv-files')
    .getPublicUrl(fileName);
  
  return { data, publicUrl };
};

export const deleteFile = async (fileName: string) => {
  const { error } = await supabase.storage
    .from('cv-files')
    .remove([fileName]);
  
  if (error) throw error;
};

export const insertCV = async (cvData: Omit<CV, 'id' | 'upload_date'>) => {
  const { data, error } = await supabase
    .from('cvs')
    .insert([cvData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getCVs = async () => {
  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .order('upload_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const deleteCV = async (id: string, fileName: string) => {
  // Delete file from storage
  await deleteFile(fileName);
  
  // Delete record from database
  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
