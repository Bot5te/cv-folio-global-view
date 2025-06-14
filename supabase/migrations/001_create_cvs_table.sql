
-- Create CVs table
CREATE TABLE cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 65),
  nationality TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-files', 'cv-files', true);

-- Set up RLS (Row Level Security)
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to CVs
CREATE POLICY "Allow public read access" ON cvs FOR SELECT USING (true);

-- Allow public insert access to CVs  
CREATE POLICY "Allow public insert access" ON cvs FOR INSERT WITH CHECK (true);

-- Allow public delete access to CVs
CREATE POLICY "Allow public delete access" ON cvs FOR DELETE USING (true);

-- Set up storage policies
CREATE POLICY "Allow public read access to cv files" ON storage.objects FOR SELECT USING (bucket_id = 'cv-files');
CREATE POLICY "Allow public insert access to cv files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cv-files');
CREATE POLICY "Allow public delete access to cv files" ON storage.objects FOR DELETE USING (bucket_id = 'cv-files');
