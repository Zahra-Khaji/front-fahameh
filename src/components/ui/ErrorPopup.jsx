// src/components/ui/ErrorPopup.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from './Button';

const ErrorPopup = ({ 
  isOpen, 
  onClose, 
  title = "خطا", 
  message = "خطایی رخ داده است" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs w-full text-center">
        <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <FaExclamationTriangle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xs font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-xs mb-3">{message}</p>
        <Button
          onClick={onClose}
          variant="danger"
          size="sm"
          className="w-full"
        >
          متوجه شدم
        </Button>
      </div>
    </div>
  );
};

export default ErrorPopup;