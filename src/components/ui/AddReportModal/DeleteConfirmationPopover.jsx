// src/components/ui/DeleteConfirmationPopover.jsx
import React from 'react';
import { 
  FaExclamationCircle, 
  FaCheck, 
  FaBan,
  FaTrash 
} from 'react-icons/fa';

const DeleteConfirmationPopover = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reportNumber,
  rfiNumbering,
  title = "تأیید حذف گزارش",
  message = "آیا مطمئن هستید که می‌خواهید این گزارش را حذف کنید؟",
  confirmText = "بله، حذف کن",
  cancelText = "انصراف",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30" 
        onClick={onClose}
      />
      
      {/* Popover */}
      <div className="relative bg-white border border-red-200 rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="text-red-500 text-xl" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              
              <div className="mb-3">
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  {message}
                </p>
                
                <div className="bg-red-50 border border-red-100 rounded p-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-700 font-medium">شماره گزارش:</span>
                    <span className="text-red-600 font-bold">{reportNumber}</span>
                  </div>
                  {rfiNumbering && (
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">RFI Numbering:</span>
                      <span className="text-red-600 font-medium">{rfiNumbering}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaBan className="text-xs" />
              {cancelText}
            </button>
            
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال حذف...
                </>
              ) : (
                <>
                  <FaTrash className="text-xs" />
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationPopover;