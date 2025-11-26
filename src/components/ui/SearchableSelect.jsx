// src/components/ui/SearchableSelect.jsx
import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "جستجو...",
  disabled = false,
  error,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter(option =>
        option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input با قابلیت جستجو */}
      <div className="relative ">
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedOption?.label || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-[36px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
            error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        
        {/* آیکون‌های سمت چپ */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
          <FaSearch className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50  w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              موردی یافت نشد
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}

      {/* کلیک خارج برای بستن dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchableSelect;