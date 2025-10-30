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

// در NotificationStep.jsx - تابع handleCompleteStep رو چک کنید:
const handleCompleteStep = () => {
  const stepData = {
    notifications: notifications,
    inspectionRange: notifications[0]?.inspectionRange || []
  };
  console.log('ارسال داده‌های نوتیفیکیشن:', stepData);
  onComplete(stepData); // اینجا داده‌ها به مرحله بعد فرستاده می‌شوند
};

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4">
      <div className="max-w-6xl mx-auto">
        
        <StepHeader
          title="ثبت اطلاعات نوتیفیکیشن"
          description="مرحله دوم - مدیریت اطلاع‌رسانی و برنامه‌ریزی بازرسی"
          icon={FaHashtag}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RequestInfoSidebar 
              previousData={previousData} 
              onBack={onBack} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
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
                onComplete={handleCompleteStep}
              />
            )}

            {/* Empty State */}
            {!showAddForm && notifications.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <FaList className="text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">هنوز نوتیفیکیشنی ثبت نشده</h3>
                  <p className="text-sm mt-1">برای شروع، اولین نوتیفیکیشن را ثبت کنید</p>
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                  icon="plus"
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