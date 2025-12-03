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
  FaInfoCircle,
  FaLightbulb
} from 'react-icons/fa';
import toast from 'react-hot-toast';
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
  
  const { mutate: createVendor, isLoading: isCreating, error: apiError } = useCreateVendor();

  // ریست فرم وقتی مدال باز یا بسته می‌شود
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', address: '', phone: '', email: '' });
      setLocalError('');
    }
  }, [isOpen]);

  // ترجمه خطای سرور به فارسی - **آپدیت برای فرمت جدید خطا**
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
      
      // **خطای تکراری بودن نام وندور با فرمت جدید: 'Vendor Name "تست" already exists.'**
      if (typeof detail === 'string' && detail.includes('already exists')) {
        // استخراج نام وندور از پیام خطا - **آپدیت برای فرمت جدید**
        const match = detail.match(/Vendor Name "([^"]+)"/);
        const vendorName = match ? match[1] : formData.name;
        return `نام وندور "${vendorName}" تکراری است. لطفاً نام دیگری انتخاب کنید.`;
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
      toast.error('نام وندور الزامی است', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '14px',
          direction: 'rtl',
          textAlign: 'right',
        },
        icon: '❌',
      });
      return;
    }
    
    if (formData.name.trim().length < 2) {
      setLocalError('نام وندور باید حداقل ۲ حرف داشته باشد');
      toast.error('نام وندور باید حداقل ۲ حرف داشته باشد', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '14px',
          direction: 'rtl',
          textAlign: 'right',
        },
        icon: '❌',
      });
      return;
    }
    
    // اعتبارسنجی ایمیل (اگر وارد شده)
    if (formData.email && !validateEmail(formData.email)) {
      setLocalError('ایمیل وارد شده معتبر نیست');
      toast.error('ایمیل وارد شده معتبر نیست', {
        position: 'top-center',
        duration: 3000,
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '14px',
          direction: 'rtl',
          textAlign: 'right',
        },
        icon: '❌',
      });
      return;
    }
    
    setLocalError('');
    setIsSubmitting(true);
    
    // نمایش toast در حال بارگذاری
    const loadingToast = toast.loading('در حال ایجاد وندور جدید...', {
      position: 'top-center',
      duration: Infinity,
    });
    
    // ایجاد وندور در سرور
    createVendor(formData, {
      onSuccess: (newVendor) => {
        console.log('✅ وندور با موفقیت ایجاد شد:', newVendor);
        
        // بستن toast بارگذاری
        toast.dismiss(loadingToast);
        
        // نمایش toast موفقیت
        toast.success(`وندور "${newVendor.name}" با موفقیت ایجاد شد`, {
          position: 'top-center',
          duration: 4000,
          style: {
            background: '#10b981',
            color: 'white',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '14px',
            direction: 'rtl',
            textAlign: 'right',
          },
          icon: '✅',
        });
        
        // اطلاع به کامپوننت والد برای انتخاب وندور
        if (onAddVendor) {
          onAddVendor(newVendor);
        }
        
        // بستن مدال
        setTimeout(() => {
          setFormData({ name: '', address: '', phone: '', email: '' });
          setIsSubmitting(false);
          onClose();
        }, 500);
      },
      onError: (error) => {
        console.error('❌ خطا در ایجاد وندور:', error);
        
        // بستن toast بارگذاری
        toast.dismiss(loadingToast);
        
        // ترجمه خطا به فارسی
        const userErrorMessage = translateError(error);
        setLocalError(userErrorMessage);
        
        // نمایش toast خطا
        toast.error(userErrorMessage, {
          position: 'top-center',
          duration: 5000,
          style: {
            background: '#ef4444',
            color: 'white',
            borderRadius: '10px',
            padding: '16px',
            fontSize: '14px',
            direction: 'rtl',
            textAlign: 'right',
          },
          icon: '❌',
        });
        
        // **پیشنهادات برای خطای تکراری**
        // if (userErrorMessage.includes('تکراری')) {
        //   setTimeout(() => {
        //     toast('💡 پیشنهاد: نام دیگری انتخاب کنید یا از شماره/پسوند استفاده نمایید', {
        //       position: 'top-center',
        //       duration: 6000,
        //       style: {
        //         background: '#f59e0b',
        //         color: 'white',
        //         borderRadius: '10px',
        //         padding: '16px',
        //         fontSize: '13px',
        //         direction: 'rtl',
        //         textAlign: 'right',
        //       },
        //       icon: '💡',
        //     });
        //   }, 1000);
        // }
        
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
      setFormData({ name: '', address: '', phone: '', email: '' });
      setLocalError('');
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