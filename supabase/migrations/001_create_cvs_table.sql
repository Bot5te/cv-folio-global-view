
-- Create cvs table
CREATE TABLE cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  nationality TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'image')),
  file_url TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for CV files
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-files', 'cv-files', true);

-- Create policy for public access to cv-files bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'cv-files');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cv-files');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'cv-files');
