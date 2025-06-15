import React, { useState, useRef } from 'react';
import { Plus, FileText, Image, Trash2, Download, Users, Eye, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCVDatabase, CV } from '@/hooks/useCVDatabase';

interface CV {
  id: string;
  name: string;
  age: number;
  nationality: string;
  file: File;
  fileType: 'pdf' | 'image';
  uploadDate: Date;
}

const nationalities = [
  { value: 'philippines', label: 'الفلبين', flag: '🇵🇭' },
  { value: 'ethiopia', label: 'إثيوبيا', flag: '🇪🇹' },
  { value: 'kenya', label: 'كينيا', flag: '🇰🇪' }
];

const Index = () => {
  const { cvs, loading, addCV, deleteCV } = useCVDatabase();
  const [selectedNationality, setSelectedNationality] = useState<string>('all');
  const [workerName, setWorkerName] = useState('');
  const [workerAge, setWorkerAge] = useState('');
  const [uploadNationality, setUploadNationality] = useState('');
  const [previewFile, setPreviewFile] = useState<CV | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePasswordCheck = () => {
    if (passwordInput === '33356') {
      setIsAdmin(true);
      setShowPasswordDialog(false);
      setPasswordInput('');
      toast({
        title: 'تم الدخول بنجاح',
        description: 'تم تفعيل وضع الأدمن'
      });
    } else {
      toast({
        title: 'خطأ',
        description: 'كلمة المرور غير صحيحة',
        variant: 'destructive'
      });
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast({
      title: 'تم تسجيل الخروج',
      description: 'تم إلغاء وضع الأدمن'
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !workerName || !workerAge || !uploadNationality) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم العامل والسن واختيار الجنسية وتحديد الملف',
        variant: 'destructive'
      });
      return;
    }

    const age = parseInt(workerAge);
    if (isNaN(age) || age < 18 || age > 65) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سن صحيح (18-65)',
        variant: 'destructive'
      });
      return;
    }

    const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
    const newCV: CV = {
      id: Date.now().toString(),
      name: workerName,
      age: age,
      nationality: uploadNationality,
      file: file,
      fileType: fileType,
      uploadDate: new Date()
    };

    await addCV(newCV);
    setWorkerName('');
    setWorkerAge('');
    setUploadNationality('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteCV = async (id: string) => {
    await deleteCV(id);
  };

  const handleDownloadCV = (cv: CV) => {
    const url = URL.createObjectURL(cv.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cv.name}_CV.${cv.fileType === 'pdf' ? 'pdf' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewFile = (cv: CV) => {
    setPreviewFile(cv);
  };

  const filteredCvs = selectedNationality === 'all' 
    ? cvs 
    : cvs.filter(cv => cv.nationality === selectedNationality);

  const getCVStats = () => {
    const stats = nationalities.map(nat => ({
      ...nat,
      count: cvs.filter(cv => cv.nationality === nat.value).length
    }));
    return stats;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/77c6b850-0a48-44da-9074-b3f7e0b941b9.png" 
              alt="إنجاز وجدارة للاستقدام العمالة المنزلية" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            إنجاز وجدارة للاستقدام العمالة المنزلية
          </h1>
          <p className="text-gray-600 text-lg">
            نظام متكامل لإدارة سيفيات العمال حسب الجنسية - متصل بقاعدة بيانات MongoDB
          </p>
          {isAdmin && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="destructive">
                وضع الأدمن مفعل
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                تسجيل خروج
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">المجموع الكلي</p>
                  <p className="text-3xl font-bold">{cvs.length}</p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          {getCVStats().map(stat => (
            <Card key={stat.value} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                  </div>
                  <div className="text-3xl">{stat.flag}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload Section - Only visible for admin */}
        {isAdmin && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plus className="h-6 w-6" />
                إضافة سيفي جديد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <Label htmlFor="worker-name">اسم العامل</Label>
                  <Input
                    id="worker-name"
                    type="text"
                    placeholder="أدخل اسم العامل"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="text-right"
                  />
                </div>
                
                <div>
                  <Label htmlFor="worker-age">السن</Label>
                  <Input
                    id="worker-age"
                    type="number"
                    placeholder="السن"
                    min="18"
                    max="65"
                    value={workerAge}
                    onChange={(e) => setWorkerAge(e.target.value)}
                    className="text-right"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nationality">الجنسية</Label>
                  <Select value={uploadNationality} onValueChange={setUploadNationality}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map(nat => (
                        <SelectItem key={nat.value} value={nat.value}>
                          <div className="flex items-center gap-2">
                            <span>{nat.flag}</span>
                            <span>{nat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cv-file">ملف السيفي</Label>
                  <Input
                    id="cv-file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center">
                يمكنك رفع ملفات PDF أو صور (JPG, PNG) - سيتم حفظها في قاعدة بيانات MongoDB
              </p>
            </CardContent>
          </Card>
        )}

        {/* Filter Section */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label>تصفية حسب الجنسية:</Label>
              <Select value={selectedNationality} onValueChange={setSelectedNationality}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الجنسيات</SelectItem>
                  {nationalities.map(nat => (
                    <SelectItem key={nat.value} value={nat.value}>
                      <div className="flex items-center gap-2">
                        <span>{nat.flag}</span>
                        <span>{nat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* CVs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCvs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {selectedNationality === 'all' 
                  ? 'لا توجد سيفيات مرفوعة بعد' 
                  : `لا توجد سيفيات لـ ${nationalities.find(n => n.value === selectedNationality)?.label}`
                }
              </p>
            </div>
          ) : (
            filteredCvs.map(cv => {
              const nationality = nationalities.find(n => n.value === cv.nationality);
              return (
                <Card key={cv.id} className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {cv.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          السن: {cv.age} سنة
                        </p>
                        <Badge variant="secondary" className="mb-2">
                          <span className="mr-1">{nationality?.flag}</span>
                          {nationality?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {cv.fileType === 'pdf' ? (
                          <FileText className="h-6 w-6 text-red-500" />
                        ) : (
                          <Image className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4">
                      تم الرفع: {cv.uploadDate.toLocaleDateString('ar-SA')}
                    </p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreviewFile(cv)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 ml-1" />
                            معاينة
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                          <DialogHeader>
                            <DialogTitle className="text-right">
                              معاينة سيفي - {cv.name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            {cv.fileType === 'pdf' ? (
                              <iframe
                                src={URL.createObjectURL(cv.file)}
                                className="w-full h-96 border rounded"
                                title={`CV - ${cv.name}`}
                              />
                            ) : (
                              <img
                                src={URL.createObjectURL(cv.file)}
                                alt={`CV - ${cv.name}`}
                                className="w-full max-h-96 object-contain rounded"
                              />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCV(cv)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 ml-1" />
                        تحميل
                      </Button>
                      
                      {isAdmin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCV(cv.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Control Panel Button - Fixed at bottom */}
        {!isAdmin && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg"
                  size="lg"
                >
                  <Settings className="h-5 w-5 ml-2" />
                  لوحة التحكم
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-right">دخول لوحة التحكم</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="أدخل كلمة المرور"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordCheck()}
                      className="text-right"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePasswordCheck}
                      className="flex-1"
                    >
                      دخول
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordDialog(false);
                        setPasswordInput('');
                      }}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
