// src/components/common/StepHeader.jsx
import React from 'react';

const StepHeader = ({ 
  title, 
  description, 
  icon: Icon,
  gradientFrom = 'from-blue-600',
  gradientTo = 'to-indigo-700'
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-xl p-3 text-white text-center mb-3 shadow-lg`}> 
      <div className="flex items-center justify-center mb-1">
        {Icon && <Icon className="text-xl ml-2" />} 
        <h1 className="text-lg font-bold">{title}</h1>
      </div>
      <p className="text-blue-100 text-xs">{description}</p> 
    </div>
  );
};

export default StepHeader;