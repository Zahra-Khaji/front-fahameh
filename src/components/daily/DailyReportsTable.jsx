// src/components/daily/DailyReportsTable.jsx
import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

// Components
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';

// Data & Utils
import { approvalStatuses, inspectors } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const DailyReportsTable = ({ dailyReports, onUpdate }) => {
  const handleInputChange = (reportId, field, value) => {
    onUpdate(reportId, field, value);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="p-3 text-right font-semibold text-gray-700 min-w-32">
              تاریخ بازرسی
            </th>
            <th className="p-3 text-right font-semibold text-gray-700 min-w-40">
              وضعیت تأیید *
            </th>
            <th className="p-3 text-right font-semibold text-gray-700 min-w-44">
              نام بازرس *
            </th>
            <th className="p-3 text-right font-semibold text-gray-700 min-w-36">
              دستمزد (تومان) *
            </th>
            <th className="p-3 text-right font-semibold text-gray-700 min-w-44">
              نام بازرس دوم
            </th>
            <th className="p-3 text-right font-semibold text-gray-700 min-w-36">
              دستمزد بازرس دوم
            </th>
          </tr>
        </thead>
        <tbody>
          {dailyReports.map((report) => (
            <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
              {/* Inspection Date */}
              <td className="p-3">
                <div className="flex items-center text-gray-700 font-semibold">
                  <FaCalendarAlt className="ml-1 text-blue-500 text-xs" />
                  {formatPersianDate(report.inspectionDate)}
                </div>
              </td>

              {/* Approval Status */}
              <td className="p-3">
                <select
                  value={report.approvalStatus}
                  onChange={(e) => handleInputChange(report.id, 'approvalStatus', e.target.value)}
                  className="w-full px-2 py-1 text-xs text-gray-800 font-semibold  border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                >
                  {approvalStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </td>

              {/* Inspector Name */}
              <td className="p-3">
                <select
                  value={report.inspectorName}
                  onChange={(e) => handleInputChange(report.id, 'inspectorName', e.target.value)}
                  className="w-full px-2 py-1 text-xs text-gray-800 font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                >
                  {inspectors.map(inspector => (
                    <option key={inspector.id} value={inspector.name}>
                      {inspector.name}
                    </option>
                  ))}
                </select>
              </td>

              {/* Inspector Fee */}
              <td className="p-3">
                <input
                  type="text"
                  value={report.inspectorFee}
                  onChange={(e) => handleInputChange(report.id, 'inspectorFee', e.target.value)}
                  className="w-full px-2 py-1 text-xs  text-gray-800 font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                  placeholder="مثال: ۱,۲۰۰,۰۰۰"
                />
              </td>

              {/* Second Inspector Name */}
              <td className="p-3">
                <input
                  type="text"
                  value={report.secondInspectorName}
                  onChange={(e) => handleInputChange(report.id, 'secondInspectorName', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                  placeholder="اختیاری"
                />
              </td>

              {/* Second Inspector Fee */}
              <td className="p-3">
                <input
                  type="text"
                  value={report.secondInspectorFee}
                  onChange={(e) => handleInputChange(report.id, 'secondInspectorFee', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                  placeholder="اختیاری"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyReportsTable;