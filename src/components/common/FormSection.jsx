// src/components/common/FormSection.jsx
import React from 'react';

const FormSection = ({ 
  title, 
  icon: Icon, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      border border-blue-100 rounded-lg px-3 py-2 
      bg-gradient-to-r from-blue-50 to-indigo-50 mb-3 
      ${className}
    `}>
      <div className="flex items-center mb-2"> 
        <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full ml-2"></div> 
        {Icon && <Icon className="text-blue-600 text-xs ml-1" />} 
        <h2 className="text-sm font-bold text-gray-800">
          {title}
        </h2>
      </div>
      
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default FormSection;