
import { useState, useEffect } from 'react';
import { getCVsFromStorage, saveCVToStorage, deleteCVFromStorage, CVData } from '@/lib/localStorage';

export interface CV {
  id: string;
  name: string;
  age: number;
  nationality: string;
  fileData: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
}

export const useCVDatabase = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCVs = async () => {
    try {
      setLoading(true);
      const data = getCVsFromStorage();
      setCvs(data);
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCV = async (cvData: {
    name: string;
    age: number;
    nationality: string;
    file: File;
  }) => {
    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(cvData.file);
      });

      const fileType = cvData.file.type.includes('pdf') ? 'pdf' : 'image';
      
      const newCVData = {
        name: cvData.name,
        age: cvData.age,
        nationality: cvData.nationality,
        fileData: fileData,
        fileName: cvData.file.name,
        fileType: fileType as 'pdf' | 'image',
        uploadDate: new Date()
      };

      const id = saveCVToStorage(newCVData);
      
      const newCV: CV = {
        id,
        ...newCVData
      };

      setCvs(prev => [...prev, newCV]);
      return newCV;
    } catch (error) {
      console.error('Error adding CV:', error);
      throw error;
    }
  };

  const deleteCV = async (id: string) => {
    try {
      deleteCVFromStorage(id);
      setCvs(prev => prev.filter(cv => cv.id !== id));
    } catch (error) {
      console.error('Error deleting CV:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCVs();
  }, []);

  return {
    cvs,
    loading,
    addCV,
    deleteCV,
    loadCVs
  };
};
