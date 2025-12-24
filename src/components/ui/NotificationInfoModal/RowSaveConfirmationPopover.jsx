// src/components/ui/NotificationInfoModal/RowSaveConfirmationPopover.jsx
import React from 'react';
import {
  FaQuestionCircle,
  FaCheck,
  FaBan,
  FaSync
} from 'react-icons/fa';
import { formatWithCommas } from '../../../utils/helpers';

const RowSaveConfirmationPopover = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  rowData,
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
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <FaQuestionCircle className="text-blue-500 text-xl" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                تأیید ذخیره تغییرات سطر
              </h3>
              <div className="text-xs text-gray-600 leading-relaxed mb-3">
                <p>آیا از ذخیره تغییرات این سطر اطمینان دارید؟</p>
                {rowData && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="grid grid-cols-2 gap-1">
                      <span className="text-gray-500">تعداد روز تائید شده:</span>
                      <span className="font-medium">{rowData.approveManday || 0}</span>
                      
                      <span className="text-gray-500">دستمزد بازرس:</span>
                      <span className="font-medium">
                        {rowData.fee ? formatWithCommas(rowData.fee) : 0} تومان
                      </span>
                      
                      {rowData.rawData?.inspectorName && (
                        <>
                          <span className="text-gray-500">نام بازرس:</span>
                          <span className="font-medium">{rowData.rawData.inspectorName}</span>
                        </>
                      )}
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

export default RowSaveConfirmationPopover;