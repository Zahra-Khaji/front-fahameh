// src/components/ui/AddReportModal/ReportMobileView.jsx
import React from 'react';
import { 
  FaHashtag, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaCalendarCheck, 
  FaUserTie, 
  FaWarehouse, 
  FaFileContract, 
  FaReceipt, 
  FaCopy, 
  FaTrash,
  FaEdit,
  FaPlusCircle  // اضافه کردن این خط
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const ReportMobileView = ({ 
  reports, 
  errors, 
  isLoading, 
  statusOptions,
  handleReportChange,
  handleCopyReportRow,
  handleDeleteReportRow,
  handleAddNewReportRow 
}) => {
  return (
    <div className="md:hidden space-y-6">
      {reports.map((report, index) => (
        <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-bold">
                {index + 1}
              </span>
              <span className="text-sm font-semibold text-gray-800">گزارش {index + 1}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopyReportRow(report.id)}
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition duration-200 disabled:opacity-50"
                title="کپی این گزارش"
                disabled={isLoading}
              >
                <FaCopy className="text-xs" />
              </button>
              {reports.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteReportRow(report.id)}
                  className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200 disabled:opacity-50"
                  title="حذف این گزارش"
                  disabled={isLoading}
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {/* شماره گزارش */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaHashtag className="text-blue-500" />
                شماره گزارش *
              </label>
              <input
                type="text"
                value={report.reportNumber}
                onChange={(e) => handleReportChange(report.id, 'reportNumber', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[`${report.id}_reportNumber`] ? 'border-red-300' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="******"
                required
                disabled={isLoading}
              />
              {errors[`${report.id}_reportNumber`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`${report.id}_reportNumber`]}
                </p>
              )}
            </div>

            {/* وضعیت */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                وضعیت *
              </label>
              <select
                value={report.status}
                onChange={(e) => handleReportChange(report.id, 'status', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors[`${report.id}_status`] ? 'border-red-300' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                required
                disabled={isLoading}
              >
                <option value="">انتخاب وضعیت</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors[`${report.id}_status`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`${report.id}_status`]}
                </p>
              )}
            </div>

            {/* تاریخ دریافت */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                تاریخ دریافت گزارش *
              </label>
              <DatePicker
                value={report.receivedDate}
                onChange={(date) => handleReportChange(report.id, 'receivedDate', date)}
                format="YYYY/MM/DD"
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors[`${report.id}_receivedDate`] ? 'border-red-300' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="انتخاب تاریخ"
                disabled={isLoading}
              />
              {errors[`${report.id}_receivedDate`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`${report.id}_receivedDate`]}
                </p>
              )}
            </div>

            {/* روز تائید شده */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarCheck className="text-orange-500" />
                تعداد روز تائید شده
              </label>
              <input
                type="number"
                value={report.approvedDays}
                onChange={(e) => handleReportChange(report.id, 'approvedDays', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors[`${report.id}_approvedDays`] ? 'border-red-300' : 'border-gray-300'
                } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="تعداد روز"
                min="0"
                disabled={isLoading}
              />
              {errors[`${report.id}_approvedDays`] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[`${report.id}_approvedDays`]}
                </p>
              )}
            </div>

            {/* نام وندور */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaUserTie className="text-emerald-500" />
                نام وندور
              </label>
              <input
                type="text"
                value={report.vendorName}
                onChange={(e) => handleReportChange(report.id, 'vendorName', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="نام وندور"
                disabled={isLoading}
              />
            </div>

            {/* شماره واحد */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaWarehouse className="text-cyan-500" />
                شماره واحد
              </label>
              <input
                type="text"
                value={report.unitNumber}
                onChange={(e) => handleReportChange(report.id, 'unitNumber', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="شماره واحد"
                disabled={isLoading}
              />
            </div>

            {/* IRN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaFileContract className="text-violet-500" />
                IRN
              </label>
              <input
                type="text"
                value={report.irn}
                onChange={(e) => handleReportChange(report.id, 'irn', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="IRN"
                disabled={isLoading}
              />
            </div>

            {/* SRN */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaReceipt className="text-pink-500" />
                SRN
              </label>
              <input
                type="text"
                value={report.srn}
                onChange={(e) => handleReportChange(report.id, 'srn', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white disabled:bg-gray-100"
                placeholder="SRN"
                disabled={isLoading}
              />
            </div>

            {/* اصلاحات (اگر نیاز به اصلاحات انتخاب شده) */}
            {report.status === 'needs_correction' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FaEdit className="text-amber-500" />
                  شرح اصلاحات مورد نیاز *
                </label>
                <textarea
                  value={report.corrections}
                  onChange={(e) => handleReportChange(report.id, 'corrections', e.target.value)}
                  rows="3"
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
            )}
          </div>
        </div>
      ))}
      
      {/* دکمه افزودن جدید برای موبایل */}
      <button
        type="button"
        onClick={handleAddNewReportRow}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        <FaPlusCircle className="text-base" />
        افزودن گزارش جدید
      </button>
    </div>
  );
};

export default ReportMobileView;