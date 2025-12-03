// src/utils/toastConfig.js
import toast from 'react-hot-toast';

// تنظیمات پیش‌فرض برای toast - موقعیت بالا-وسط
export const toastConfig = {
  position: 'top-center',  // تغییر به top-center
  duration: 4000,
  style: {
    borderRadius: '10px',
    padding: '16px',
    fontSize: '14px',
    direction: 'rtl',
    textAlign: 'right',
  },
};

// توابع کمکی برای انواع toast

// موفقیت
export const showSuccessToast = (message) => {
  return toast.success(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: '#10b981',
      color: 'white',
    },
    icon: '✅',
  });
};

// خطا
export const showErrorToast = (message) => {
  return toast.error(message, {
    ...toastConfig,
    duration: 5000,
    style: {
      ...toastConfig.style,
      background: '#ef4444',
      color: 'white',
    },
    icon: '❌',
  });
};

// اخطار
export const showWarningToast = (message) => {
  return toast(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: '#f59e0b',
      color: 'white',
    },
    icon: '⚠️',
  });
};

// اطلاع
export const showInfoToast = (message) => {
  return toast(message, {
    ...toastConfig,
    style: {
      ...toastConfig.style,
      background: '#3b82f6',
      color: 'white',
    },
    icon: 'ℹ️',
  });
};

// بارگذاری
export const showLoadingToast = (message) => {
  return toast.loading(message, {
    ...toastConfig,
    duration: Infinity,
  });
};