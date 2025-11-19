// src/components/daily/DailyReportsTable.jsx
import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

// Data & Utils
import { approvalStatuses, inspectors } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const DailyReportsTable = ({ dailyReports = [], onUpdate }) => {
  const handleInputChange = (reportId, field, value) => {
    onUpdate(reportId, field, value);
  };

  if (!dailyReports || dailyReports.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        هیچ داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-24">
                تاریخ بازرسی
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-20">
                وضعیت تأیید *
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-28">
                نام بازرس *
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-24">
                دستمزد *
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-28">
                بازرس دوم
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs min-w-24">
                دستمزد دوم
              </th>
            </tr>
          </thead>
          <tbody>
            {dailyReports.map((report) => (
              <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                {/* Inspection Date */}
                <td className="p-2">
                  <div className="flex items-center text-gray-700 font-semibold text-xs">
                    <FaCalendarAlt className="ml-1 text-blue-500 text-xs" />
                    {formatPersianDate(report.inspectionDate)}
                  </div>
                </td>

                {/* Approval Status */}
                <td className="p-2">
  <select
    value={report.approvalStatus}
    onChange={(e) => handleInputChange(report.id, 'approvalStatus', e.target.value)}
    className="w-24 px-2 py-1 text-xs text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
  >
    {approvalStatuses.map(status => (
      <option key={status.value} value={status.value}>
        {status.label}
      </option>
    ))}
  </select>
</td>

                {/* Inspector Name */}
                <td className="p-2">
                  <select
                    value={report.inspectorName}
                    onChange={(e) => handleInputChange(report.id, 'inspectorName', e.target.value)}
                    className="w-28 px-1 py-1 text-xs text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                  >
                    {inspectors.map(inspector => (
                      <option key={inspector.id} value={inspector.name}>
                        {inspector.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Inspector Fee */}
                <td className="p-2">
                  <input
                    type="text"
                    value={report.inspectorFee}
                    onChange={(e) => handleInputChange(report.id, 'inspectorFee', e.target.value)}
                    className="w-24 px-1 py-1 text-xs text-gray-800 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                    placeholder="۱,۲۰۰,۰۰۰"
                  />
                </td>

                {/* Second Inspector Name */}
                <td className="p-2">
                  <input
                    type="text"
                    value={report.secondInspectorName}
                    onChange={(e) => handleInputChange(report.id, 'secondInspectorName', e.target.value)}
                    className="w-28 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                    placeholder="اختیاری"
                  />
                </td>

                {/* Second Inspector Fee */}
                <td className="p-2">
                  <input
                    type="text"
                    value={report.secondInspectorFee}
                    onChange={(e) => handleInputChange(report.id, 'secondInspectorFee', e.target.value)}
                    className="w-24 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                    placeholder="اختیاری"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     

{/* Mobile Cards */}
<div className="md:hidden space-y-3">
  {dailyReports.map((report) => (
    <div key={report.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="grid grid-cols-1 gap-3">
        {/* سطر اول: تاریخ و وضعیت */}
        <div className="grid grid-cols-2 gap-3">
          {/* تاریخ */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs font-medium">تاریخ:</span>
            <span className="font-semibold text-xs flex items-center justify-end">
              <FaCalendarAlt className="ml-1 text-blue-500" />
              {formatPersianDate(report.inspectionDate)}
            </span>
          </div>
          
          {/* وضعیت */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-xs font-medium">وضعیت:</span>
            <select
              value={report.approvalStatus}
              onChange={(e) => handleInputChange(report.id, 'approvalStatus', e.target.value)}
              className="w-24 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {approvalStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* بازرس اصلی */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs font-medium">بازرس:</span>
          <select
            value={report.inspectorName}
            onChange={(e) => handleInputChange(report.id, 'inspectorName', e.target.value)}
            className="w-28 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {inspectors.map(inspector => (
              <option key={inspector.id} value={inspector.name}>
                {inspector.name}
              </option>
            ))}
          </select>
        </div>

        {/* دستمزد بازرس اصلی */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs font-medium">دستمزد:</span>
          <input
            type="text"
            value={report.inspectorFee}
            onChange={(e) => handleInputChange(report.id, 'inspectorFee', e.target.value)}
            className="w-28 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
            placeholder="دستمزد"
          />
        </div>

        {/* بازرس دوم */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs font-medium">بازرس دوم:</span>
          <input
            type="text"
            value={report.secondInspectorName}
            onChange={(e) => handleInputChange(report.id, 'secondInspectorName', e.target.value)}
            className="w-28 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="اختیاری"
          />
        </div>

        {/* دستمزد بازرس دوم */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-xs font-medium">دستمزد دوم:</span>
          <input
            type="text"
            value={report.secondInspectorFee}
            onChange={(e) => handleInputChange(report.id, 'secondInspectorFee', e.target.value)}
            className="w-28 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
            placeholder="اختیاری"
          />
        </div>
      </div>
    </div>
  ))}
</div>
    </>
  );
};

export default DailyReportsTable;