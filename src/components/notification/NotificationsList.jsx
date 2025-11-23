// src/components/notification/NotificationsList.jsx
import React, { useState } from 'react';
import { FaList, FaPlus, FaTrash } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';
import FinalConfirmationContent from './FinalConfirmationContent'; // اضافه کردن import

// Data & Utils
import { formatPersianDate, formatMultipleDates } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const NotificationsList = ({ 
  notifications = [], 
  onEdit, 
  onDelete, 
  onAddNew, 
  showAddButton = true, 
  onComplete,
  previousData 
}) => {
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState({ 
    show: false, 
    notification: null 
  });
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false); // state جدید برای مدال نهایی

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

  // تابع جدید برای نمایش مدال تأیید نهایی
  const handleFinalConfirmation = () => {
    setShowFinalConfirmation(true);
  };

  // تابع جدید برای ثبت نهایی
  // const handleFinalSubmit = () => {
  //   setShowFinalConfirmation(false);
  //   onComplete(); // فراخوانی تابع اصلی
  // };
  const handleFinalSubmit = () => {
    setShowFinalConfirmation(false);
    
    // گرفتن نام پروژه از previousData
    const projectName = previousData?.projectInfo?.projectName;
    
    if (projectName) {
      // نویگیت به صفحه RFIReportTable با پارامتر پروژه
      navigate(`/admin/rfi-report?project=${encodeURIComponent(projectName)}`);
    } else {
      // اگر نام پروژه نبود، تابع اصلی رو فراخوانی کن
      onComplete();
    }
  };
  const statusOptions = [
    { value: 'pending', label: 'در حال انجام' },
    { value: 'approved', label: 'تأیید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'completed', label: 'تکمیل شده' }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <FaList className="ml-2 text-blue-500 text-sm sm:text-base" />
              نوتیفیکیشن‌های ثبت شده
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
            تعداد: {notifications.length}
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">شماره</th>
                <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ ارسال</th>
                <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ‌های بازرسی</th>
                <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">وضعیت</th>
                <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">{notification.number}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm">{formatPersianDate(notification.sendDate)}</td>
                  <td className="p-2 sm:p-3 text-xs sm:text-sm max-w-xs">
                    <div className="truncate" title={formatMultipleDates(notification.inspectionRange)}>
                      {formatMultipleDates(notification.inspectionRange)}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3">
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
                  <td className="p-2 sm:p-3">
                    <div className="flex gap-1 sm:gap-2">
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

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">شماره:</span>
                  <span className="font-semibold">{notification.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاریخ ارسال:</span>
                  <span className="font-semibold">{formatPersianDate(notification.sendDate)}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ‌های بازرسی:</span>
                    <span className="font-semibold text-right flex-1 mr-2 text-xs break-words" title={formatMultipleDates(notification.inspectionRange)}>
                      {formatMultipleDates(notification.inspectionRange)}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-between items-center">
                  <span className="text-gray-600">وضعیت:</span>
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
                </div>
                <div className="col-span-2 flex justify-end pt-2">
                  <button
                    onClick={() => showDeleteConfirm(notification)}
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
        <div className="flex justify-center pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
          <Button
            onClick={handleFinalConfirmation} // تغییر به تابع جدید
            variant="success"
            size="lg"
            icon="check"
            className="w-full sm:w-auto"
          >
            تکمیل و ثبت نهایی
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

      {/* Final Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFinalConfirmation}
        onClose={() => setShowFinalConfirmation(false)}
        onConfirm={handleFinalSubmit}
        title="تأیید نهایی اطلاعات"
        message="لطفاً اطلاعات وارد شده را بررسی و تأیید کنید"
        confirmText="تأیید و ثبت نهایی"
        cancelText="بازگشت و ویرایش"
        type="success"
        size="large"
      >
        <FinalConfirmationContent 
          previousData={previousData} 
          notifications={notifications}
        />
      </ConfirmationModal>
    </>
  );
};

export default NotificationsList;