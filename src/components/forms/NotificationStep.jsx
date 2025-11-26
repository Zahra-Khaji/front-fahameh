// src/components/forms/NotificationStep.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import { useNotificationNumber } from '../../hooks/useNotificationNumber';

// Components
import StepHeader from '../common/StepHeader';
import RequestInfoSidebar from '../common/RequestInfoSidebar';
import Button from '../ui/Button';
import NotificationForm from '../notification/NotificationForm';
import NotificationsList from '../notification/NotificationsList';
import ConfirmationModal from '../ui/ConfirmationModal';
import FinalConfirmationContent from '../notification/FinalConfirmationContent';

// Hooks & Utils
import { useNotifications } from '../../hooks/useNotifications';
import { useCreateInspection } from '../../hooks/useCreateInspection';
import { useUser } from '../../hooks/useUser';
import { formatPersianDate, formatDateRange } from '../../utils/helpers';
import { FaList, FaHashtag } from 'react-icons/fa';

const NotificationStep = ({ onBack, onComplete, previousData, lists, onListChange }) => {
  const [showAddForm, setShowAddForm] = useState(true);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const navigate = useNavigate(); // اضافه کردن این خط
  
  const { user } = useUser();
  const { mutate: createInspection, isLoading: isCreating } = useCreateInspection();
  
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
      createdAt: new Date(),
      idom: notificationData.idom
    };

    addNotification(newNotification);
    setShowAddForm(false);
  };

  // تابع برای ساخت داده‌های سرویس ثبت
  const prepareInspectionData = () => {
    if (!notifications.length || !previousData) return null;

    const firstNotification = notifications[0];
    const projectInfo = previousData.projectInfo;
    const inspectorInfo = previousData.inspectorInfo;

    // تبدیل نوع پروژه عددی به متن فارسی
    const projectTypeMap = {
    
      '0': 'خارجی', 
      '1': 'داخلی کالا',
      '2': 'داخلی کشتی'

    };

    return {
      IDP: parseInt(projectInfo.projectId) || 0,
      // IDOM: 1, // فعلاً ثابت
      IDOM: firstNotification.idom || 1,
      InspectionDate: formatPersianDate(firstNotification.inspectionRange[0]), // تاریخ اول بازرسی
      Over_Domestic: projectTypeMap[projectInfo.projectType] || projectInfo.projectType,
      InspectionLocation: projectInfo.province, // نام استان
      RFI_Number: firstNotification.number?.toString(),
      RFI_Recived_Date: "1404/09/04", // فعلاً ثابت
      RFI_Status: "در حال انجام",
      VendorName: projectInfo.vendor,
      Inspection_Duration: firstNotification.inspectionDays?.toString(),
      Inspector_Name: inspectorInfo.inspectorName,
      Remark: "",
      QTY_3rdpartinspector: "",
      approved_Duration: "",
      Material: "",
      User_Name: user?.username || "m-sadri", // از هوک user می‌گیریم
      NotificationNo: "",
      DateShamsi: "",
      Inspector_Type: "",
      Goods_Description: ""
    };
  };

  // تابع ثبت نهایی در دیتابیس
  const handleFinalCreate = () => {
    console.log('🟢 handleFinalCreate: Started');
    
    const inspectionData = prepareInspectionData();
    console.log('📋 handleFinalCreate: Prepared data:', inspectionData);
    
    if (!inspectionData) {
      console.error('❌ handleFinalCreate: No data to submit');
      return;
    }

    console.log('🚀 handleFinalCreate: Calling createInspection mutation');
    
    createInspection(inspectionData, {
      onSuccess: (data) => {
        console.log('✅ handleFinalCreate: onSuccess called with:', data);
        setShowFinalConfirmation(false);
        
        // نویگیت به صفحه گزارش
        const projectName = previousData?.projectInfo?.projectName;
        if (projectName) {
          console.log('🔄 Navigating to report page');
          navigate(`/admin/rfi-report?project=${encodeURIComponent(projectName)}`);
        } else {
          console.log('📋 No project name for navigation');
        }
        
        // بعد از ثبت موفق، داده‌ها رو به مرحله بعد پاس بدیم (اگر لازمه)
        const stepData = {
          notifications: notifications,
          inspectionRange: notifications[0]?.inspectionRange || []
        };
        onComplete(stepData);
      },
      onError: (error) => {
        console.error('❌ handleFinalCreate: onError called with:', error);
      }
    });
  };

  const handleCompleteStep = () => {
    console.log('🔵 Complete step clicked - showing confirmation modal');
    setShowFinalConfirmation(true);
  };

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

            {/* Add Notification Form */}
            {showAddForm && (
              <NotificationForm
                lastNotificationNumber={lastNotificationNumber}
                onSubmit={handleFinalSubmit}
                onCancel={() => setShowAddForm(false)}
                previousData={previousData}
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
                previousData={previousData}
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

      {/* مدال تأیید نهایی برای ثبت در دیتابیس */}
      <ConfirmationModal
        isOpen={showFinalConfirmation}
        onClose={() => setShowFinalConfirmation(false)}
        onConfirm={handleFinalCreate}
        title="ثبت نهایی درخواست بازرسی"
        message="آیا از ثبت نهایی درخواست بازرسی اطمینان دارید؟"
        confirmText={isCreating ? "در حال ثبت..." : "تأیید و ثبت نهایی"}
        cancelText="انصراف"
        type="success"
        size="large"
      >
        <FinalConfirmationContent 
          previousData={previousData}
          notifications={notifications}
        />
      </ConfirmationModal>
    </div>
  );
};

export default NotificationStep;