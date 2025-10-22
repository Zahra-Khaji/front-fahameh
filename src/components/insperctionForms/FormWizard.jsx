// src/components/FormWizard.jsx
import React, { useState } from 'react';
import InspectionForm from './InspectionForm';
import NotificationStep from './NotificationStep';
import ReportStep from './ReportStep';
import DailyInspectionReport from './DailyInspectionReport';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = useState('inspection');
  const [formData, setFormData] = useState({});

  // مدیریت تکمیل مرحله اول
  const handleInspectionComplete = (data) => {
    console.log('داده‌های دریافت شده از بازرسی:', data);
    setFormData(data);
    setCurrentStep('notification');
  };

  // مدیریت تکمیل مرحله دوم
  const handleNotificationComplete = (data) => {
    console.log('داده‌های دریافت شده از نوتیفیکیشن:', data);
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep('report');
  };

  // مدیریت تکمیل مرحله سوم
  const handleReportComplete = (data) => {
    console.log('داده‌های دریافت شده از گزارش:', data);
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep('dailyReport');
  };

  // مدیریت تکمیل مرحله چهارم (نهایی)
  const handleFinalComplete = (dailyReportData) => {
    console.log('داده‌های دریافت شده از صورت وضعیت:', dailyReportData);
    const finalData = {
      ...formData,
      dailyReport: dailyReportData
    };
    console.log('تمامی مراحل تکمیل شد!', finalData);
    alert('فرم با موفقیت ثبت شد!');
    
    // در اینجا می‌توانید داده‌ها را به سرور ارسال کنید
    // reset فرم یا redirect به صفحه دیگر
  };

  // مدیریت بازگشت
  const handleBack = () => {
    if (currentStep === 'notification') {
      setCurrentStep('inspection');
    } else if (currentStep === 'report') {
      setCurrentStep('notification');
    } else if (currentStep === 'dailyReport') {
      setCurrentStep('report');
    }
  };

  return (
    <div className="min-h-0 -mt-4">
      {/* ناوبری مراحل */}
      <div className="max-w-4xl mx-auto mb-1">
        <div className="flex justify-center items-center space-x-4 space-x-reverse">
          {/* مرحله اول */}
          <div className={`flex items-center ${
            currentStep === 'inspection' ? 'text-blue-600' : 
            ['notification', 'report', 'dailyReport'].includes(currentStep) ? 'text-green-600' : 'text-gray-400'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm ${
              currentStep === 'inspection' ? 'bg-blue-600 text-white border-blue-600' : 
              ['notification', 'report', 'dailyReport'].includes(currentStep) ? 'bg-green-600 text-white border-green-600' : 
              'bg-white border-gray-300'
            }`}>
              1
            </div>
            <span className="mr-2 font-semibold text-sm">اطلاعات بازرسی</span>
          </div>

          {/* خط اتصال */}
          <div className="flex-1 h-0.5 bg-gray-300"></div>

          {/* مرحله دوم */}
          <div className={`flex items-center ${
            currentStep === 'notification' ? 'text-blue-600' : 
            ['report', 'dailyReport'].includes(currentStep) ? 'text-green-600' : 
            currentStep === 'inspection' ? 'text-gray-400' : 'text-gray-400'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm ${
              currentStep === 'notification' ? 'bg-blue-600 text-white border-blue-600' : 
              ['report', 'dailyReport'].includes(currentStep) ? 'bg-green-600 text-white border-green-600' : 
              currentStep === 'inspection' ? 'bg-white border-gray-300' : 
              'bg-white border-gray-300'
            }`}>
              2
            </div>
            <span className="mr-2 font-semibold text-sm">نوتیفیکیشن</span>
          </div>

          {/* خط اتصال */}
          <div className="flex-1 h-0.5 bg-gray-300"></div>

          {/* مرحله سوم */}
          <div className={`flex items-center ${
            currentStep === 'report' ? 'text-blue-600' : 
            currentStep === 'dailyReport' ? 'text-green-600' : 
            ['inspection', 'notification'].includes(currentStep) ? 'text-gray-400' : 'text-gray-400'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm ${
              currentStep === 'report' ? 'bg-blue-600 text-white border-blue-600' : 
              currentStep === 'dailyReport' ? 'bg-green-600 text-white border-green-600' : 
              ['inspection', 'notification'].includes(currentStep) ? 'bg-white border-gray-300' : 
              'bg-white border-gray-300'
            }`}>
              3
            </div>
            <span className="mr-2 font-semibold text-sm">گزارش بازرس</span>
          </div>

          {/* خط اتصال */}
          <div className="flex-1 h-0.5 bg-gray-300"></div>

          {/* مرحله چهارم - جدید */}
          <div className={`flex items-center ${
            currentStep === 'dailyReport' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-sm ${
              currentStep === 'dailyReport' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300'
            }`}>
              4
            </div>
            <span className="mr-2 font-semibold text-sm">صورت وضعیت</span>
          </div>
        </div>
      </div>

      {/* رندر مرحله فعلی */}
      {currentStep === 'inspection' && (
        <InspectionForm onComplete={handleInspectionComplete} />
      )}

      {currentStep === 'notification' && (
        <NotificationStep 
          onBack={handleBack}
          onComplete={handleNotificationComplete}
          previousData={formData}
        />
      )}

      {currentStep === 'report' && (
        <ReportStep 
          onBack={handleBack}
          onComplete={handleReportComplete}
          previousData={formData}
        />
      )}

      {currentStep === 'dailyReport' && (
        <DailyInspectionReport 
          onBack={handleBack}
          onComplete={handleFinalComplete}
          previousData={formData}
        />
      )}
    </div>
  );
};

export default FormWizard;