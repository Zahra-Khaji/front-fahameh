// src/components/ui/SaveConfirmationPopover/FinancialSaveConfirmationPopover.jsx
import React from 'react';
import {
  FaQuestionCircle,
  FaCheck,
  FaBan,
  FaSync
} from 'react-icons/fa';

const FinancialSaveConfirmationPopover = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  rowData,
  editedValues,
  isLoading = false
}) => {
  if (!isOpen) return null;

  // فرمت کردن عدد برای نمایش
  const formatNumber = (value) => {
    if (value === undefined || value === null || value === '') return '-';
    return new Intl.NumberFormat('fa-IR').format(value);
  };

  // فیلتر کردن ستون‌هایی که تغییر کرده‌اند
  const changedColumns = Object.keys(editedValues).filter(
    columnName => editedValues[columnName] !== undefined && editedValues[columnName] !== ''
  );

  // اگر هیچ ستونی تغییر نکرده، پاپ‌آپ رو نشون نده
  if (changedColumns.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <FaQuestionCircle className="text-blue-500 text-xl flex-shrink-0" />
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                تأیید ذخیره تغییرات
              </h3>
              <div className="text-xs text-gray-600 leading-relaxed mb-3">
                <p>آیا از ذخیره تغییرات این سطر اطمینان دارید؟</p>
                {rowData && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="grid grid-cols-2 gap-1">
                      {/* <span className="text-gray-500">شماره RFI:</span>
                      <span className="font-medium">{rowData["شماره RFI"] || '-'}</span> */}
                      
                      <span className="text-gray-500">نام پروژه:</span>
                      <span className="font-medium">{rowData["نام پروژه"] || '-'}</span>
                      
                      <span className="text-gray-500 col-span-2 mt-2 font-semibold text-blue-600">تغییرات اعمال شده:</span>
                      
                      {/* فقط ستون‌هایی که تغییر کرده‌اند نمایش داده شوند */}
                      {changedColumns.map(columnName => (
                        <React.Fragment key={columnName}>
                          <span className="text-gray-500">{columnName}:</span>
                          <span className="font-medium text-green-600">
                            {formatNumber(editedValues[columnName])}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50"
            >
              <FaBan className="text-xs" />
              انصراف
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <FaSync className="animate-spin text-xs" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FaCheck className="text-xs" />
                  بله، ذخیره کن
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSaveConfirmationPopover;