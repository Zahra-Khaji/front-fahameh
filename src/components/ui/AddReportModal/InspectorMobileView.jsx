// src/components/ui/AddReportModal/InspectorMobileView.jsx
import React from 'react';
import { 
  FaCopy, 
  FaTrash, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaUser,
  FaPlusCircle  // اضافه کردن این خط
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const InspectorMobileView = ({ 
  inspectorRows, 
  isLoading, 
  inspectorStatusOptions,
  handleInspectorChange,
  handleCopyInspectorRow,
  handleDeleteInspectorRow,
  handleAddNewInspectorRow 
}) => {
  return (
    <div className="md:hidden space-y-4">
      {inspectorRows.map((row) => (
        <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold">
                {row.rowNumber}
              </span>
              <span className="text-sm font-semibold text-gray-800">صورت وضعیت بازرس</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopyInspectorRow(row.id)}
                className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition duration-200 disabled:opacity-50"
                title="کپی این سطر"
                disabled={isLoading}
              >
                <FaCopy className="text-xs" />
              </button>
              {inspectorRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteInspectorRow(row.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200 disabled:opacity-50"
                  title="حذف این سطر"
                  disabled={isLoading}
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                تاریخ بازرسی
              </label>
              <DatePicker
                value={row.inspectionDate}
                onChange={(date) => handleInspectorChange(row.id, 'inspectionDate', date)}
                format="YYYY/MM/DD"
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="تاریخ بازرسی"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                وضعیت تائید
              </label>
              <select
                value={row.approvalStatus}
                onChange={(e) => handleInspectorChange(row.id, 'approvalStatus', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                disabled={isLoading}
              >
                {inspectorStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                نام بازرس
              </label>
              <input
                type="text"
                value={row.inspectorName}
                onChange={(e) => handleInspectorChange(row.id, 'inspectorName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="نام بازرس"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                دستمزد
              </label>
              <input
                type="text"
                value={row.fee}
                onChange={(e) => handleInspectorChange(row.id, 'fee', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="مبلغ به تومان"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* دکمه افزودن جدید برای موبایل */}
      <button
        type="button"
        onClick={handleAddNewInspectorRow}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <FaPlusCircle className="text-base" />
        افزودن صورت وضعیت
      </button>
    </div>
  );
};

export default InspectorMobileView;