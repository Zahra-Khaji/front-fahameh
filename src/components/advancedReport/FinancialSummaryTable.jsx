// src/components/reports/FinancialSummaryTable.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FaTrash, FaSort, FaSortUp, FaSortDown, 
  FaFilter, FaTimes, FaSearch, FaSave ,FaEdit 
} from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';
import FinancialSaveConfirmationPopover from './FinancialSaveConfirmationPopover';
import { toast } from 'react-hot-toast';

const FinancialSummaryTable = ({ data, onDelete, onEdit, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [editingCell, setEditingCell] = useState(null); // { rowIndex, columnName }
  const [editedValue, setEditedValue] = useState('');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedRows, setModifiedRows] = useState({}); // آبجکت برای track ردیف‌های تغییر کرده
  
  // state محلی برای داده‌ها (برای دمو)
  const [localData, setLocalData] = useState(data);
  
  const scrollContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const filterRefs = useRef({});
  const inputRefs = useRef({});

  // به‌روزرسانی localData وقتی prop.data تغییر می‌کنه
  useEffect(() => {
    setLocalData(data);
    // وقتی داده جدید از والد میاد، modifiedRows رو ریست کن
    setModifiedRows({});
  }, [data]);

  // تنظیم موقعیت اسکرول افقی به ابتدا (راست) در بارگذاری اولیه
  useEffect(() => {
    if (scrollContainerRef.current && localData && localData.length > 0) {
      if (isInitialLoad) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            setTimeout(() => {
              setIsTableReady(true);
              setIsInitialLoad(false);
            }, 50);
          }
        });
      }
    }
  }, [localData, isInitialLoad]);

  // فوکوس خودکار روی اینپوت وقتی ویرایش فعال میشه
  useEffect(() => {
    if (editingCell) {
      const inputKey = `${editingCell.rowIndex}-${editingCell.columnName}`;
      setTimeout(() => {
        if (inputRefs.current[inputKey]) {
          inputRefs.current[inputKey].focus();
        }
      }, 50);
    }
  }, [editingCell]);

  // بستن فیلترها با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && filterRefs.current[openFilter] && !filterRefs.current[openFilter].contains(event.target)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  // استخراج اسامی ستون‌ها از دیتا
  const columnNames = useMemo(() => {
    if (!localData || localData.length === 0) return [];
    return Object.keys(localData[0]);
  }, [localData]);

  // تشخیص نوع ستون (عددی یا متنی)
  const getColumnType = (columnName) => {
    if (!localData || localData.length === 0) return 'string';
    
    const numericColumns = ['نفر-روز', 'هزینه بازرسی', 'قیمت نهایی', 'مبلغ کل', 'مبلغ ثابت', 'تعداد روز تایید نهایی', 'جمع کارکرد اعداد ثابت'];
    if (numericColumns.includes(columnName)) {
      return 'number';
    }
    
    const sample = localData[0]?.[columnName];
    if (typeof sample === 'number') return 'number';
    if (sample && !isNaN(parseFloat(sample)) && isFinite(sample)) return 'number';
    
    return 'string';
  };

  // گرفتن مقادیر یکتا برای ستون‌های متنی
  const getUniqueValues = (columnName) => {
    if (!localData) return [];
    const values = [...new Set(localData.map(item => item[columnName]).filter(Boolean))];
    return values.sort((a, b) => String(a).localeCompare(String(b), 'fa'));
  };

  // تابع sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
      key = null;
    }
    setSortConfig({ key, direction });
  };

  // آیکون sort
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-white/60 mr-1 text-xs" />;
    }
    if (sortConfig.direction === 'asc') {
      return <FaSortUp className="text-white mr-1 text-xs" />;
    }
    if (sortConfig.direction === 'desc') {
      return <FaSortDown className="text-white mr-1 text-xs" />;
    }
    return <FaSort className="text-white/60 mr-1 text-xs" />;
  };

  // توابع فیلتر
  const toggleSelectAll = (columnName, uniqueValues) => {
    const currentFilter = activeFilters[columnName];
    if (currentFilter?.type === 'checkbox' && currentFilter.value.length === uniqueValues.length) {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'checkbox', value: [...uniqueValues] }
      });
    }
  };

  const toggleItem = (columnName, itemValue) => {
    const currentFilter = activeFilters[columnName];
    let newValues;
    
    if (currentFilter?.type === 'checkbox') {
      if (currentFilter.value.includes(itemValue)) {
        newValues = currentFilter.value.filter(v => v !== itemValue);
      } else {
        newValues = [...currentFilter.value, itemValue];
      }
    } else {
      newValues = [itemValue];
    }
    
    if (newValues.length === 0) {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'checkbox', value: newValues }
      });
    }
  };

  const handleTextFilterChange = (columnName, text) => {
    if (text.trim() === '') {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'text', value: text }
      });
    }
  };

  const clearColumnFilter = (columnName) => {
    const newFilters = { ...activeFilters };
    delete newFilters[columnName];
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // اعمال sort و filter روی داده‌ها
  const filteredAndSortedData = useMemo(() => {
    if (!localData) return [];
    
    let result = [...localData];
    
    Object.entries(activeFilters).forEach(([columnName, filter]) => {
      if (filter.type === 'checkbox' && filter.value.length > 0) {
        result = result.filter(item => filter.value.includes(item[columnName]));
      } else if (filter.type === 'text' && filter.value.trim() !== '') {
        result = result.filter(item => 
          String(item[columnName] || '').toLowerCase().includes(filter.value.toLowerCase())
        );
      }
    });
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        const columnType = getColumnType(sortConfig.key);

        if (columnType === 'number') {
          aVal = aVal || 0;
          bVal = bVal || 0;
          if (sortConfig.direction === 'asc') {
            return aVal - bVal;
          } else {
            return bVal - aVal;
          }
        }

        aVal = String(aVal || '');
        bVal = String(bVal || '');
        
        if (sortConfig.direction === 'asc') {
          return aVal.localeCompare(bVal, 'fa');
        } else {
          return bVal.localeCompare(aVal, 'fa');
        }
      });
    }
    
    return result;
  }, [localData, sortConfig, activeFilters]);

  // فرمت کردن مقادیر برای نمایش
  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined) return '-';
    
    const columnType = getColumnType(columnName);
    
    if (columnName === 'سال') {
      return String(value);
    }
    
    if (columnType === 'number') {
      return new Intl.NumberFormat('fa-IR').format(value);
    }
    
    return String(value);
  };

  // تشخیص راست‌چین یا چپ‌چین بودن سلول
  const getCellAlignment = (columnName) => {
    const columnType = getColumnType(columnName);
    if (columnName === 'سال') {
      return 'text-right';
    }
    return columnType === 'number' ? 'text-left' : 'text-right';
  };

  // تشخیص نوع فیلتر مناسب برای هر ستون
  const getFilterTypeForColumn = (columnName) => {
    const textFilterColumns = ['توضیحات', 'کد پرسنلی'];
    if (textFilterColumns.includes(columnName)) {
      return 'text';
    }
    return 'auto';
  };

  // تشخیص اینکه آیا ستون قابل ویرایش است
  const isEditableColumn = (columnName) => {
    return columnName === 'تعداد روز تایید نهایی' || columnName === 'جمع کارکرد اعداد ثابت';
  };

// کلیک روی سلول برای ویرایش
const handleCellClick = (rowIndex, columnName, currentValue) => {
  if (isEditableColumn(columnName)) {
    setEditingCell({ rowIndex, columnName });
    setEditedValue(currentValue || '');
    // وقتی تازه سلول رو کلیک می‌کنیم، هنوز ردیف رو modified علامت نمی‌زنیم
    // این کار رو می‌سپاریم به handleInputChange
  }
};

const handleInputChange = (e) => {
  // فقط اعداد مجاز هستند
  const value = e.target.value.replace(/[^0-9]/g, '');
  setEditedValue(value);
  
  // به محض اینکه کاربر شروع به تایپ کرد (مقدار با قبلی فرق داشت)
  if (editingCell && value !== localData[editingCell.rowIndex][editingCell.columnName]?.toString()) {
    setModifiedRows(prev => ({
      ...prev,
      [editingCell.rowIndex]: true
    }));
  }
};

// ذخیره تغییرات یک سلول
const handleSaveClick = (rowIndex, columnName) => {
  if (editedValue === '') return;
  
  // دیگه اینجا modified رو set نمی‌کنیم، چون قبلاً تو handleInputChange set شده
  setShowSaveConfirmation(true);
};

// تأیید نهایی ذخیره
const handleConfirmSave = () => {
  if (!editingCell) return;
  
  setIsSaving(true);
  
  // شبیه‌سازی درخواست به سرور
  setTimeout(() => {
    const { rowIndex, columnName } = editingCell;
    
    // ایجاد یک کپی از داده‌های محلی و اعمال تغییرات
    const updatedData = [...localData];
    const rowToUpdate = { ...updatedData[rowIndex] };
    
    // اعمال تغییر
    const numericValue = editedValue ? parseInt(editedValue, 10) : 0;
    rowToUpdate[columnName] = numericValue;
    
    updatedData[rowIndex] = rowToUpdate;
    
    // به روز رسانی state محلی
    setLocalData(updatedData);
    
    // همچنین اگر onEdit وجود داره، به والد هم اطلاع بده
    if (onEdit) {
      onEdit(rowToUpdate);
    }
    
    // حذف علامت تغییر از این ردیف (برگشتن به رنگ عادی)
    setModifiedRows(prev => {
      const newModifiedRows = { ...prev };
      delete newModifiedRows[rowIndex];
      return newModifiedRows;
    });
    
    // بستن پاپ‌آپ و ریست stateها
    setIsSaving(false);
    setShowSaveConfirmation(false);
    setEditingCell(null);
    setEditedValue('');
    
    // نمایش toast موفقیت
    toast.success('تغییرات با موفقیت ذخیره شد!', {
      position: 'top-center',
      duration: 3000,
      icon: '✅',
      style: {
        background: '#10b981',
        color: 'white',
        borderRadius: '10px',
        padding: '16px',
        fontSize: '14px',
        direction: 'rtl',
        textAlign: 'right',
      },
    });
    
  }, 250);
};

  // بستن پاپ‌آپ بدون ذخیره
// بستن پاپ‌آپ بدون ذخیره
const handleClosePopover = () => {
  setShowSaveConfirmation(false);
  // اگر کاربر انصراف داد، علامت تغییر رو حذف می‌کنیم
  if (editingCell) {
    setModifiedRows(prev => {
      const newModifiedRows = { ...prev };
      delete newModifiedRows[editingCell.rowIndex];
      return newModifiedRows;
    });
  }
  setEditingCell(null);
  setEditedValue('');
};

  const activeFiltersCount = Object.keys(activeFilters).length;

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mr-3 text-gray-600">در حال بارگذاری اطلاعات...</span>
        </div>
      </div>
    );
  }

  if (!localData || localData.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">اطلاعاتی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
      {/* پوشاننده اصلی با position relative */}
      <div ref={tableWrapperRef} className="relative flex-1" style={{ height: '100%' }}>
        {/* لودینگ کوچک تا وقتی جدول آماده نشده */}
        {!isTableReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">در حال آماده‌سازی جدول...</span>
            </div>
          </div>
        )}
        
        {/* جدول اصلی */}
        <div 
          ref={scrollContainerRef}
          dir="ltr" 
          className="absolute inset-0 overflow-auto" 
          style={{ 
            visibility: isTableReady ? 'visible' : 'hidden',
          }}
        >
          <div dir="rtl" className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                    style={{ paddingRight: '24px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>ردیف</span>
                    </div>
                  </th>
                  
                  {columnNames.map((columnName, index) => {
                    const columnType = getColumnType(columnName);
                    const uniqueValues = columnType === 'string' ? getUniqueValues(columnName) : [];
                    const activeFilter = activeFilters[columnName];
                    const isFilterActive = activeFilter !== undefined;
                    
                    const filterType = getFilterTypeForColumn(columnName);
                    
                    return (
                      <th 
                        key={index}
                        scope="col" 
                        className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                      >
                        <div className="flex items-center gap-1">
                          <span>{columnName}</span>
                          
                          {columnType === 'string' && (
                            <>
                              {filterType === 'text' && (
                                <div 
                                  className="relative" 
                                  ref={el => filterRefs.current[columnName] = el}
                                >
                                  <button
                                    onClick={() => setOpenFilter(openFilter === columnName ? null : columnName)}
                                    className={`p-1 rounded transition-colors duration-200 ${
                                      isFilterActive
                                        ? 'bg-blue-700 text-yellow-300'
                                        : 'hover:bg-blue-700 text-white'
                                    }`}
                                    title={`جستجو در ${columnName}`}
                                  >
                                    <FaSearch className="text-xs" />
                                  </button>
                                  
                                  {openFilter === columnName && (
                                    <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px]">
                                      <div className="p-2 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-semibold text-gray-700">جستجوی {columnName}</span>
                                          <button
                                            onClick={() => setOpenFilter(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <FaTimes className="text-xs" />
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={activeFilter?.type === 'text' ? activeFilter.value : ''}
                                            onChange={(e) => handleTextFilterChange(columnName, e.target.value)}
                                            placeholder={`جستجوی ${columnName}...`}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-right"
                                            autoFocus
                                          />
                                          {isFilterActive && (
                                            <button
                                              onClick={() => clearColumnFilter(columnName)}
                                              className="text-red-600 hover:text-red-800 text-xs whitespace-nowrap"
                                            >
                                              پاک کردن
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {filterType === 'auto' && uniqueValues.length <= 20 && (
                                <div 
                                  className="relative" 
                                  ref={el => filterRefs.current[columnName] = el}
                                >
                                  <button
                                    onClick={() => setOpenFilter(openFilter === columnName ? null : columnName)}
                                    className={`p-1 rounded transition-colors duration-200 ${
                                      isFilterActive
                                        ? 'bg-blue-700 text-yellow-300'
                                        : 'hover:bg-blue-700 text-white'
                                    }`}
                                    title={`فیلتر ${columnName}`}
                                  >
                                    <FaFilter className="text-xs" />
                                  </button>
                                  
                                  {openFilter === columnName && (
                                    <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-h-[300px] overflow-y-auto">
                                      <div className="p-2 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-semibold text-gray-700">انتخاب {columnName}</span>
                                          <button
                                            onClick={() => setOpenFilter(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <FaTimes className="text-xs" />
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <label className="flex items-center gap-1 text-xs">
                                            <input
                                              type="checkbox"
                                              checked={activeFilter?.type === 'checkbox' && activeFilter.value.length === uniqueValues.length}
                                              onChange={() => toggleSelectAll(columnName, uniqueValues)}
                                              className="rounded border-gray-300 text-blue-600"
                                            />
                                            <span>انتخاب همه</span>
                                          </label>
                                          {isFilterActive && (
                                            <button
                                              onClick={() => clearColumnFilter(columnName)}
                                              className="text-red-600 hover:text-red-800 text-xs mr-auto"
                                            >
                                              پاک کردن
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <div className="p-2">
                                        {uniqueValues.map(value => (
                                          <label key={value} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={activeFilter?.type === 'checkbox' && activeFilter.value.includes(value)}
                                              onChange={() => toggleItem(columnName, value)}
                                              className="rounded border-gray-300 text-blue-600"
                                            />
                                            <span className="text-xs text-gray-700">{String(value)}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {filterType === 'auto' && uniqueValues.length > 20 && (
                                <div 
                                  className="relative" 
                                  ref={el => filterRefs.current[columnName] = el}
                                >
                                  <button
                                    onClick={() => setOpenFilter(openFilter === columnName ? null : columnName)}
                                    className={`p-1 rounded transition-colors duration-200 ${
                                      isFilterActive
                                        ? 'bg-blue-700 text-yellow-300'
                                        : 'hover:bg-blue-700 text-white'
                                    }`}
                                    title={`جستجو در ${columnName}`}
                                  >
                                    <FaSearch className="text-xs" />
                                  </button>
                                  
                                  {openFilter === columnName && (
                                    <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px]">
                                      <div className="p-2 border-b border-gray-200">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-semibold text-gray-700">جستجوی {columnName}</span>
                                          <button
                                            onClick={() => setOpenFilter(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                          >
                                            <FaTimes className="text-xs" />
                                          </button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="text"
                                            value={activeFilter?.type === 'text' ? activeFilter.value : ''}
                                            onChange={(e) => handleTextFilterChange(columnName, e.target.value)}
                                            placeholder={`جستجوی ${columnName}...`}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white text-right"
                                            autoFocus
                                          />
                                          {isFilterActive && (
                                            <button
                                              onClick={() => clearColumnFilter(columnName)}
                                              className="text-red-600 hover:text-red-800 text-xs whitespace-nowrap"
                                            >
                                              پاک کردن
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          
                          <button
                            onClick={() => handleSort(columnName)}
                            className="p-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            {getSortIcon(columnName)}
                          </button>
                        </div>
                        
                        {isFilterActive && (
                          <div className="text-[10px] text-yellow-300 mt-0.5">
                            {activeFilter.type === 'checkbox' && `${activeFilter.value.length} انتخاب`}
                            {activeFilter.type === 'text' && `شامل: ${activeFilter.value}`}
                          </div>
                        )}
                      </th>
                    );
                  })}
                  
                  {/* ستون عملیات - فقط دکمه حذف */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                  >
                    <span>حذف</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  

{filteredAndSortedData.map((item, index) => {
  // تشخیص آیا این ردیف تغییر کرده
  const isModified = modifiedRows[index] === true;
  
  return (
    <tr 
      key={`${item["شماره RFI"] || index}-${index}`} 
      className={`
        hover:bg-gray-50 
        transition-colors duration-300
        ${isModified ? 'bg-amber-100' : ''}
      `}
      style={{
        backgroundColor: isModified ? '#fef3c7' : '', // amber-100
      }}
    >
      <td 
        className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
        style={{ paddingRight: '24px' }}
      >
        {index + 1}
      </td>
      
      {columnNames.map((columnName, colIndex) => {
        const isEditing = editingCell && 
                         editingCell.rowIndex === index && 
                         editingCell.columnName === columnName;
        
        const inputKey = `${index}-${columnName}`;
        
        return (
          <td 
            key={colIndex}
            className={`px-3 py-2 whitespace-nowrap text-xs text-gray-900 ${getCellAlignment(columnName)}`}
            onClick={() => handleCellClick(index, columnName, item[columnName])}
          >
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <input
                    ref={el => inputRefs.current[inputKey] = el}
                    type="text"
                    value={editedValue}
                    onChange={handleInputChange}
                    className="w-20 px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="عدد"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {/* دکمه ذخیره مخصوص این سلول */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveClick(index, columnName);
                    }}
                    className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                    title="ذخیره"
                    disabled={editedValue === ''}
                  >
                    <FaSave size={12} />
                  </button>
                </>
              ) : (
                <>
                  {columnName === 'شماره RFI' ? (
                    <span className="font-mono">{formatCellValue(item[columnName], columnName)}</span>
                  ) : (
                    formatCellValue(item[columnName], columnName)
                  )}
                  
                  {/* اگر ستون قابل ویرایش است، یه آیکون کوچک ویرایش نشون بده - بدون group-hover */}
                  {isEditableColumn(columnName) && (
                    <FaEdit className="text-gray-400 text-[10px] mr-1" />
                  )}
                </>
              )}
            </div>
          </td>
        );
      })}
      
      {/* ستون عملیات - فقط دکمه حذف */}
      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
        <div className="flex items-center justify-center">
          <button
            onClick={() => onDelete(item)}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
            title="حذف"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* خلاصه فیلترها و جمع کل */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
        <div className="flex justify-between items-center">
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-600 font-semibold">فیلترهای فعال:</span>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(activeFilters).map(([columnName, filter]) => (
                  <span key={columnName} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    {columnName}: {filter.type === 'checkbox' ? `${filter.value.length} مورد` : filter.value}
                    <button
                      onClick={() => clearColumnFilter(columnName)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 mr-2"
              >
                <FaTimes className="text-xs" />
                حذف همه
              </button>
            </div>
          )}
          <div className="flex justify-end gap-6 text-xs mr-auto">
            <div>
              <span className="font-medium text-gray-600">تعداد رکوردها: </span>
              <span className="text-gray-900">{filteredAndSortedData.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">جمع کل: </span>
              <span className="text-gray-900">
                {new Intl.NumberFormat('fa-IR').format(
                  filteredAndSortedData.reduce((sum, item) => {
                    const possibleSumColumns = ['مبلغ کل', 'قیمت نهایی', 'هزینه بازرسی'];
                    for (const col of possibleSumColumns) {
                      if (item[col] !== undefined) {
                        return sum + (item[col] || 0);
                      }
                    }
                    return sum;
                  }, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* پاپ‌آپ تأیید ذخیره */}
      <FinancialSaveConfirmationPopover
        isOpen={showSaveConfirmation}
        onClose={handleClosePopover}
        onConfirm={handleConfirmSave}
        rowData={editingCell ? localData[editingCell.rowIndex] : null}
        editedValues={editingCell ? { [editingCell.columnName]: editedValue } : {}}
        isLoading={isSaving}
      />
    </div>
  );
};

export default FinancialSummaryTable;