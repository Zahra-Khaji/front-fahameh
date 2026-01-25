// src/components/ui/DeleteConfirmationPopover.jsx
import React from "react";
import {
  FaTrash,
  FaExclamationTriangle,
  FaCheck,
  FaBan,
  FaSpinner,
} from "react-icons/fa";

const DeleteConfirmationPopover = ({
  isOpen,
  onClose,
  onConfirm,
  title = "تأیید حذف",
  message = "آیا مطمئن هستید که می‌خواهید این آیتم را حذف کنید؟",
  confirmText = "بله، حذف شود",
  cancelText = "انصراف",
  isLoading = false,
  type = "warning",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
    },
    danger: {
      icon: <FaExclamationTriangle className="text-red-500 text-xl" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      confirmBtn: "bg-red-700 hover:bg-red-800 text-white",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">{styles.icon}</div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaBan className="text-sm" />
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
              }}
              disabled={isLoading}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition duration-200 flex items-center gap-2 ${styles.confirmBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="text-sm animate-spin" />
                  در حال حذف...
                </>
              ) : (
                <>
                  <FaTrash className="text-sm" />
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