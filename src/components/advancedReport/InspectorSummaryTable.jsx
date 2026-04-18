import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FaSort, FaSortUp, FaSortDown, 
  FaFilter, FaTimes, FaSearch, FaUserTie
} from 'react-icons/fa';

const InspectorSummaryTable = ({ data, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  
  const scrollContainerRef = useRef(null);
  const filterRefs = useRef({});

  // تعریف ستون‌های ثابت
  const columns = [
    { key: "نام بازرس", title: "نام بازرس", type: "string", filterable: true, sortable: false },
    { key: "کد پرسنلی", title: "کد پرسنلی", type: "string", filterable: false, sortable: true },
    { key: "جمع نفر-روز نهایی", title: "جمع نفر-روز نهایی", type: "number", filterable: false, sortable: true },
    { key: "قیمت نهایی", title: "قیمت نهایی", type: "number", filterable: false, sortable: true },
    { key: "جمع مبلغ نهایی", title: "جمع مبلغ نهایی", type: "number", filterable: false, sortable: true },
    { key: "جمع نفر-روز اولیه", title: "جمع نفر-روز اولیه", type: "number", filterable: false, sortable: true },
    { key: "قیمت اولیه", title: "قیمت اولیه", type: "number", filterable: false, sortable: true },
    { key: "جمع مبلغ اولیه", title: "جمع مبلغ اولیه", type: "number", filterable: false, sortable: true },
  ];

  // به‌روزرسانی localData وقتی prop.data تغییر می‌کنه
  useEffect(() => {
    if (data && data.length > 0) {
      setIsInitialLoad(true);
    }
  }, [data]);

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

  // گرفتن مقادیر یکتا برای ستون نام بازرس
  const getUniqueInspectors = () => {
    if (!data) return [];
    const values = [...new Set(data.map(item => item["نام بازرس"]).filter(Boolean))];
    return values.sort((a, b) => String(a).localeCompare(String(b), 'fa'));
  };

  const uniqueInspectors = getUniqueInspectors();

  // تابع sort
  const handleSort = (key) => {
    const column = columns.find(col => col.key === key);
    if (!column.sortable) return;
    
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
  const getSortIcon = (columnKey, sortable) => {
    if (!sortable) return null;
    
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

  // توابع فیلتر برای نام بازرس
  const toggleSelectAllInspectors = () => {
    const currentFilter = activeFilters["نام بازرس"];
    if (currentFilter?.type === 'checkbox' && currentFilter.value.length === uniqueInspectors.length) {
      const newFilters = { ...activeFilters };
      delete newFilters["نام بازرس"];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        ["نام بازرس"]: { type: 'checkbox', value: [...uniqueInspectors] }
      });
    }
  };

  const toggleInspector = (inspectorName) => {
    const currentFilter = activeFilters["نام بازرس"];
    let newValues;
    
    if (currentFilter?.type === 'checkbox') {
      if (currentFilter.value.includes(inspectorName)) {
        newValues = currentFilter.value.filter(v => v !== inspectorName);
      } else {
        newValues = [...currentFilter.value, inspectorName];
      }
    } else {
      newValues = [inspectorName];
    }
    
    if (newValues.length === 0) {
      const newFilters = { ...activeFilters };
      delete newFilters["نام بازرس"];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        ["نام بازرس"]: { type: 'checkbox', value: newValues }
      });
    }
  };

  const clearInspectorFilter = () => {
    const newFilters = { ...activeFilters };
    delete newFilters["نام بازرس"];
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // اعمال sort و filter روی داده‌ها
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];
    
    let result = [...data];
    
    // اعمال فیلتر نام بازرس
    const inspectorFilter = activeFilters["نام بازرس"];
    if (inspectorFilter?.type === 'checkbox' && inspectorFilter.value.length > 0) {
      result = result.filter(item => inspectorFilter.value.includes(item["نام بازرس"]));
    }
    
    // اعمال sort
    if (sortConfig.key) {
      const column = columns.find(col => col.key === sortConfig.key);
      if (column && column.sortable) {
        result.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];
          
          if (column.type === 'number') {
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
    }
    
    return result;
  }, [data, sortConfig, activeFilters]);

  // فرمت کردن مقادیر عددی
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      return new Intl.NumberFormat('fa-IR').format(value);
    }
    return String(value);
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

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">اطلاعاتی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
      <div className="relative flex-1" style={{ height: '100%' }}>
        {!isTableReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">در حال آماده‌سازی جدول...</span>
            </div>
          </div>
        )}
        
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
                  
                  {columns.map((column) => (
                    <th 
                      key={column.key}
                      scope="col" 
                      className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                    >
                      <div className="flex items-center gap-1">
                        <span>{column.title}</span>
                        
                        {/* دکمه فیلتر فقط برای ستون نام بازرس */}
                        {column.key === "نام بازرس" && (
                          <div 
                            className="relative" 
                            ref={el => filterRefs.current[column.key] = el}
                          >
                            <button
                              onClick={() => setOpenFilter(openFilter === column.key ? null : column.key)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                activeFilters[column.key]
                                  ? 'bg-blue-700 text-yellow-300'
                                  : 'hover:bg-blue-700 text-white'
                              }`}
                              title={`فیلتر ${column.title}`}
                            >
                              <FaFilter className="text-xs" />
                            </button>
                            
                            {openFilter === column.key && (
                              <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-h-[300px] overflow-y-auto">
                                <div className="p-2 border-b border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-700">انتخاب بازرس</span>
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
                                        checked={activeFilters[column.key]?.type === 'checkbox' && 
                                                  activeFilters[column.key]?.value.length === uniqueInspectors.length}
                                        onChange={toggleSelectAllInspectors}
                                        className="rounded border-gray-300 text-blue-600"
                                      />
                                      <span>انتخاب همه</span>
                                    </label>
                                    {activeFilters[column.key] && (
                                      <button
                                        onClick={clearInspectorFilter}
                                        className="text-red-600 hover:text-red-800 text-xs mr-auto"
                                      >
                                        پاک کردن
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="p-2">
                                  {uniqueInspectors.map(inspector => (
                                    <label key={inspector} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={activeFilters[column.key]?.type === 'checkbox' && 
                                                  activeFilters[column.key]?.value.includes(inspector)}
                                        onChange={() => toggleInspector(inspector)}
                                        className="rounded border-gray-300 text-blue-600"
                                      />
                                      <span className="text-xs text-gray-700">{String(inspector)}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* دکمه سورت برای ستون‌های قابل سورت */}
                        {column.sortable && (
                          <button
                            onClick={() => handleSort(column.key)}
                            className="p-1 rounded hover:bg-blue-700 transition-colors"
                          >
                            {getSortIcon(column.key, column.sortable)}
                          </button>
                        )}
                      </div>
                      
                      {activeFilters[column.key] && (
                        <div className="text-[10px] text-yellow-300 mt-0.5">
                          {activeFilters[column.key].type === 'checkbox' && 
                            `${activeFilters[column.key].value.length} انتخاب`}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors duration-300"
                  >
                    <td 
                      className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                      style={{ paddingRight: '24px' }}
                    >
                      {index + 1}
                    </td>
                    
                    {columns.map((column) => (
                      <td 
                        key={column.key}
                        className={`px-3 py-2 whitespace-nowrap text-xs text-gray-900 ${
                          column.type === 'number' ? 'text-left' : 'text-right'
                        }`}
                      >
                        {column.type === 'number' 
                          ? formatNumber(item[column.key])
                          : (item[column.key] || '-')
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* خلاصه فیلترها */}
      {activeFiltersCount > 0 && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-blue-600 font-semibold">فیلترهای فعال:</span>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(activeFilters).map(([columnName, filter]) => (
                <span key={columnName} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                  {columnName}: {filter.type === 'checkbox' ? `${filter.value.length} بازرس انتخاب شده` : filter.value}
                  <button
                    onClick={() => clearInspectorFilter()}
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
        </div>
      )}
    </div>
  );
};

export default InspectorSummaryTable;