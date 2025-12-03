// src/components/ui/AddReportModal/ReportTable.jsx
import React from 'react';
import { 
  FaCopy, 
  FaTrash, 
  FaEdit 
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const ReportTable = ({ 
  reports, 
  errors, 
  isLoading, 
  statusOptions,
  handleReportChange,
  handleCopyReportRow,
  handleDeleteReportRow 
}) => {
  return (
    <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-6 shadow-sm">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-700 to-purple-700">
            <th className="p-3 text-center font-semibold text-white min-w-16">ردیف</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">شماره گزارش</th>
            <th className="p-3 text-center font-semibold text-white min-w-28">وضعیت</th>
            <th className="p-3 text-center font-semibold text-white min-w-28">تاریخ دریافت</th>
            <th className="p-3 text-center font-semibold text-white min-w-32">روز تائید شده</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">نام وندور</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">شماره واحد</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">IRN</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">SRN</th>
            <th className="p-3 text-center font-semibold text-white min-w-24">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr 
              key={report.id} 
              className={`border-b border-gray-200 transition duration-150 ${
                index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'
              } hover:bg-indigo-100`}
            >
              {/* ستون ردیف */}
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold shadow-sm">
                  {index + 1}
                </span>
              </td>
              
              {/* ستون شماره گزارش */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={report.reportNumber}
                    onChange={(e) => handleReportChange(report.id, 'reportNumber', e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors[`${report.id}_reportNumber`] ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="******"
                    required
                    disabled={isLoading}
                  />
                  {errors[`${report.id}_reportNumber`] && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors[`${report.id}_reportNumber`]}
                    </p>
                  )}
                </div>
              </td>
              
              {/* ستون وضعیت */}
              <td className="p-3">
                <div className="flex flex-col">
                  <select
                    value={report.status}
                    onChange={(e) => handleReportChange(report.id, 'status', e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors[`${report.id}_status`] ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    required
                    disabled={isLoading}
                  >
                    <option value="">انتخاب</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors[`${report.id}_status`] && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors[`${report.id}_status`]}
                    </p>
                  )}
                </div>
              </td>
              
              {/* ستون تاریخ دریافت */}
              <td className="p-3">
                <div className="flex flex-col">
                  <DatePicker
                    value={report.receivedDate}
                    onChange={(date) => handleReportChange(report.id, 'receivedDate', date)}
                    format="YYYY/MM/DD"
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors[`${report.id}_receivedDate`] ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="تاریخ"
                    disabled={isLoading}
                  />
                  {errors[`${report.id}_receivedDate`] && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors[`${report.id}_receivedDate`]}
                    </p>
                  )}
                </div>
              </td>
              
              {/* ستون روز تائید شده */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="number"
                    value={report.approvedDays}
                    onChange={(e) => handleReportChange(report.id, 'approvedDays', e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                      errors[`${report.id}_approvedDays`] ? 'border-red-300' : 'border-gray-300'
                    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                    placeholder="تعداد روز"
                    min="0"
                    disabled={isLoading}
                  />
                  {errors[`${report.id}_approvedDays`] && (
                    <p className="text-red-500 text-xs mt-1 text-center">
                      {errors[`${report.id}_approvedDays`]}
                    </p>
                  )}
                </div>
              </td>
              
              {/* ستون نام وندور */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={report.vendorName}
                    onChange={(e) => handleReportChange(report.id, 'vendorName', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="نام وندور"
                    disabled={isLoading}
                  />
                </div>
              </td>
              
              {/* ستون شماره واحد */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={report.unitNumber}
                    onChange={(e) => handleReportChange(report.id, 'unitNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="شماره واحد"
                    disabled={isLoading}
                  />
                </div>
              </td>
              
              {/* ستون IRN */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={report.irn}
                    onChange={(e) => handleReportChange(report.id, 'irn', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="IRN"
                    disabled={isLoading}
                  />
                </div>
              </td>
              
              {/* ستون SRN */}
              <td className="p-3">
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={report.srn}
                    onChange={(e) => handleReportChange(report.id, 'srn', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white disabled:bg-gray-100"
                    placeholder="SRN"
                    disabled={isLoading}
                  />
                </div>
              </td>
              
              {/* ستون عملیات */}
              <td className="p-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyReportRow(report.id)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-200 border border-blue-200 disabled:opacity-50"
                    title="کپی این سطر"
                    disabled={isLoading}
                  >
                    <FaCopy className="text-sm" />
                  </button>
                  {reports.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReportRow(report.id)}
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
      
      {/* فیلد اصلاحات برای سطرهایی که وضعیت "نیاز به اصلاحات" دارند */}
      {reports.map((report, index) => (
        report.status === 'needs_correction' && (
          <div key={`corrections-${report.id}`} className="bg-amber-50 border-t border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaEdit className="text-amber-500" />
              <span className="text-sm font-semibold text-gray-700">
                شرح اصلاحات برای گزارش ردیف {index + 1}
              </span>
            </div>
            <textarea
              value={report.corrections}
              onChange={(e) => handleReportChange(report.id, 'corrections', e.target.value)}
              rows="2"
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                errors[`${report.id}_corrections`] ? 'border-red-300' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              placeholder="شرح کامل اصلاحات مورد نیاز را وارد کنید..."
              disabled={isLoading}
            />
            {errors[`${report.id}_corrections`] && (
              <p className="text-red-500 text-xs mt-1">
                {errors[`${report.id}_corrections`]}
              </p>
            )}
          </div>
        )
      ))}
    </div>
  );
};

export default ReportTable;