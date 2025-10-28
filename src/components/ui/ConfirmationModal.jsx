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
  children 
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
    large: 'max-w-2xl'
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${sizeConfig[size]} w-full mx-auto max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} rounded-t-2xl p-6 text-white text-center relative`}>
          <button
            onClick={onClose}
            className="absolute left-4 top-4 text-white hover:opacity-80 transition duration-200"
          >
            <FaTimes className="text-xl" />
          </button>
          <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className="text-2xl text-white" />
          </div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-white text-sm mt-1 opacity-90">{message}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onConfirm}
              variant={type === 'danger' ? 'danger' : 'success'}
              size="lg"
              className="flex-1"
            >
              {confirmText}
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              size="lg"
              className="flex-1"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;