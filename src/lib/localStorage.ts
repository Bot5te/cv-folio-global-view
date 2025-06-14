
export interface CVData {
  id: string;
  name: string;
  age: number;
  nationality: string;
  fileData: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
}

const STORAGE_KEY = 'cv_management_data';

export const getCVsFromStorage = (): CVData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    return parsed.map((cv: any) => ({
      ...cv,
      uploadDate: new Date(cv.uploadDate)
    }));
  } catch (error) {
    console.error('Error loading CVs from storage:', error);
    return [];
  }
};

export const saveCVToStorage = (cvData: Omit<CVData, 'id'>): string => {
  try {
    const existingCVs = getCVsFromStorage();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const newCV: CVData = {
      id,
      ...cvData
    };
    
    const updatedCVs = [...existingCVs, newCV];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCVs));
    
    return id;
  } catch (error) {
    console.error('Error saving CV to storage:', error);
    throw error;
  }
};

export const deleteCVFromStorage = (id: string): boolean => {
  try {
    const existingCVs = getCVsFromStorage();
    const updatedCVs = existingCVs.filter(cv => cv.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCVs));
    return true;
  } catch (error) {
    console.error('Error deleting CV from storage:', error);
    throw error;
  }
};
