// src/components/common/StepProgress.jsx
import React from 'react';

const StepProgress = ({ steps, currentStep }) => {
  const getStepStatus = (stepId) => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const stepIndex = steps.findIndex(step => step.id === stepId);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto mb-1 px-1">
      <div className="flex justify-center items-center space-x-1 sm:space-x-4 space-x-reverse">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <StepItem 
              step={step} 
              status={getStepStatus(step.id)} 
            />
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const StepItem = ({ step, status }) => {
  const statusConfig = {
    completed: {
      circle: 'bg-green-600 text-white border-green-600',
      text: 'text-green-600'
    },
    current: {
      circle: 'bg-blue-600 text-white border-blue-600',
      text: 'text-blue-600'
    },
    upcoming: {
      circle: 'bg-white border-gray-300',
      text: 'text-gray-400'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center ${config.text}`}>
      {/* دایره - خیلی کوچک در موبایل */}
      <div className={`w-4 h-4 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border text-[10px] sm:text-sm ${config.circle}`}>
        {step.number}
      </div>
      
      {/* متن - خیلی کوچک در موبایل */}
      <span className="mr-0.5 sm:mr-2 font-semibold text-[11.5px] sm:text-sm whitespace-nowrap">
        {step.label}
      </span>
    </div>
  );
};

export default StepProgress;