// src/components/forms/NotificationStep.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";

// Components
import StepHeader from '../common/StepHeader';
import RequestInfoSidebar from '../common/RequestInfoSidebar';
import Button from '../ui/Button';
import NotificationForm from '../notification/NotificationForm';
import NotificationsList from '../notification/NotificationsList';
import ConfirmationModal from '../ui/ConfirmationModal';

// Hooks & Utils
import { useNotifications } from '../../hooks/useNotifications';
import { formatPersianDate, formatDateRange } from '../../utils/helpers';
import { FaList, FaHashtag } from 'react-icons/fa';

const NotificationStep = ({ onBack, onComplete, previousData, lists, onListChange }) => {
  const [showAddForm, setShowAddForm] = useState(true);
  
  const {
    notifications,
    addNotification,
    updateNotification,
    deleteNotification,
    lastNotificationNumber
  } = useNotifications(lists?.notifications || [], onListChange);

  const handleFinalSubmit = (notificationData) => {
    const newNotification = {
      id: Date.now(),
      ...notificationData,
      inspector: previousData?.inspectorInfo?.inspectorName || '',
      province: previousData?.projectInfo?.province || '',
      status: 'pending',
      createdAt: new Date()
    };

    addNotification(newNotification);
    setShowAddForm(false);
  };

  // تغییر: مستقیماً به مرحله صورت وضعیت برو
  const handleCompleteStep = () => {
    const stepData = {
      notifications: notifications,
      inspectionRange: notifications[0]?.inspectionRange || []
    };
    console.log('ارسال داده‌های نوتیفیکیشن:', stepData);
    onComplete(stepData); // اینجا مستقیماً به مرحله بعد می‌ره
  };

  const realNotifications = previousData?.notifications || [];

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-3 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        
        <StepHeader
          title="ثبت اطلاعات نوتیفیکیشن"
          description="مرحله دوم - مدیریت اطلاع‌رسانی و برنامه‌ریزی بازرسی"
          icon={FaHashtag}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RequestInfoSidebar 
              previousData={previousData} 
              onBack={onBack} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            
            {/* Notifications Table با دیتای واقعی */}
            {realNotifications.length > 0 && (
              <NotificationsTable notifications={realNotifications} />
            )}

            {/* Add Notification Form */}
            {showAddForm && (
              <NotificationForm
                lastNotificationNumber={lastNotificationNumber}
                onSubmit={handleFinalSubmit}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {/* Notifications List */}
            {notifications.length > 0 && (
              <NotificationsList
                notifications={notifications}
                onEdit={updateNotification}
                onDelete={deleteNotification}
                onAddNew={() => setShowAddForm(true)}
                showAddButton={!showAddForm}
                onComplete={handleCompleteStep} // تغییر: مستقیماً به صورت وضعیت
              />
            )}

            {/* Empty State */}
            {!showAddForm && notifications.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center">
                <div className="text-gray-500 mb-3 sm:mb-4">
                  <FaList className="text-3xl sm:text-4xl mx-auto mb-2 sm:mb-3" />
                  <h3 className="text-base sm:text-lg font-semibold">هنوز نوتیفیکیشنی ثبت نشده</h3>
                  <p className="text-xs sm:text-sm mt-1">برای شروع، اولین نوتیفیکیشن را ثبت کنید</p>
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                  icon="plus"
                  className="w-full sm:w-auto"
                >
                  افزودن نوتیفیکیشن
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationStep;