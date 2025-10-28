// src/components/notification/NotificationsTable.jsx
import React from 'react';
import { FaBell } from 'react-icons/fa';

// Utils
import { formatPersianDate, formatDateRange } from '../../utils/helpers';

const NotificationsTable = ({ notifications = [] }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <FaBell className="ml-2 text-blue-500" />
            نوتیفیکیشن‌های ثبت شده
          </h2>
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
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 font-semibold">{notification.number}</td>
                <td className="p-3">{formatPersianDate(notification.sendDate)}</td>
                <td className="p-3">{formatDateRange(notification.inspectionRange)}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    notification.status === 'approved' ? 'bg-green-100 text-green-800' :
                    notification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.status === 'pending' ? 'در حال انجام' :
                     notification.status === 'approved' ? 'تأیید شده' :
                     notification.status === 'rejected' ? 'رد شده' : 'تکمیل شده'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsTable;