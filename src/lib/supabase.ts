
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hmcfchvqfudkerlifzfq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY2ZjaHZxZnVka2VybGlmemZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTA4OTAsImV4cCI6MjA2NTQ4Njg5MH0.LqfFjgtqx1rTbcm7pJ3TQvLXhqv5xC1gVThuosiKoi4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface CV {
  id: string;
  name: string;
  age: number;
  nationality: string;
  file_name: string;
  file_type: 'pdf' | 'image';
  file_path: string;
  upload_date: string;
}

export const uploadCV = async (cv: Omit<CV, 'id' | 'upload_date' | 'file_path'>, file: File) => {
  try {
    // Upload file to storage
    const fileExtension = file.name.split('.').pop()
    const fileName = `${cv.name}_${Date.now()}.${fileExtension}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv-files')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Save CV data to database
    const { data, error } = await supabase
      .from('cvs')
      .insert({
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        file_name: cv.file_name,
        file_type: cv.file_type,
        file_path: uploadData.path
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error uploading CV:', error)
    throw error
  }
}

export const getCVs = async (): Promise<CV[]> => {
  try {
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching CVs:', error)
    throw error
  }
}

export const deleteCV = async (id: string, filePath: string) => {
  try {
    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('cv-files')
      .remove([filePath])

    if (storageError) throw storageError

    // Delete CV record from database
    const { error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting CV:', error)
    throw error
  }
}

export const getFileUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('cv-files')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}
