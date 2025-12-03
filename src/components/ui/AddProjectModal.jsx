// src/components/ui/AddProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBuilding, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaLightbulb,
  FaCheckCircle,
  FaInfoCircle
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from './Button';
import { useCreateProject } from '../../hooks/useCreateProject';
import { showSuccessToast, showErrorToast, showLoadingToast } from '../../utils/toastConfig';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    subProject: ''
  });
  
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createProject, isLoading: isCreating, error: apiError } = useCreateProject();

  // ریست فرم وقتی مدال باز یا بسته می‌شود
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', abbreviation: '', subProject: '' });
      setLocalError('');
    }
  }, [isOpen]);

  // ترجمه خطای سرور به فارسی
  const translateError = (error) => {
    if (!error) return 'خطای نامشخص';
    
    // اگر خطا از قبل ترجمه شده باشد
    if (typeof error === 'string') {
      if (error.includes('پروژه') || error.includes('تکراری')) {
        return error;
      }
    }
    
    // بررسی خطای API
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // خطای تکراری بودن نام پروژه
      if (typeof detail === 'string' && detail.includes('already exists')) {
        // استخراج نام پروژه از پیام خطا
        const match = detail.match(/Title "([^"]+)"/);
        const projectName = match ? match[1] : formData.name;
        return `نام پروژه "${projectName}" تکراری است.`;
      }
      
      // سایر پیام‌های خطا
      return detail;
    }
    
    // خطاهای HTTP
    if (error?.response) {
      const { status } = error.response;
      switch (status) {
        case 400:
          return 'درخواست نامعتبر است. لطفاً اطلاعات را بررسی کنید.';
        case 401:
          return 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
        case 409:
          return 'این پروژه از قبل وجود دارد.';
        case 500:
          return 'خطای سرور. لطفاً دوباره تلاش کنید.';
        default:
          return `خطای سرور (کد: ${status})`;
      }
    }
    
    // خطای شبکه
    if (error?.request) {
      return 'ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید.';
    }
    
    // خطای عمومی
    return error?.message || 'خطای نامشخص در ایجاد پروژه';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // اعتبارسنجی اولیه
    if (!formData.name.trim()) {
      setLocalError('نام پروژه الزامی است');
      showErrorToast('نام پروژه الزامی است');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setLocalError('نام پروژه باید حداقل ۲ حرف داشته باشد');
      showErrorToast('نام پروژه باید حداقل ۲ حرف داشته باشد');
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    // نمایش toast در حال بارگذاری
    const loadingToast = showLoadingToast('در حال ایجاد پروژه جدید...');
    
    // ایجاد پروژه در سرور
    createProject(formData, {
      onSuccess: (newProject) => {
        console.log('✅ پروژه با موفقیت ایجاد شد:', newProject);
        
        // بستن toast بارگذاری
        toast.dismiss(loadingToast);
        
        // نمایش toast موفقیت
        showSuccessToast(`پروژه "${newProject.name}" با موفقیت ایجاد شد`);
        
        // اطلاع به کامپوننت والد برای انتخاب پروژه
        if (onAddProject) {
          onAddProject(newProject);
        }
        
        // بستن مدال
        setTimeout(() => {
          setFormData({ name: '', abbreviation: '', subProject: '' });
          setIsSubmitting(false);
          onClose();
        }, 500);
      },
      onError: (error) => {
        console.error('❌ خطا در ایجاد پروژه:', error);
        
        // بستن toast بارگذاری
        toast.dismiss(loadingToast);
        
        // ترجمه خطا به فارسی
        const userErrorMessage = translateError(error);
        setLocalError(userErrorMessage);
        
        // نمایش toast خطا
        showErrorToast(userErrorMessage);
        
        // فوکوس روی فیلد نام برای اصلاح
        setTimeout(() => {
          const nameInput = document.querySelector('input[name="name"]');
          if (nameInput) {
            nameInput.focus();
            nameInput.select();
          }
        }, 50);
        
        setIsSubmitting(false);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // پاک کردن خطا هنگام تایپ
    if (localError) {
      setLocalError('');
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating) {
      setFormData({ name: '', abbreviation: '', subProject: '' });
      setLocalError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || isCreating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">افزودن پروژه جدید</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            title="بستن"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* نمایش خطا در مدال (اختیاری) */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-red-400 ml-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-semibold">خطا:</strong>
                  <p className="mt-1">{localError}</p>
                  
                
                </div>
              </div>
            </div>
          )}

          {/* نام پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              نام پروژه *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                localError ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="نام کامل پروژه را وارد کنید"
              required
              disabled={isLoading}
              autoFocus
              maxLength={100}
            />
          </div>

          {/* مخفف */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مخفف (اختیاری)
            </label>
            <input
              type="text"
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
              placeholder="مخفف پروژه (اختیاری)"
              disabled={isLoading}
              maxLength={20}
            />
          </div>

          {/* ساب پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ساب پروژه (اختیاری)
            </label>
            <input
              type="text"
              name="subProject"
              value={formData.subProject}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
              placeholder="ساب پروژه (اختیاری)"
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={!formData.name.trim() || formData.name.trim().length < 2 || isLoading}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : 'ثبت پروژه'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              انصراف
            </Button>
          </div>
          
  
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;