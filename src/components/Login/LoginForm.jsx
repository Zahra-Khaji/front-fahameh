// src/components/LoginForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaUser, FaLock } from 'react-icons/fa';

const loginSchema = z.object({
  user: z.string().min(1, 'لطفاً یک کاربر انتخاب کنید'),
  password: z.string().min(1, 'رمز عبور الزامی است').min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
});

const users = [
  { id: '1', name: 'عماد عمادپور', role: 'ادمین' },
  { id: '2', name: ' حسن عمادی', role: 'بازرس یک' },
  { id: '3', name: 'محمد حسنی ', role: 'بازرس دو' },
  { id: '4', name: 'سعید امینی', role: 'اپراتور' },
];

const LoginForm = () => {
  const navigate = useNavigate();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // useEffect برای auto-navigate بعد از ۱ ثانیه
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        navigate("/admin");
      }, 1000); // ۱ ثانیه

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, navigate]);

  const onSubmit = async (data) => {
    console.log('Login data:', data);
    
    // شبیه‌سازی عملیات ورود
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // پیدا کردن اطلاعات کاربر
    const user = users.find(u => u.id === data.user);
    setLoggedInUser(user);
    setShowSuccessPopup(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white text-center">
              خوش آمدید
            </h2>
            <p className="text-indigo-100 text-center mt-2">
              برای ادامه به حساب کاربری خود وارد شوید
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* User Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaUser className="ml-2 text-indigo-500" />
                  انتخاب کاربر
                </label>
                <div className="relative">
                  <select
                    {...register('user')}
                    className={`w-full pr-4 pl-10 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                      errors.user 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <option value="">یک کاربر انتخاب کنید...</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.user && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.user.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaLock className="ml-2 text-indigo-500" />
                  رمز عبور
                </label>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="رمز عبور خود را وارد کنید"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -mr-1 ml-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    در حال ورود...
                  </span>
                ) : (
                  'ورود به سیستم'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Demo Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            توسعه یافته توسط شرکت مهندسی فهامه
          </p>
        </div>
      </div>

      {/* پوپاپ موفقیت‌آمیز */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto transform transition-all duration-300 scale-95 hover:scale-100">
            {/* هدر مدال */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white text-center relative">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold">ورود موفقیت‌آمیز</h2>
              <p className="text-green-100 text-sm mt-1">در حال انتقال به پنل مدیریت...</p>
            </div>

            {/* محتوای مدال */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-2xl text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {loggedInUser?.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {loggedInUser?.role}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 inline-block">
                  <span className="text-green-700 text-sm font-semibold">
                    ✅ وضعیت: فعال
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">اطلاعات ورود:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>زمان ورود:</span>
                    <span className="font-semibold">
                      {new Date().toLocaleTimeString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاریخ:</span>
                    <span className="font-semibold">
                      {new Date().toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* لودر انیمیشن */}
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;