// src/components/ui/SelectField.jsx
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const SelectField = React.forwardRef(({ 
  label, 
  error, 
  options = [],
  placeholder = "انتخاب کنید",
  className = '',
  ...props 
}, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
          transition duration-200 bg-white
          ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center">
          <FaExclamationTriangle className="ml-1 text-xs" />
          {error.message}
        </p>
      )}
    </div>
  );
});

SelectField.displayName = 'SelectField';

export default SelectField;