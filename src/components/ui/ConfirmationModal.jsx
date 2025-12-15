// src/components/ui/ConfirmationModal.jsx
import React from 'react';
import { FaCheck, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Button from './Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "تأیید", 
  cancelText = "انصراف", 
  type = "success",
  size = "medium",
  children,
  showCancelButton = true
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      gradient: 'from-green-500 to-green-600',
      icon: FaCheck,
      iconBg: 'bg-white bg-opacity-20'
    },
    danger: {
      gradient: 'from-red-500 to-red-600',
      icon: FaExclamationTriangle,
      iconBg: 'bg-white bg-opacity-20'
    },
    warning: {
      gradient: 'from-yellow-500 to-yellow-600',
      icon: FaExclamationTriangle,
      iconBg: 'bg-white bg-opacity-20'
    }
  };

  const sizeConfig = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3" dir="rtl">
      <div className={`bg-white rounded-xl shadow-xl ${sizeConfig[size]} w-full mx-auto max-h-[85vh] overflow-hidden flex flex-col`}>
        {/* Header - متن وسط‌چین */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-t-xl p-3 text-white relative flex items-center justify-center`}>
          {/* Close Button - چپ */}
          <button
            onClick={onClose}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white hover:opacity-80 transition duration-200"
          >
            <FaTimes className="text-base" />
          </button>
          
          {/* آیکون - راست */}
          <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center ml-3 flex-shrink-0`}>
            <Icon className="text-lg text-white" />
          </div>
          
          {/* Title & Message - وسط‌چین */}
          <div className="flex-1 text-center">
            <h2 className="text-sm font-bold">{title}</h2>
            {message && (
              <p className="text-white text-xs opacity-90 mt-0.5">{message}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {children}
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <Button
              onClick={() => {
                console.log('🎯 Confirm button clicked in modal');
                onConfirm();
              }}
              variant={type === 'danger' ? 'danger' : 'success'}
              size="sm"
              className="flex-1 py-1.5"
            >
              {confirmText}
            </Button>
            
            {showCancelButton && (
              <Button
                onClick={onClose}
                variant="secondary"
                size="sm"
                className="flex-1 py-1.5"
              >
                {cancelText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;