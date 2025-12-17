// src/components/ui/ConfirmationPopover.jsx
import React from 'react';
import { FaExclamationTriangle, FaQuestionCircle, FaCheck, FaTimes } from 'react-icons/fa';

const ConfirmationPopover = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  type = 'warning', // 'warning' یا 'info'
  confirmText = 'بله',
  cancelText = 'انصراف'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 text-white'
    },
    info: {
      icon: <FaQuestionCircle className="text-blue-500 text-xl" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30" 
        onClick={onClose}
      />
      
      {/* Popover */}
      <div className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg max-w-sm w-full`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {styles.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1"
            >
              <FaTimes className="text-xs" />
              {cancelText}
            </button>
            
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition duration-200 flex items-center gap-1 ${styles.confirmBtn}`}
            >
              <FaCheck className="text-xs" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopover;