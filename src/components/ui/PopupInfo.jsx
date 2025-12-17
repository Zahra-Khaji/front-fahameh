// src/components/ui/PopupInfo.jsx (نسخه ساده)
import React from 'react';
import { FaExclamationTriangle, FaTimes, FaInfoCircle } from 'react-icons/fa';

const PopupInfo = ({ 
  isOpen, 
  onClose, 
  projectName, 
  projectType,
  notificationNumber
}) => {
  if (!isOpen) return null;

  // بررسی اینکه آیا شماره صفر است
  const isFirstNotification = !notificationNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <div className="p-1 bg-blue-100 rounded-lg">
              <FaInfoCircle className="text-blue-600 text-md" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">اطلاعات ثبت</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <FaTimes className="text-gray-500 text-sm" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-center gap-2 mb-3">
            <FaInfoCircle className="text-blue-500 text-sm mt-1 flex-shrink-0" />
            <div className="text-gray-700 text-sm leading-relaxed flex flex-wrap items-center gap-1 text-center">
              {isFirstNotification ? (
                // پیام برای شماره صفر
                <>
                  <span>اولین ثبت برای </span>
                  <span className="font-bold text-blue-600">"{projectName}"</span>
                  <span className="mx-1">-</span>
                  <span className="font-bold text-blue-600">"{projectType}"</span>
                  <span> خواهد بود</span>
                </>
              ) : (
                // پیام برای شماره‌های دیگر
                <>
                  <span>آخرین شماره ثبت شده برای </span>
                  <span className="font-bold text-blue-600">"{projectName}"</span>
                  <span className="mx-1">-</span>
                  <span className="font-bold text-blue-600">"{projectType}"</span>
                  <span>:</span>
                  <span className="font-bold text-green-600 text-lg mr-1">{notificationNumber}</span>
                </>
              )}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2">
            <p className="text-xs text-blue-700 text-center">
              شماره جدید در مرحله بعد به صورت خودکار تولید خواهد شد
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-4 pt-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-sm w-full"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};

// انیمیشن fadeIn
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);

export default PopupInfo;