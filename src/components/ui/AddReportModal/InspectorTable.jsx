// src/components/ui/AddReportModal/InspectorTable.jsx
import React from 'react';
import { 
  FaCopy, 
  FaTrash 
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const InspectorTable = ({ 
  inspectorRows, 
  isLoading, 
  inspectorStatusOptions,
  handleInspectorChange,
  handleCopyInspectorRow,
  handleDeleteInspectorRow 
}) => {
  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-6 shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-green-700 to-emerald-700">
            <th className="p-3 text-center font-semibold text-white min-w-16">ردیف</th>
            <th className="p-3 text-center font-semibold text-white min-w-28">تاریخ بازرسی</th>
            <th className="p-3 text-center font-semibold text-white min-w-32">وضعیت تائید</th>
            <th className="p-3 text-center font-semibold text-white min-w-36">نام بازرس</th>
            <th className="p-3 text-center font-semibold text-white min-w-32">دستمزد</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {inspectorRows.map((row, index) => (
            <tr 
              key={row.id} 
              className={`border-b border-gray-200 transition duration-150 ${
                index % 2 === 0 ? 'bg-white' : 'bg-green-50'
              } hover:bg-green-100`}
            >
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-sm">
                  {row.rowNumber}
                </span>
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <DatePicker
                    value={row.inspectionDate}
                    onChange={(date) => handleInspectorChange(row.id, 'inspectionDate', date)}
                    format="YYYY/MM/DD"
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="تاریخ بازرسی"
                    disabled={isLoading}
                  />
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <select
                    value={row.approvalStatus}
                    onChange={(e) => handleInspectorChange(row.id, 'approvalStatus', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    disabled={isLoading}
                  >
                    {inspectorStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={row.inspectorName}
                    onChange={(e) => handleInspectorChange(row.id, 'inspectorName', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="نام بازرس"
                    disabled={isLoading}
                  />
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={row.fee}
                    onChange={(e) => handleInspectorChange(row.id, 'fee', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="مبلغ به تومان"
                    disabled={isLoading}
                  />
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyInspectorRow(row.id)}
                    className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition duration-200 border border-emerald-200 disabled:opacity-50"
                    title="کپی این سطر"
                    disabled={isLoading}
                  >
                    <FaCopy className="text-sm" />
                  </button>
                  {inspectorRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteInspectorRow(row.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200 border border-red-200 disabled:opacity-50"
                      title="حذف این سطر"
                      disabled={isLoading}
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InspectorTable;