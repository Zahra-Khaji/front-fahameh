// src/components/ui/SearchableSelect.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(''); // مقدار مستقیم input
  
  // Refs
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionRefs = useRef([]);

  // مقدار اولیه inputValue بر اساس value
  useEffect(() => {
    const selected = options.find(opt => opt.value === value);
    setInputValue(selected?.label || '');
  }, [value, options]);

  // فیلتر کردن گزینه‌ها بر اساس searchTerm
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = options.filter(option =>
        option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  // وقتی dropdown باز شد، فوکوس روی input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          
          // اگر searchTerm داریم، cursor را به انتها ببر
          if (searchTerm) {
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
          }
        }
      }, 10);
    }
  }, [isOpen]);

  // مدیریت کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // وقتی بسته می‌شود، مقدار input را به selected تنظیم کن
        const selected = options.find(opt => opt.value === value);
        setInputValue(selected?.label || '');
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [value, options]);

  // مدیریت رویدادهای کیبورد
  const handleKeyDown = useCallback((e) => {
    if (disabled) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSearchTerm(inputValue);
        } else {
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setSearchTerm(inputValue);
        } else {
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
        }
        break;
        
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          setSearchTerm(inputValue);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        const selected = options.find(opt => opt.value === value);
        setInputValue(selected?.label || '');
        setSearchTerm('');
        break;
        
      default:
        // برای حروف و اعداد
        if (/^[a-zA-Z0-9آ-ی]$/.test(e.key) || e.key === 'Backspace' || e.key === 'Delete') {
          if (!isOpen) {
            setIsOpen(true);
          }
        }
        break;
    }
  }, [isOpen, filteredOptions, highlightedIndex, disabled, value, options, inputValue]);

  // اسکرول به گزینه highlighted
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex] && dropdownRef.current) {
      const optionElement = optionRefs.current[highlightedIndex];
      const dropdownElement = dropdownRef.current;
      
      const optionTop = optionElement.offsetTop;
      const optionBottom = optionTop + optionElement.offsetHeight;
      const dropdownScrollTop = dropdownElement.scrollTop;
      const dropdownHeight = dropdownElement.clientHeight;
      
      if (optionTop < dropdownScrollTop) {
        dropdownElement.scrollTop = optionTop;
      } else if (optionBottom > dropdownScrollTop + dropdownHeight) {
        dropdownElement.scrollTop = optionBottom - dropdownHeight;
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    onChange(option.value);
    setInputValue(option.label);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onChange('');
    setInputValue('');
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    if (!isOpen) {
      setIsOpen(true);
      setSearchTerm(inputValue);
    }
    
    // cursor را به انتها ببر
    setTimeout(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchTerm(newValue);
    
    if (!isOpen) {
      setIsOpen(true);
    }
    
    // highlightedIndex را ریست کن
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    if (!isOpen && !disabled) {
      setIsOpen(true);
      setSearchTerm(inputValue);
    }
  };

  const handleOptionMouseEnter = (index) => {
    setHighlightedIndex(index);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Input با قابلیت جستجو */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full h-[36px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-right ${
            error ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          ${isOpen ? 'ring-2 ring-blue-200 border-blue-500' : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="searchable-select-dropdown"
        />
        
        {/* آیکون‌های سمت چپ */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              onMouseDown={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
              title="پاک کردن انتخاب"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
          <FaSearch className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          id="searchable-select-dropdown"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-labelledby="searchable-select-input"
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              موردی یافت نشد
            </div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                ref={el => optionRefs.current[index] = el}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => handleOptionMouseEnter(index)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors text-right ${
                  value === option.value
                    ? 'bg-blue-100 text-blue-700 font-medium border-r-2 border-blue-500'
                    : highlightedIndex === index
                    ? 'bg-blue-50 text-gray-800'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                role="option"
                aria-selected={value === option.value}
                data-index={index}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;