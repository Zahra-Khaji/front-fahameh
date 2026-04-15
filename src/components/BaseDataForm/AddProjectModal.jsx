// src/components/ui/AddProjectModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBuilding, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaKey
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { useCreateProject } from '../../hooks/useCreateProject';
import { showSuccessToast, showErrorToast, showLoadingToast } from '../../utils/toastConfig';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    project_code: '',
  });
  
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createProject, isLoading: isCreating, error: apiError } = useCreateProject();

  // ریست فرم وقتی مدال باز یا بسته می‌شود
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', project_code: '' });
      setLocalError('');
    }
  }, [isOpen]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'نام پروژه الزامی است';
    }
    
    if (formData.name.trim().length < 2) {
      return 'نام پروژه باید حداقل ۲ حرف داشته باشد';
    }
    
    if (!formData.project_code.trim()) {
      return 'کد پروژه الزامی است';
    }
    
    if (formData.project_code.trim().length < 1) {
      return 'کد پروژه باید حداقل ۱ کاراکتر داشته باشد';
    }
    
    // اعتبارسنجی کد پروژه (فقط حروف، اعداد و خط تیره مجاز)
    const codeRegex = /^[A-Za-z0-9\-_]+$/;
    if (!codeRegex.test(formData.project_code)) {
      return 'کد پروژه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و _ باشد';
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // برای کد پروژه - فقط حذف فاصله
    if (name === 'project_code') {
      const cleanedValue = value.replace(/\s+/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // پاک کردن خطا هنگام تایپ
    if (localError) {
      setLocalError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // اعتبارسنجی فرم
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      showErrorToast(validationError);
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    // نمایش toast در حال بارگذاری
    const loadingToast = showLoadingToast('در حال ایجاد پروژه جدید...');
    
    // **ارسال دقیقاً همان چیزی که کاربر تایپ کرده**
    const apiData = {
      Title: formData.name.trim(),
      project_code: formData.project_code.trim() // همان چیزی که کاربر تایپ کرده
    };
    
    console.log('📤 Sending project data to API:', apiData);
    
    // ایجاد پروژه در سرور
    createProject(apiData, {
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
          setFormData({ name: '', project_code: '' });
          setIsSubmitting(false);
          onClose();
        }, 500);
      },
      onError: (error) => {
        console.error('❌ خطا در ایجاد پروژه:', error);
        
        // بستن toast بارگذاری
        toast.dismiss(loadingToast);
        
        // مدیریت خطا
        let errorMessage = 'خطا در ایجاد پروژه';
        
        if (error?.response?.data?.detail) {
          const detail = error.response.data.detail;
          
          // خطای تکراری بودن نام پروژه
          if (typeof detail === 'string') {
            if (detail.includes('already exists')) {
              errorMessage = `نام پروژه "${formData.name}" تکراری است. لطفاً نام دیگری انتخاب کنید.`;
            } else if (detail.includes('project_code')) {
              errorMessage = 'کد پروژه تکراری است. لطفاً کد دیگری انتخاب کنید.';
            } else {
              errorMessage = detail;
            }
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setLocalError(errorMessage);
        showErrorToast(errorMessage);
        
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

  const handleClose = () => {
    if (!isSubmitting && !isCreating) {
      setFormData({ name: '', project_code: '' });
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
          {/* نمایش خطا در مدال */}
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
              <FaBuilding className="ml-1 text-blue-500" />
              نام پروژه *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                localError && !formData.name.trim() ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="نام کامل پروژه را وارد کنید"
              required
              disabled={isLoading}
              autoFocus
              maxLength={100}
            />
            {/* <div className="mt-1 text-xs text-gray-500">
              حداقل ۲ حرف، حداکثر ۱۰۰ کاراکتر
            </div> */}
          </div>

          {/* کد پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaKey className="ml-1 text-green-500" />
              کد پروژه *
            </label>
            <input
              type="text"
              name="project_code"
              value={formData.project_code}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ${
                localError && !formData.project_code.trim() ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder=""
              required
              disabled={isLoading}
              maxLength={20}
              dir="ltr"
            />
            <div className="mt-1 text-xs text-gray-500">
              حروف انگلیسی، اعداد، خط تیره و _ 
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={isLoading || !formData.name.trim() || !formData.project_code.trim()}
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