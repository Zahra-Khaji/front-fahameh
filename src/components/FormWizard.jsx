// src/components/FormWizard.jsx
import React, { useState } from 'react';
import InspectionForm from './forms/InspectionForm';
import NotificationStep from './forms/NotificationStep';
import ReportStep from './forms/ReportStep';
import DailyInspectionReport from './forms/DailyInspectionReport';
import StepProgress from './common/StepProgress';
import { useFormState } from '../hooks/useFormState';

const FormWizard = () => {
  const [currentStep, setCurrentStep] = useState('inspection');
  const { formData, lists, updateFormData, addToList, updateListItem, removeFromList } = useFormState({});

  const steps = [
    { id: 'inspection', label: 'اطلاعات بازرسی', number: 1 },
    { id: 'notification', label: 'نوتیفیکیشن', number: 2 },
    { id: 'report', label: 'گزارش بازرس', number: 3 },
    { id: 'dailyReport', label: 'صورت وضعیت', number: 4 }
  ];

  const handleStepComplete = (step, data) => {
    console.log(`تکمیل مرحله ${step}:`, data);
    updateFormData(data);
    
    const nextSteps = {
      inspection: 'notification',
      notification: 'report',
      report: 'dailyReport'
    };
    
    if (nextSteps[step]) {
      setCurrentStep(nextSteps[step]);
    }
  };

  const handleBack = () => {
    const prevSteps = {
      notification: 'inspection',
      report: 'notification',
      dailyReport: 'report'
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

    const stepComponents = {
      inspection: <InspectionForm {...commonProps} />,
      notification: <NotificationStep {...commonProps} lists={lists} onListChange={{ addToList, updateListItem, removeFromList }} />,
      report: <ReportStep {...commonProps} lists={lists} onListChange={{ addToList, updateListItem, removeFromList }} />,
      dailyReport: <DailyInspectionReport {...commonProps} lists={lists} />
    };

    return stepComponents[currentStep];
  };

  return (
    <div className="min-h-0 -mt-4">
      <StepProgress steps={steps} currentStep={currentStep} />
      {renderCurrentStep()}
    </div>
  );
};

export default FormWizard;