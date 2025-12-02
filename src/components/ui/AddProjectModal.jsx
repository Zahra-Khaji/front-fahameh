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
import Button from './Button';
import { useCreateProject } from '../../hooks/useCreateProject';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    subProject: ''
  });
  
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { mutate: createProject, isLoading: isCreating, error: apiError } = useCreateProject();

  // ریست فرم وقتی مدال باز یا بسته می‌شود
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', abbreviation: '', subProject: '' });
      setLocalError('');
      setSuccessMessage('');
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
        return `پروژه "${projectName}" از قبل در سیستم وجود دارد. لطفاً نام دیگری انتخاب کنید.`;
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
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setLocalError('نام پروژه باید حداقل ۲ حرف داشته باشد');
      return;
    }
    
    setLocalError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    // ایجاد پروژه در سرور
    createProject(formData, {
      onSuccess: (newProject) => {
        console.log('✅ پروژه با موفقیت ایجاد شد:', newProject);
        
        // نمایش پیام موفقیت
        setSuccessMessage(`پروژه "${newProject.name}" با موفقیت ایجاد شد`);
        
        // اطلاع به کامپوننت والد برای انتخاب پروژه
        if (onAddProject) {
          onAddProject(newProject);
        }
        
        // بستن خودکار مدال بعد از ۱.۵ ثانیه
        setTimeout(() => {
          // ریست فرم
          setFormData({ name: '', abbreviation: '', subProject: '' });
          setSuccessMessage('');
          setIsSubmitting(false);
          onClose();
        }, 1500);
      },
      onError: (error) => {
        console.error('❌ خطا در ایجاد پروژه:', error);
        
        // ترجمه خطا به فارسی
        const userErrorMessage = translateError(error);
        setLocalError(userErrorMessage);
        
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
    
    // پاک کردن پیام موفقیت
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating) {
      setFormData({ name: '', abbreviation: '', subProject: '' });
      setLocalError('');
      setSuccessMessage('');
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
          {/* نمایش پیام موفقیت */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <FaCheckCircle className="h-5 w-5 text-green-400 ml-2" />
                <div>
                  <strong className="font-semibold">موفقیت:</strong>
                  <p className="mt-1">{successMessage}</p>
                  <p className="text-xs mt-1">در حال بستن پنجره...</p>
                </div>
              </div>
            </div>
          )}

          {/* نمایش خطا */}
          {localError && !successMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-red-400 ml-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-semibold">خطا:</strong>
                  <p className="mt-1">{localError}</p>
                  
                  {/* پیشنهادات برای خطای تکراری */}
                  {localError.includes('وجود دارد') && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <div className="flex items-center text-red-600">
                        <FaLightbulb className="h-4 w-4 ml-1" />
                        <span className="text-xs font-semibold">پیشنهاد:</span>
                      </div>
                      <ul className="list-disc mr-4 mt-1 space-y-1 text-xs">
                        <li>نام دیگری برای پروژه انتخاب کنید</li>
                        <li>از شماره یا پسوند استفاده کنید (مثال: {formData.name} ۲)</li>
                        <li>از مخفف متفاوتی استفاده کنید</li>
                        <li>نام پروژه را با جزئیات بیشتری بنویسید</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* نام پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              نام پروژه *
              {/* <span className="text-red-500 mr-1">*</span> */}
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
            {/* <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">حداقل ۲ حرف</span>
              <span className="text-xs text-gray-500">{formData.name.length}/100</span>
            </div> */}
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