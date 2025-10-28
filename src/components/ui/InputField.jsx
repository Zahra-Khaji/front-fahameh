// src/components/ui/InputField.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const InputField = React.forwardRef(({ 
  label, 
  error, 
  className = '',
  readOnly = false,
  ...props 
}, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition duration-200 bg-white
          ${readOnly ? 'bg-blue-50 cursor-not-allowed text-gray-600' : ''}
          ${className}
        `}
        readOnly={readOnly}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <FaExclamationTriangle className="ml-1 text-xs" />
          {error.message}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;