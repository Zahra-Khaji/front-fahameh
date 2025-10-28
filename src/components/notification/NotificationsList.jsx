// src/components/notification/NotificationsList.jsx
import React, { useState } from 'react';
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';

// Data & Utils
import { formatPersianDate, formatDateRange } from '../../utils/helpers';

const NotificationsList = ({ 
  notifications = [], 
  onEdit, 
  onDelete, 
  onAddNew, 
  showAddButton = true, 
  onComplete 
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ 
    show: false, 
    notification: null 
  });

  const handleStatusChange = (notificationId, newStatus) => {
    onEdit(notificationId, { status: newStatus });
  };

  const showDeleteConfirm = (notification) => {
    setDeleteConfirmation({ show: true, notification });
  };

  const handleDelete = () => {
    if (deleteConfirmation.notification) {
      onDelete(deleteConfirmation.notification.id);
    }
    setDeleteConfirmation({ show: false, notification: null });
  };

  const statusOptions = [
    { value: 'pending', label: 'در حال انجام' },
    { value: 'approved', label: 'تأیید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'completed', label: 'تکمیل شده' }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <FaList className="ml-2 text-blue-500" />
              نوتیفیکیشن‌های ثبت شده
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
            تعداد: {notifications.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-right font-semibold text-gray-700">شماره</th>
                <th className="p-3 text-right font-semibold text-gray-700">تاریخ ارسال</th>
                <th className="p-3 text-right font-semibold text-gray-700">بازه بازرسی</th>
                <th className="p-3 text-right font-semibold text-gray-700">وضعیت</th>
                <th className="p-3 text-right font-semibold text-gray-700">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-semibold">{notification.number}</td>
                  <td className="p-3">{formatPersianDate(notification.sendDate)}</td>
                  <td className="p-3">{formatDateRange(notification.inspectionRange)}</td>
                  <td className="p-3">
                    <select
                      value={notification.status}
                      onChange={(e) => handleStatusChange(notification.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded border ${
                        notification.status === 'pending' ? 'text-yellow-600 border-yellow-300' :
                        notification.status === 'approved' ? 'text-green-600 border-green-300' :
                        notification.status === 'rejected' ? 'text-red-600 border-red-300' :
                        'text-blue-600 border-blue-300'
                      } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => showDeleteConfirm(notification)}
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
            ادامه به مرحله بعد
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, notification: null })}
        onConfirm={handleDelete}
        title="تأیید حذف"
        message={`آیا از حذف نوتیفیکیشن با شماره ${deleteConfirmation.notification?.number} اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
      />
    </>
  );
};

export default NotificationsList;