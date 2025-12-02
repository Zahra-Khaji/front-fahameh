// src/components/ui/AddVendorModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaUserTie, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaLightbulb
} from 'react-icons/fa';
import Button from './Button';
import { useCreateVendor } from '../../hooks/useCreateVendor';

const AddVendorModal = ({ isOpen, onClose, onAddVendor }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });
  
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const { mutate: createVendor, isLoading: isCreating, error: apiError } = useCreateVendor();

  // ریست فرم وقتی مدال باز یا بسته می‌شود
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', address: '', phone: '', email: '' });
      setLocalError('');
      setSuccessMessage('');
    }
  }, [isOpen]);

  // ترجمه خطای سرور به فارسی
  const translateError = (error) => {
    if (!error) return 'خطای نامشخص';
    
    // اگر خطا از قبل ترجمه شده باشد
    if (typeof error === 'string') {
      if (error.includes('وندور') || error.includes('تکراری')) {
        return error;
      }
    }
    
    // بررسی خطای API
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // خطای تکراری بودن نام وندور
      if (typeof detail === 'string' && detail.includes('already exists')) {
        // استخراج نام وندور از پیام خطا
        const match = detail.match(/name "([^"]+)"/);
        const vendorName = match ? match[1] : formData.name;
        return `وندور "${vendorName}" از قبل در سیستم وجود دارد. لطفاً نام دیگری انتخاب کنید.`;
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
          return 'این وندور از قبل وجود دارد.';
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
    return error?.message || 'خطای نامشخص در ایجاد وندور';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // اعتبارسنجی اولیه
    if (!formData.name.trim()) {
      setLocalError('نام وندور الزامی است');
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setLocalError('نام وندور باید حداقل ۲ حرف داشته باشد');
      return;
    }
    
    setLocalError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    // ایجاد وندور در سرور
    createVendor(formData, {
      onSuccess: (newVendor) => {
        console.log('✅ وندور با موفقیت ایجاد شد:', newVendor);
        
        // نمایش پیام موفقیت
        setSuccessMessage(`وندور "${newVendor.name}" با موفقیت ایجاد شد`);
        
        // اطلاع به کامپوننت والد برای انتخاب وندور
        if (onAddVendor) {
          onAddVendor(newVendor);
        }
        
        // بستن خودکار مدال بعد از ۱.۵ ثانیه
        setTimeout(() => {
          // ریست فرم
          setFormData({ name: '', address: '', phone: '', email: '' });
          setSuccessMessage('');
          setIsSubmitting(false);
          onClose();
        }, 1500);
      },
      onError: (error) => {
        console.error('❌ خطا در ایجاد وندور:', error);
        
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
      setFormData({ name: '', address: '', phone: '', email: '' });
      setLocalError('');
      setSuccessMessage('');
      onClose();
    }
  };

  // تابع برای فرمت شماره تلفن
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // فرمت: 0912 345 6789
    if (value.length > 4 && value.length <= 7) {
      value = value.replace(/(\d{4})(\d+)/, '$1 $2');
    } else if (value.length > 7) {
      value = value.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3');
    }
    
    setFormData(prev => ({
      ...prev,
      phone: value
    }));
    
    if (localError) {
      setLocalError('');
    }
  };

  // تابع برای اعتبارسنجی ایمیل
  const validateEmail = (email) => {
    if (!email) return true; // خالی باشد مشکلی ندارد
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || isCreating;
  const isEmailValid = validateEmail(formData.email);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaUserTie className="text-green-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">افزودن وندور جدید</h3>
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
                        <li>نام دیگری برای وندور انتخاب کنید</li>
                        <li>از شماره یا پسوند استفاده کنید (مثال: {formData.name} ۲)</li>
                        <li>از نام شرکت به جای نام شخص استفاده کنید</li>
                        <li>مخفف یا نام تجاری متفاوتی استفاده کنید</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* نام وندور */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              نام وندور *
    
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ${
                localError ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="نام کامل وندور یا شرکت را وارد کنید"
              required
              disabled={isLoading}
              autoFocus
              maxLength={100}
            />
           
          </div>

          {/* آدرس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaMapMarkerAlt className="text-green-500 text-sm" />
              آدرس (اختیاری)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white disabled:bg-gray-100"
              placeholder="آدرس کامل وندور"
              disabled={isLoading}
              maxLength={200}
            />
          
          </div>

          {/* شماره تلفن */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaPhone className="text-green-500 text-sm" />
              شماره تلفن (اختیاری)
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100"
              placeholder="مانند: 09121234569"
              disabled={isLoading}
              maxLength={13}
            />
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaEnvelope className="text-green-500 text-sm" />
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100 ${
                formData.email && !isEmailValid ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ایمیل معتبر وارد کنید"
              disabled={isLoading}
            />
            {formData.email && !isEmailValid && (
              <p className="text-red-500 text-xs mt-1">ایمیل وارد شده معتبر نیست</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="success"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={!formData.name.trim() || formData.name.trim().length < 2 || isLoading}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : 'ثبت وندور'}
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

export default AddVendorModal;