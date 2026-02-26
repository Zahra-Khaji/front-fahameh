// src/components/reports/FinancialSummaryTable.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaTrash, FaEdit, FaSort, FaSortUp, FaSortDown, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';

const FinancialSummaryTable = ({ data, onDelete, onEdit, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilters, setActiveFilters] = useState({}); // { columnName: { type: 'checkbox'|'text', value: []|string } }
  const [openFilter, setOpenFilter] = useState(null); // نام ستونی که فیلترش باز است
  
  const scrollContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const filterRefs = useRef({});

  // تنظیم موقعیت اسکرول افقی به ابتدا (راست) در بارگذاری اولیه
  useEffect(() => {
    if (scrollContainerRef.current && data && data.length > 0) {
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
  }, [data, isInitialLoad]);

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
    if (!data || data.length === 0) return [];
    // گرفتن کلیدهای اولین آیتم
    return Object.keys(data[0]);
  }, [data]);

  // تشخیص نوع ستون (عددی یا متنی)
  const getColumnType = (columnName) => {
    if (!data || data.length === 0) return 'string';
    
    // ستون‌های خاص که می‌دانیم عددی هستند
    const numericColumns = ['نفر-روز', 'هزینه بازرسی', 'قیمت نهایی', 'مبلغ کل', 'مبلغ ثابت'];
    if (numericColumns.includes(columnName)) {
      return 'number';
    }
    
    // بررسی نمونه‌ای از داده
    const sample = data[0]?.[columnName];
    if (typeof sample === 'number') return 'number';
    if (sample && !isNaN(parseFloat(sample)) && isFinite(sample)) return 'number';
    
    return 'string';
  };

  // گرفتن مقادیر یکتا برای ستون‌های متنی (برای فیلتر چک‌باکسی)
  const getUniqueValues = (columnName) => {
    if (!data) return [];
    const values = [...new Set(data.map(item => item[columnName]).filter(Boolean))];
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

  // انتخاب/لغو انتخاب همه برای فیلتر چک‌باکسی
  const toggleSelectAll = (columnName, uniqueValues) => {
    const currentFilter = activeFilters[columnName];
    if (currentFilter?.type === 'checkbox' && currentFilter.value.length === uniqueValues.length) {
      // همه انتخاب شده‌اند -> پاک کردن همه
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      // همه را انتخاب کن
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'checkbox', value: [...uniqueValues] }
      });
    }
  };

  // انتخاب/لغو انتخاب یک آیتم در فیلتر چک‌باکسی
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
      // اگر چیزی انتخاب نشد، فیلتر رو حذف کن
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

  // تغییر فیلتر متنی
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

  // پاک کردن فیلتر یک ستون
  const clearColumnFilter = (columnName) => {
    const newFilters = { ...activeFilters };
    delete newFilters[columnName];
    setActiveFilters(newFilters);
  };

  // پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // اعمال sort و filter روی داده‌ها
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];
    
    let result = [...data];
    
    // اعمال فیلترها
    Object.entries(activeFilters).forEach(([columnName, filter]) => {
      if (filter.type === 'checkbox' && filter.value.length > 0) {
        result = result.filter(item => filter.value.includes(item[columnName]));
      } else if (filter.type === 'text' && filter.value.trim() !== '') {
        result = result.filter(item => 
          String(item[columnName] || '').toLowerCase().includes(filter.value.toLowerCase())
        );
      }
    });
    
    // اعمال sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        const columnType = getColumnType(sortConfig.key);

        // اگر مقدار عددی است
        if (columnType === 'number') {
          aVal = aVal || 0;
          bVal = bVal || 0;
          if (sortConfig.direction === 'asc') {
            return aVal - bVal;
          } else {
            return bVal - aVal;
          }
        }

        // اگر رشته است
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
  }, [data, sortConfig, activeFilters]);

  // فرمت کردن مقادیر برای نمایش - حذف عبارت ریال
  const formatCellValue = (value, columnName) => {
    if (value === null || value === undefined) return '-';
    
    const columnType = getColumnType(columnName);
    
    // اگر ستون "سال" است، بدون کاما و فرمت عددی نشون بده
    if (columnName === 'سال') {
      return String(value);
    }
    
    if (columnType === 'number') {
      // فقط عدد رو فرمت کن، بدون اضافه کردن "ریال"
      return new Intl.NumberFormat('fa-IR').format(value);
    }
    
    return String(value);
  };

  // تشخیص راست‌چین یا چپ‌چین بودن سلول
  const getCellAlignment = (columnName) => {
    const columnType = getColumnType(columnName);
    // برای ستون "سال" راست‌چین باشه بهتره
    if (columnName === 'سال') {
      return 'text-right';
    }
    return columnType === 'number' ? 'text-left' : 'text-right';
  };

  // تشخیص نوع فیلتر مناسب برای هر ستون
  const getFilterTypeForColumn = (columnName) => {
    // ستون‌هایی که باید فیلتر متنی داشته باشند
    const textFilterColumns = ['توضیحات', 'کد پرسنلی'];
    if (textFilterColumns.includes(columnName)) {
      return 'text';
    }
    return 'auto'; // بقیه ستون‌ها بر اساس تعداد مقادیر یکتا تصمیم‌گیری می‌شوند
  };

  // تعداد فیلترهای فعال
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

  if (!data || data.length === 0) {
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
                  {/* ستون ردیف */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                    style={{ paddingRight: '24px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>ردیف</span>
                    </div>
                  </th>
                  
                  {/* ستون‌های داینامیک */}
                  {columnNames.map((columnName, index) => {
                    const columnType = getColumnType(columnName);
                    const uniqueValues = columnType === 'string' ? getUniqueValues(columnName) : [];
                    const activeFilter = activeFilters[columnName];
                    const isFilterActive = activeFilter !== undefined;
                    const isCheckboxFilter = activeFilter?.type === 'checkbox';
                    const isTextFilter = activeFilter?.type === 'text';
                    
                    // تعیین نوع فیلتر مناسب برای این ستون
                    const filterType = getFilterTypeForColumn(columnName);
                    
                    return (
                      <th 
                        key={index}
                        scope="col" 
                        className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                      >
                        <div className="flex items-center gap-1">
                          <span>{columnName}</span>
                          
                          {/* دکمه فیلتر - بر اساس نوع فیلتر تعیین شده */}
                          {columnType === 'string' && (
                            <>
                              {/* اگر فیلتر متنی اجباری است */}
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
                                  
                                  {/* Dropdown فیلتر متنی */}
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
                                            value={isTextFilter ? activeFilter.value : ''}
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
                              
                              {/* اگر فیلتر خودکار و تعداد مقادیر کم است */}
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
                                  
                                  {/* Dropdown فیلتر چک‌باکسی */}
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
                                              checked={isFilterActive && isCheckboxFilter && activeFilter.value.length === uniqueValues.length}
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
                                              checked={isCheckboxFilter && activeFilter.value.includes(value)}
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
                              
                              {/* اگر فیلتر خودکار و تعداد مقادیر زیاد است */}
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
                                  
                                  {/* Dropdown فیلتر متنی */}
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
                                            value={isTextFilter ? activeFilter.value : ''}
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
                          
                          {/* دکمه sort */}
                          <button
                            onClick={() => handleSort(columnName)}
                            className="p-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            {getSortIcon(columnName)}
                          </button>
                        </div>
                        
                        {/* نمایش وضعیت فیلتر فعال */}
                        {isFilterActive && (
                          <div className="text-[10px] text-yellow-300 mt-0.5">
                            {isCheckboxFilter && `${activeFilter.value.length} انتخاب`}
                            {isTextFilter && `شامل: ${activeFilter.value}`}
                          </div>
                        )}
                      </th>
                    );
                  })}
                  
                  {/* ستون عملیات ثابت */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                  >
                    <span>عملیات</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item, index) => (
                  <tr key={`${item["شماره RFI"] || index}-${index}`} className="hover:bg-gray-50">
                    {/* ستون ردیف */}
                    <td 
                      className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                      style={{ paddingRight: '24px' }}
                    >
                      {index + 1}
                    </td>
                    
                    {/* سلول‌های دیتا */}
                    {columnNames.map((columnName, colIndex) => (
                      <td 
                        key={colIndex}
                        className={`px-3 py-2 whitespace-nowrap text-xs text-gray-900 ${getCellAlignment(columnName)}`}
                      >
                        {columnName === 'شماره RFI' ? (
                          <span className="font-mono">{formatCellValue(item[columnName], columnName)}</span>
                        ) : (
                          formatCellValue(item[columnName], columnName)
                        )}
                      </td>
                    ))}
                    
                    {/* ستون عملیات */}
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                          title="ویرایش"
                        >
                          <FaEdit size={14} />
                        </button>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* خلاصه فیلترها و جمع کل - با فرمت عددی بدون ریال */}
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
                    // سعی می‌کنیم ستون "مبلغ کل" یا هر ستون عددی دیگه‌ای رو پیدا کنیم
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
    </div>
  );
};

export default FinancialSummaryTable;