// src/components/FormWizard.jsx
import React, { useState } from 'react';
import InspectionForm from './forms/InspectionForm';
import NotificationStep from './forms/NotificationStep';
import StepProgress from './common/StepProgress';
import { useFormState } from '../hooks/useFormState';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = useState('inspection');
  const { formData, lists, updateFormData, addToList, updateListItem, removeFromList } = useFormState({});

  // فقط دو مرحله
  const steps = [
    { id: 'inspection', label: 'اطلاعات بازرسی', number: 1 },
    { id: 'notification', label: 'نوتیفیکیشن', number: 2 }
  ];

  const handleStepComplete = (step, data) => {
    console.log(`تکمیل مرحله ${step}:`, data);
    updateFormData(data);
    
    // فقط دو مرحله
    const nextSteps = {
      inspection: 'notification'
      // notification مرحله آخر هست - دیگه مرحله‌ای بعدش نیست
    };
    
    if (nextSteps[step]) {
      setCurrentStep(nextSteps[step]);
    }
  };

  const handleBack = () => {
    // فقط دو مرحله
    const prevSteps = {
      notification: 'inspection'
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

    // فقط دو کامپوننت
    const stepComponents = {
      inspection: <InspectionForm {...commonProps} />,
      notification: <NotificationStep {...commonProps} lists={lists} onListChange={{ addToList, updateListItem, removeFromList }} />
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