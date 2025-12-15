// src/hooks/useLogout.js
import { useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const useLogout = () => {
  const [isPending, setIsPending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const logout = async () => {
    setIsPending(true);

    try {
      // نمایش toast در حال بارگذاری
      const loadingToast = toast.loading('در حال خروج از سیستم...', {
        position: 'top-center',
      });

      // فراخوانی API خروج
      await authService.logout();
      
      // بستن toast بارگذاری
      toast.dismiss(loadingToast);
      
      // نمایش toast موفقیت
      toast.success('با موفقیت از سیستم خارج شدید', {
        position: 'top-center',
        duration: 2000,
        icon: '✅',
      });
      
      // هدایت به صفحه login بعد از 1.5 ثانیه
      setTimeout(() => {
        window.location.href = 'http://localhost:5173/login';
      }, 1500);
      
    } catch (err) {
      console.error("خطا در خروج:", err);
      
      // نمایش toast خطا
      toast.error('خطا در خروج از سیستم', {
        position: 'top-center',
        duration: 3000,
        icon: '❌',
      });
      
      // هدایت به صفحه login حتی در صورت خطا
      setTimeout(() => {
        window.location.href = 'http://localhost:5173/login';
      }, 1500);
      
    } finally {
      setIsPending(false);
      setShowConfirmModal(false);
    }
  };

  // نمایش مدال تاییدیه
  const handleLogoutWithConfirmation = () => {
    setShowConfirmModal(true);
  };

  // تایید خروج
  const confirmLogout = () => {
    logout();
  };

  // لغو خروج
  const cancelLogout = () => {
    setShowConfirmModal(false);
    toast('خروج لغو شد', {
      position: 'top-center',
      duration: 2000,
      icon: '⚠️',
    });
  };

  // خروج مستقیم بدون تاییدیه
  const quickLogout = () => {
    logout();
  };

  return {
    logout: quickLogout,
    handleLogoutWithConfirmation,
    confirmLogout,
    cancelLogout,
    isPending,
    showConfirmModal,
    setShowConfirmModal
  };
};

export default useLogout;