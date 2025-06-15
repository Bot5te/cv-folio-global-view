
import { useState, useEffect } from 'react';
import { saveCVToMongoDB, getCVsFromMongoDB, deleteCVFromMongoDB, CVDocument } from '@/lib/mongodb';
import { useToast } from '@/hooks/use-toast';

export interface CV {
  id: string;
  name: string;
  age: number;
  nationality: string;
  file: File;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
}

export const useCVDatabase = () => {
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Convert base64 to File
  const base64ToFile = (base64: string, fileName: string, fileType: string): File => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], fileName, { type: mime });
  };

  // Load CVs from MongoDB
  const loadCVs = async () => {
    try {
      setLoading(true);
      const mongoDBCVs = await getCVsFromMongoDB();
      const convertedCVs: CV[] = mongoDBCVs.map((doc: CVDocument) => ({
        id: doc.id,
        name: doc.name,
        age: doc.age,
        nationality: doc.nationality,
        file: base64ToFile(doc.fileData, doc.fileName, doc.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
        fileType: doc.fileType,
        uploadDate: new Date(doc.uploadDate)
      }));
      setCvs(convertedCVs);
    } catch (error) {
      console.error('Error loading CVs:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات من قاعدة البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new CV
  const addCV = async (cv: CV) => {
    try {
      const fileData = await fileToBase64(cv.file);
      const cvDocument: Omit<CVDocument, '_id'> = {
        id: cv.id,
        name: cv.name,
        age: cv.age,
        nationality: cv.nationality,
        fileName: cv.file.name,
        fileType: cv.fileType,
        fileData: fileData,
        uploadDate: cv.uploadDate
      };

      await saveCVToMongoDB(cvDocument);
      setCvs(prev => [...prev, cv]);
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حفظ السيفي في قاعدة البيانات'
      });
    } catch (error) {
      console.error('Error adding CV:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ السيفي في قاعدة البيانات',
        variant: 'destructive'
      });
    }
  };

  // Delete CV
  const deleteCV = async (id: string) => {
    try {
      const success = await deleteCVFromMongoDB(id);
      if (success) {
        setCvs(prev => prev.filter(cv => cv.id !== id));
        toast({
          title: 'تم الحذف',
          description: 'تم حذف السيفي من قاعدة البيانات'
        });
      } else {
        throw new Error('Failed to delete CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في حذف السيفي من قاعدة البيانات',
        variant: 'destructive'
      });
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
    refreshCVs: loadCVs
  };
};
