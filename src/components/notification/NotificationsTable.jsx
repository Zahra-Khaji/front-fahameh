// src/components/notification/NotificationsTable.jsx
import React from 'react';
import { FaBell } from 'react-icons/fa';

// Utils
import { formatPersianDate, formatMultipleDates } from '../../utils/helpers'; // تغییر import

const NotificationsTable = ({ notifications = [] }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getStatusText = (status) => {
    return status === 'pending' ? 'در حال انجام' :
           status === 'approved' ? 'تأیید شده' :
           status === 'rejected' ? 'رد شده' : 'تکمیل شده';
  };

  const getStatusClass = (status) => {
    return status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
           status === 'approved' ? 'bg-green-100 text-green-800' :
           status === 'rejected' ? 'bg-red-100 text-red-800' :
           'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
            <FaBell className="ml-2 text-blue-500 text-sm sm:text-base" />
            نوتیفیکیشن‌های ثبت شده
          </h2>
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
              <th className="p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">شماره</th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ ارسال</th>
              <th className="p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ‌های بازرسی</th> {/* تغییر عنوان */}
              <th className="p-2 text-right font-semibold text-gray-700 text-xs sm:text-sm">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 font-semibold text-xs sm:text-sm">{notification.number}</td>
                <td className="p-2 text-xs sm:text-sm">{formatPersianDate(notification.sendDate)}</td>
                <td className="p-2 text-xs sm:text-sm max-w-xs"> {/* اضافه کردن max-w-xs */}
                  <div className="truncate" title={formatMultipleDates(notification.inspectionRange)}>
                    {formatMultipleDates(notification.inspectionRange)}
                  </div>
                </td>
                <td className="p-2">
                  <span className={`text-xs px-2 py-1 rounded ${getStatusClass(notification.status)}`}>
                    {getStatusText(notification.status)}
                  </span>
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
                <span className={`text-xs px-2 py-1 rounded ${getStatusClass(notification.status)}`}>
                  {getStatusText(notification.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsTable;