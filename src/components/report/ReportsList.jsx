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
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FaList className="ml-2 text-blue-500" />
              گزارش‌های ثبت شده
            </h2>
            
            {showAddButton && (
              <Button
                onClick={onAddNew}
                variant="primary"
                size="sm"
                icon="plus"
              >
                افزودن جدید
              </Button>
            )}
          </div>
          
          <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
            تعداد: {reports.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-right font-semibold text-gray-700">شماره</th>
                <th className="p-3 text-right font-semibold text-gray-700">تاریخ دریافت</th>
                <th className="p-3 text-right font-semibold text-gray-700">وضعیت</th>
                <th className="p-3 text-right font-semibold text-gray-700">اصلاحات</th>
                <th className="p-3 text-right font-semibold text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-semibold">{report.number}</td>
                  <td className="p-3">{formatPersianDate(report.receiveDate)}</td>
                  <td className="p-3">
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
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="text-xs text-gray-600 truncate" title={report.corrections}>
                      {report.corrections || '-'}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
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

        {/* Complete Button */}
        <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
          <Button
            onClick={onComplete}
            variant="primary"
            size="lg"
            icon="check"
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