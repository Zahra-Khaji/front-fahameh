// src/components/ui/LogoutConfirmationModal.jsx
import React from 'react';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import Button from './Button';

const LogoutConfirmationModal = ({ isOpen, onClose, onConfirm, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaSignOutAlt className="text-red-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">تأیید خروج</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            disabled={isPending}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSignOutAlt className="text-red-500 text-2xl" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">
            آیا مطمئن هستید؟
          </h4>
          {/* <p className="text-gray-600 mb-6">
            با خروج از سیستم، از دسترسی به برخی امکانات محدود خواهید شد.
          </p> */}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <Button
            onClick={onConfirm}
            variant="danger"
            className="flex-1"
            disabled={isPending}
            isLoading={isPending}
            loadingText="در حال خروج..."
          >
            بله، خارج شوم
          </Button>
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isPending}
          >
            لغو
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;