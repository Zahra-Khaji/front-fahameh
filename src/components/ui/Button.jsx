// src/components/ui/Button.jsx
import React from 'react';
import { FaCheck, FaArrowLeft, FaPlus, FaSave } from 'react-icons/fa';

const Button = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'flex items-center justify-center transition duration-200 font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-12 py-4 text-lg',
    xl: 'px-16 py-5 text-xl'
  };

  const getIcon = () => {
    if (loading) return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />;
    
    const icons = {
      check: <FaCheck className="mr-2" />, // تغییر از ml-2 به mr-2
      arrowLeft: <FaArrowLeft className="mr-2" />, // تغییر از ml-2 به mr-2
      plus: <FaPlus className="mr-2" />, // تغییر از ml-2 به mr-2
      save: <FaSave className="mr-2" /> // تغییر از ml-2 به mr-2
    };
    
    return icon ? icons[icon] : null;
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed transform-none hover:shadow-lg' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {getIcon()}
    </button>
  );
};

export default Button;