import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FaSearch, FaTimes, FaChevronDown } from 'react-icons/fa';
import ReactDOM from 'react-dom';

const TableSearchableSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "انتخاب کنید...",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  // بررسی اینکه آیا مقدار فعلی در options وجود دارد یا خیر
  const isValueInOptions = useMemo(() => {
    return options.some(opt => opt.value === value);
  }, [options, value]);

  // پیدا کردن برچسب مقدار انتخاب شده
  const selectedLabel = useMemo(() => {
    if (value && !isValueInOptions) {
      return value;
    }
    return options.find(opt => opt.value === value)?.label || '';
  }, [options, value, isValueInOptions]);

  // ساخت لیست کامل گزینه‌ها (شامل مقدار فعلی اگر در لیست نباشد)
  const allOptions = useMemo(() => {
    if (value && !isValueInOptions) {
      return [{ value: value, label: value }, ...options];
    }
    return options;
  }, [options, value, isValueInOptions]);

  // فیلتر کردن گزینه‌ها بر اساس جستجو
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) {
      return allOptions;
    }
    const term = searchTerm.trim().toLowerCase();
    return allOptions.filter(opt => 
      opt.label?.toLowerCase().includes(term) ||
      opt.value?.toString().toLowerCase().includes(term)
    );
  }, [allOptions, searchTerm]);

  // محاسبه موقعیت dropdown
  const updateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // باز کردن dropdown
  const handleOpen = () => {
    if (!disabled) {
      updateDropdownPosition();
      setIsOpen(true);
      setSearchTerm('');
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  };

  // بستن dropdown
  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  // انتخاب گزینه
  const handleSelect = (opt) => {
    // console.log('✅ انتخاب شد:', opt);
    if (onChange) {
      onChange(opt.value);
    }
    // بستن dropdown
    setIsOpen(false);
    setSearchTerm('');
  };

  // پاک کردن انتخاب
  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onChange) {
      onChange('');
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  // بستن هنگام کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // به‌روزرسانی موقعیت هنگام اسکرول یا رزایز
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // جلوگیری از propagation برای جلوگیری از بسته شدن ناخواسته
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* نمایشگر انتخاب شده */}
      <div
        ref={buttonRef}
        onClick={handleOpen}
        className={`w-full px-2 py-1.5 text-xs border rounded-md flex items-center justify-between cursor-pointer transition-colors ${
          disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-white hover:border-blue-400'
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'}`}
      >
        <span className={`truncate ${!selectedLabel ? 'text-gray-400' : 'text-gray-800'}`}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-red-500"
            >
              <FaTimes className="text-[10px]" />
            </button>
          )}
          <FaChevronDown className={`text-gray-400 text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown با Portal */}
      {isOpen && !disabled && ReactDOM.createPortal(
        <div 
          className="fixed z-[9999] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          style={{
            top: dropdownPosition.top + 5,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: '300px'
          }}
          onClick={handleDropdownClick}
        >
          {/* جستجو */}
          <div className="p-2 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="جستجو..."
                className="w-full px-2 py-1.5 pr-6 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 text-right"
                onClick={(e) => e.stopPropagation()}
              />
              <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-[10px]" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-[10px]" />
                </button>
              )}
            </div>
          </div>
          
          {/* لیست گزینه‌ها */}
          <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">
                {searchTerm ? `نتیجه‌ای برای "${searchTerm}" یافت نشد` : "موردی یافت نشد"}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isCurrentValue = value === opt.value && !isValueInOptions;
                return (
                  <div
                    key={`${opt.value}-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    //   console.log('🖱️ کلیک روی گزینه:', opt);
                      handleSelect(opt);
                    }}
                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                      value === opt.value
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-800'
                    } ${isCurrentValue ? 'border-r-2 border-blue-500' : ''}`}
                  >
                    {opt.label}
                    {isCurrentValue && (
                      <span className="mr-2 text-[10px] text-gray-400">(فعلی)</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TableSearchableSelect;