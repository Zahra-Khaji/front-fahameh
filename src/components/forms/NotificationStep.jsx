// src/components/forms/NotificationStep.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationNumber } from '../../hooks/useNotificationNumber';

// Components
import StepHeader from '../common/StepHeader';
import RequestInfoSidebar from '../common/RequestInfoSidebar';
import NotificationForm from '../notification/NotificationForm';
import FinalConfirmationContent from '../notification/FinalConfirmationContent';
import ConfirmationModal from '../ui/ConfirmationModal';

// Hooks & Utils
import { useCreateInspection } from '../../hooks/useCreateInspection';
import { useUser } from '../../hooks/useUser';
import { formatPersianDate } from '../../utils/helpers';
import { FaHashtag } from 'react-icons/fa';
import { formatPersianDatesList } from '../../utils/helpers';

const NotificationStep = ({ onBack, onComplete, previousData, lists, onListChange }) => {
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [notificationData, setNotificationData] = useState(null);
  const navigate = useNavigate();
  
  const { user } = useUser();
  const { mutate: createInspection, isLoading: isCreating } = useCreateInspection();

  // تابع جدید برای دریافت داده از فرم
  const handleNotificationSubmit = (formData) => {
    console.log('Notification data submitted:', formData);
    
    // ذخیره داده‌های نوتیفیکیشن
    setNotificationData(formData);
    
    // نمایش مدال تأیید نهایی
    setShowFinalConfirmation(true);
  };

  // تابع برای ساخت داده‌های سرویس ثبت
// در تابع prepareInspectionData:
// src/components/forms/NotificationStep.jsx
// (در تابع prepareInspectionData)

// src/components/forms/NotificationStep.jsx
// (در تابع prepareInspectionData)

const prepareInspectionData = () => {
  if (!notificationData || !previousData) return null;

  const projectInfo = previousData.projectInfo;
  const inspectorInfo = previousData.inspectorInfo;

  // تبدیل نوع پروژه عددی به متن فارسی
  const projectTypeMap = {
    '0': 'خارجی', 
    '1': 'داخلی کالا',
    '2': 'داخلی کشتی'
  };

  // آرایه تاریخ‌های بازرسی
  const inspectionDatesArray = formatPersianDatesList(notificationData.inspectionRange);
  
  // **تبدیل تاریخ ارسال نوتیفیکیشن به فرمت فارسی**
  // استفاده از تابع formatPersianDate بهبود یافته
  let sendDatePersian = "1404/09/04"; // مقدار پیش‌فرض برای پشتیبانی
  
  if (notificationData.sendDate) {
    try {
      sendDatePersian = formatPersianDate(notificationData.sendDate);
      console.log('📅 تاریخ ارسال تبدیل شد:', {
        original: notificationData.sendDate,
        formatted: sendDatePersian,
        type: typeof notificationData.sendDate
      });
    } catch (error) {
      console.error('❌ خطا در تبدیل تاریخ ارسال:', error);
      // استفاده از مقدار پیش‌فرض
    }
  }

  console.log('📊 اطلاعات ارسالی به API:', {
    sendDate: sendDatePersian,
    inspectionDatesCount: inspectionDatesArray.length,
    inspectionDates: inspectionDatesArray
  });

  return {
    IDP: parseInt(projectInfo.projectId) || 0,
    IDOM: notificationData.idom || 1,
    InspectionDate: inspectionDatesArray,
    Over_Domestic: projectTypeMap[projectInfo.projectType] || projectInfo.projectType,
    InspectionLocation: inspectorInfo.inspectorLocation,
    RFI_Number: notificationData.number?.toString(),
    RFI_Recived_Date: sendDatePersian, // **اصلاح شده: استفاده از تاریخ انتخاب شده کاربر**
    RFI_Status: "در حال انجام",
    VendorName: projectInfo.vendor,
    Inspection_Duration: notificationData.inspectionDays?.toString(),
    Inspector_Name: inspectorInfo.inspectorName,
    Remark: "",
    QTY_3rdpartinspector: "",
    approved_Duration: "",
    Material: "",
    User_Name: user?.username || "m-sadri",
    NotificationNo: "",
    DateShamsi: "",
    Inspector_Type: "",
    Goods_Description: ""
  };
};

  // تابع ثبت نهایی در دیتابیس
 // در NotificationStep.jsx - تابع handleFinalCreate را اصلاح کنید:
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
      
      // **اضافه کردن refetch قبل از نویگیت**
      const projectName = previousData?.projectInfo?.projectName;
      
      // کمی تاخیر برای اطمینان از ذخیره شدن داده در سرور
      setTimeout(() => {
        console.log('🔄 Navigating to report page');
        navigate(`/admin/rfi-report?project=${encodeURIComponent(projectName)}&refresh=${Date.now()}`);
      }, 500); // 500ms تاخیر برای اطمینان
    },
    onError: (error) => {
      console.error('❌ handleFinalCreate: onError called with:', error);
    }
  });
};

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-3 px-3 sm:px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        
        <StepHeader
          title="ثبت اطلاعات نوتیفیکیشن"
          description="مرحله دوم - ثبت نوتیفیکیشن و برنامه‌ریزی بازرسی"
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
          <div className="lg:col-span-3">
            {/* نمایش فرم نوتیفیکیشن */}
            { (
              <NotificationForm
                lastNotificationNumber={null} // اگر نیاز دارید می‌توانید مقدار قبلی را پاس دهید
                onSubmit={handleNotificationSubmit}
                onCancel={onBack} // اگر کاربر انصراف داد به مرحله قبل برگردد
                previousData={previousData}
              />
            )}
          </div>
        </div>
      </div>

      {/* مدال تأیید نهایی برای ثبت در دیتابیس */}
 
<ConfirmationModal
  isOpen={showFinalConfirmation}
  onClose={() => setShowFinalConfirmation(false)}
  onConfirm={handleFinalCreate}
  title="تأیید اطلاعات ثبت"
  message="بررسی و ثبت نهایی درخواست بازرسی"
  confirmText={isCreating ? "در حال ثبت..." : "تأیید و ثبت"}
  cancelText="ویرایش مجدد"
  type="success"
  size="large"
  showCancelButton={true}
>
  <FinalConfirmationContent 
    previousData={previousData}
    notification={notificationData}
  />
</ConfirmationModal>
    </div>
  );
};

export default NotificationStep;