// src/components/FormWizard.jsx
import React, { useState } from 'react';
import InspectionForm from './forms/InspectionForm';
import NotificationStep from './forms/NotificationStep';
import DailyInspectionReport from './forms/DailyInspectionReport';
import StepProgress from './common/StepProgress';
import { useFormState } from '../hooks/useFormState';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = useState('inspection');
  const { formData, lists, updateFormData, addToList, updateListItem, removeFromList } = useFormState({});

  // حذف مرحله گزارش بازرس
  const steps = [
    { id: 'inspection', label: 'اطلاعات بازرسی', number: 1 },
    { id: 'notification', label: 'نوتیفیکیشن', number: 2 },
    { id: 'dailyReport', label: 'صورت وضعیت', number: 3 } // تغییر شماره به 3
  ];

  const handleStepComplete = (step, data) => {
    console.log(`تکمیل مرحله ${step}:`, data);
    updateFormData(data);
    
    // حذف مرحله report از nextSteps
    const nextSteps = {
      inspection: 'notification',
      notification: 'dailyReport' // مستقیماً به صورت وضعیت برو
    };
    
    if (nextSteps[step]) {
      setCurrentStep(nextSteps[step]);
    }
  };

  const handleBack = () => {
    // حذف مرحله report از prevSteps
    const prevSteps = {
      notification: 'inspection',
      dailyReport: 'notification'
    };
    
    if (prevSteps[currentStep]) {
      setCurrentStep(prevSteps[currentStep]);
    }
  };

  const renderCurrentStep = () => {
    const commonProps = {
      onBack: handleBack,
      onComplete: (data) => handleStepComplete(currentStep, data),
      previousData: formData
    };

    // حذف ReportStep
    const stepComponents = {
      inspection: <InspectionForm {...commonProps} />,
      notification: <NotificationStep {...commonProps} lists={lists} onListChange={{ addToList, updateListItem, removeFromList }} />,
      dailyReport: <DailyInspectionReport {...commonProps} lists={lists} />
    };

    return stepComponents[currentStep];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2">
        {/* Step Progress - بهبود برای موبایل */}
        <div className="mb-6 sm:mb-0.5">
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>
        
        {/* Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default FormWizard;