// src/components/ui/DeleteConfirmationPopover.jsx
import React from "react";
import {
  FaExclamationTriangle,
  FaTimes,
  FaCheck,
  FaTrash,
} from "react-icons/fa";

const DeleteConfirmationPopover = ({
  isOpen,
  onClose,
  onConfirm,
  title = "تأیید حذف",
  message = "آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟",
  confirmText = "بله، حذف کن",
  cancelText = "انصراف",
  type = "danger",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: <FaExclamationTriangle className="text-red-500 text-xl" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      confirmBtn: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      confirmBtn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
  };

  const styles = typeStyles[type] || typeStyles.danger;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Popover */}
      <div
        className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{styles.icon}</div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes className="text-xs" />
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
              }}
              disabled={isLoading}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition duration-200 flex items-center gap-1 ${styles.confirmBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-1"></span>
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