// src/components/report/ReportsList.jsx
import React, { useState } from 'react';
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';

// Data & Utils
import { reportStatusOptions } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const ReportsList = ({ 
  reports, 
  onEdit, 
  onDelete, 
  onAddNew, 
  showAddButton, 
  onComplete
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ 
    show: false, 
    report: null 
  });

  const handleStatusChange = (reportId, newStatus) => {
    onEdit(reportId, { status: newStatus });
  };

  const showDeleteConfirm = (report) => {
    setDeleteConfirmation({ show: true, report });
  };

  const handleDelete = () => {
    if (deleteConfirmation.report) {
      onDelete(deleteConfirmation.report.id);
    }
    setDeleteConfirmation({ show: false, report: null });
  };

  const getStatusClass = (statusValue) => {
    const statusObj = reportStatusOptions.find(option => option.value === statusValue);
    return statusObj ? `${statusObj.color} ${statusObj.bgColor} px-2 py-1 rounded text-xs` : '';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 lg:mb-3 gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <FaList className="ml-2 text-blue-500 text-sm sm:text-base" />
              گزارش‌های ثبت شده
            </h2>
            
            {showAddButton && (
              <Button
                onClick={onAddNew}
                variant="primary"
                size="sm"
                icon="plus"
                className="text-xs sm:text-sm"
              >
                افزودن جدید
              </Button>
            )}
          </div>
          
          <span className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 rounded self-start sm:self-auto">
            تعداد: {reports.length}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-1.5 sm:p-2 lg:p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">شماره</th>
                <th className="p-1.5 sm:p-2 lg:p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ دریافت</th>
                <th className="p-1.5 sm:p-2 lg:p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">وضعیت</th>
                <th className="p-1.5 sm:p-2 lg:p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">اصلاحات</th>
                <th className="p-1.5 sm:p-2 lg:p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-1.5 sm:p-2 lg:p-2 font-semibold text-xs sm:text-sm">{report.number}</td>
                  <td className="p-1.5 sm:p-2 lg:p-2 text-xs sm:text-sm">{formatPersianDate(report.receiveDate)}</td>
                  <td className="p-1.5 sm:p-2 lg:p-2">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className={`text-xs px-2 py-0.5 rounded border ${getStatusClass(report.status)} border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      {reportStatusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 sm:p-2 lg:p-2 max-w-xs">
                    <div className="text-xs text-gray-600 truncate" title={report.corrections}>
                      {report.corrections || '-'}
                    </div>
                  </td>
                  <td className="p-1.5 sm:p-2 lg:p-2">
                    <div className="flex gap-1 sm:gap-1 lg:gap-1">
                      <button
                        onClick={() => showDeleteConfirm(report)}
                        className="text-red-500 hover:text-red-700 transition duration-200"
                        title="حذف"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">شماره:</span>
                  <span className="font-semibold">{report.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاریخ دریافت:</span>
                  <span className="font-semibold">{formatPersianDate(report.receiveDate)}</span>
                </div>
                <div className="col-span-2 flex justify-between items-center">
                  <span className="text-gray-600">وضعیت:</span>
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${getStatusClass(report.status)} border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    {reportStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اصلاحات:</span>
                    <span className="font-semibold text-right flex-1 mr-2 text-xs truncate" title={report.corrections}>
                      {report.corrections || '-'}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end pt-2">
                  <button
                    onClick={() => showDeleteConfirm(report)}
                    className="text-red-500 hover:text-red-700 transition duration-200 flex items-center gap-1"
                  >
                    <FaTrash className="text-xs" />
                    <span className="text-xs">حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        <div className="flex justify-center pt-3 sm:pt-4 lg:pt-4 border-t border-gray-200 mt-3 sm:mt-4 lg:mt-4">
          <Button
            onClick={onComplete}
            variant="primary"
            size="lg"
            icon="check"
            className="w-full sm:w-auto"
          >
            ادامه به مرحله صورت وضعیت
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, report: null })}
        onConfirm={handleDelete}
        title="تأیید حذف"
        message={`آیا از حذف گزارش با شماره ${deleteConfirmation.report?.number} اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
      />
    </>
  );
};

export default ReportsList;