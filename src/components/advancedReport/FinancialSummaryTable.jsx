// src/components/reports/FinancialSummaryTable.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaEdit, FaSort, FaSortUp, FaSortDown, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';

const FinancialSummaryTable = ({ data, onDelete, onEdit, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showProjectFilter, setShowProjectFilter] = useState(false);
  const [showInspectorFilter, setShowInspectorFilter] = useState(false);
  const [showRfiFilter, setShowRfiFilter] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedInspectors, setSelectedInspectors] = useState([]);
  const [rfiFilterText, setRfiFilterText] = useState('');
  
  const scrollContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const projectFilterRef = useRef(null);
  const inspectorFilterRef = useRef(null);
  const rfiFilterRef = useRef(null);

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
      if (projectFilterRef.current && !projectFilterRef.current.contains(event.target)) {
        setShowProjectFilter(false);
      }
      if (inspectorFilterRef.current && !inspectorFilterRef.current.contains(event.target)) {
        setShowInspectorFilter(false);
      }
      if (rfiFilterRef.current && !rfiFilterRef.current.contains(event.target)) {
        setShowRfiFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // فرمت کردن اعداد به ریال
  const formatPrice = (price) => {
    if (!price && price !== 0) return '-';
    return formatCurrency(price, 'ریال');
  };

  // فرمت تاریخ شمسی
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dateStr;
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

  // گرفتن لیست یکتای نام پروژه‌ها
  const uniqueProjects = React.useMemo(() => {
    if (!data) return [];
    const projects = [...new Set(data.map(item => item["نام پروژه"]).filter(Boolean))];
    return projects.sort((a, b) => a.localeCompare(b, 'fa'));
  }, [data]);

  // گرفتن لیست یکتای نام بازرس‌ها
  const uniqueInspectors = React.useMemo(() => {
    if (!data) return [];
    const inspectors = [...new Set(data.map(item => item["نام بازرس"]).filter(Boolean))];
    return inspectors.sort((a, b) => a.localeCompare(b, 'fa'));
  }, [data]);

  // انتخاب/لغو انتخاب همه پروژه‌ها
  const toggleAllProjects = () => {
    if (selectedProjects.length === uniqueProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects([...uniqueProjects]);
    }
  };

  // انتخاب/لغو انتخاب همه بازرس‌ها
  const toggleAllInspectors = () => {
    if (selectedInspectors.length === uniqueInspectors.length) {
      setSelectedInspectors([]);
    } else {
      setSelectedInspectors([...uniqueInspectors]);
    }
  };

  // پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setSelectedProjects([]);
    setSelectedInspectors([]);
    setRfiFilterText('');
  };

  // اعمال sort و filter روی داده‌ها
  const filteredAndSortedData = React.useMemo(() => {
    if (!data) return [];
    
    let result = [...data];
    
    // اعمال فیلتر پروژه
    if (selectedProjects.length > 0 && selectedProjects.length < uniqueProjects.length) {
      result = result.filter(item => selectedProjects.includes(item["نام پروژه"]));
    }
    
    // اعمال فیلتر بازرس
    if (selectedInspectors.length > 0 && selectedInspectors.length < uniqueInspectors.length) {
      result = result.filter(item => selectedInspectors.includes(item["نام بازرس"]));
    }

    // اعمال فیلتر RFI
    if (rfiFilterText.trim() !== '') {
      result = result.filter(item => 
        item["شماره RFI"]?.toString().toLowerCase().includes(rfiFilterText.toLowerCase())
      );
    }
    
    // اعمال sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // اگر مقدار عددی است (ستون‌های قیمت)
        if (['هزینه بازرسی', 'قیمت نهایی', 'مبلغ کل', 'مبلغ ثابت', 'نفر-روز'].includes(sortConfig.key)) {
          aVal = aVal || 0;
          bVal = bVal || 0;
          if (sortConfig.direction === 'asc') {
            return aVal - bVal;
          } else {
            return bVal - aVal;
          }
        }

        // اگر رشته است
        aVal = aVal?.toString() || '';
        bVal = bVal?.toString() || '';
        
        if (sortConfig.direction === 'asc') {
          return aVal.localeCompare(bVal, 'fa');
        } else {
          return bVal.localeCompare(aVal, 'fa');
        }
      });
    }
    
    return result;
  }, [data, sortConfig, selectedProjects, selectedInspectors, uniqueProjects.length, uniqueInspectors.length, rfiFilterText]);

  const activeFiltersCount = (selectedProjects.length > 0 && selectedProjects.length < uniqueProjects.length ? 1 : 0) +
                           (selectedInspectors.length > 0 && selectedInspectors.length < uniqueInspectors.length ? 1 : 0) +
                           (rfiFilterText.trim() !== '' ? 1 : 0);

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
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"
                    style={{ paddingRight: '24px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>ردیف</span>
                    </div>
                  </th>
                  
                  {/* ستون نام پروژه با فیلتر چک‌باکسی */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                  >
                    <div className="flex items-center gap-1">
                      <span>نام پروژه</span>
                      <div className="relative" ref={projectFilterRef}>
                        <button
                          onClick={() => setShowProjectFilter(!showProjectFilter)}
                          className={`p-1 rounded transition-colors duration-200 ${
                            selectedProjects.length > 0 && selectedProjects.length < uniqueProjects.length
                              ? 'bg-blue-700 text-yellow-300'
                              : 'hover:bg-blue-700 text-white'
                          }`}
                          title="فیلتر پروژه"
                        >
                          <FaFilter className="text-xs" />
                        </button>
                        
                        {/* Dropdown فیلتر پروژه */}
                        {showProjectFilter && (
                          <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-h-[300px] overflow-y-auto">
                            <div className="p-2 border-b border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">انتخاب پروژه</span>
                                <button
                                  onClick={() => setShowProjectFilter(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={selectedProjects.length === uniqueProjects.length}
                                    onChange={toggleAllProjects}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span>انتخاب همه</span>
                                </label>
                                {selectedProjects.length > 0 && (
                                  <button
                                    onClick={() => setSelectedProjects([])}
                                    className="text-red-600 hover:text-red-800 text-xs mr-auto"
                                  >
                                    پاک کردن
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="p-2">
                              {uniqueProjects.map(project => (
                                <label key={project} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedProjects.includes(project)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedProjects([...selectedProjects, project]);
                                      } else {
                                        setSelectedProjects(selectedProjects.filter(p => p !== project));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-xs text-gray-700">{project}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSort('نام پروژه')}
                        className="p-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        {getSortIcon('نام پروژه')}
                      </button>
                    </div>
                    {selectedProjects.length > 0 && selectedProjects.length < uniqueProjects.length && (
                      <div className="text-[10px] text-yellow-300 mt-0.5">
                        {selectedProjects.length} انتخاب
                      </div>
                    )}
                  </th>
                  
                  {/* ستون شماره RFI با فیلتر متنی */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                  >
                    <div className="flex items-center gap-1">
                      <span>شماره RFI</span>
                      <div className="relative" ref={rfiFilterRef}>
                        <button
                          onClick={() => setShowRfiFilter(!showRfiFilter)}
                          className={`p-1 rounded transition-colors duration-200 ${
                            rfiFilterText.trim() !== ''
                              ? 'bg-blue-700 text-yellow-300'
                              : 'hover:bg-blue-700 text-white'
                          }`}
                          title="فیلتر شماره RFI"
                        >
                          <FaSearch className="text-xs" />
                        </button>
                        
                        {/* Dropdown فیلتر RFI */}
                        {showRfiFilter && (
                          <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px]">
                            <div className="p-2 border-b border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">جستجوی شماره RFI</span>
                                <button
                                  onClick={() => setShowRfiFilter(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={rfiFilterText}
                                  onChange={(e) => setRfiFilterText(e.target.value)}
                                  placeholder="مثال: FAH-INS-..."
                                  className="w-full text-gray-700 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                                  autoFocus
                                />
                                {rfiFilterText.trim() !== '' && (
                                  <button
                                    onClick={() => setRfiFilterText('')}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                  >
                                    پاک کردن
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSort('شماره RFI')}
                        className="p-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        {getSortIcon('شماره RFI')}
                      </button>
                    </div>
                    {rfiFilterText.trim() !== '' && (
                      <div className="text-[10px] text-yellow-300 mt-0.5">
                        فیلتر: {rfiFilterText}
                      </div>
                    )}
                  </th>
                  
                  {/* ستون نام بازرس با فیلتر چک‌باکسی */}
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative"
                  >
                    <div className="flex items-center gap-1">
                      <span>نام بازرس</span>
                      <div className="relative" ref={inspectorFilterRef}>
                        <button
                          onClick={() => setShowInspectorFilter(!showInspectorFilter)}
                          className={`p-1 rounded transition-colors duration-200 ${
                            selectedInspectors.length > 0 && selectedInspectors.length < uniqueInspectors.length
                              ? 'bg-blue-700 text-yellow-300'
                              : 'hover:bg-blue-700 text-white'
                          }`}
                          title="فیلتر بازرس"
                        >
                          <FaFilter className="text-xs" />
                        </button>
                        
                        {/* Dropdown فیلتر بازرس */}
                        {showInspectorFilter && (
                          <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-h-[300px] overflow-y-auto">
                            <div className="p-2 border-b border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-700">انتخاب بازرس</span>
                                <button
                                  onClick={() => setShowInspectorFilter(false)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={selectedInspectors.length === uniqueInspectors.length}
                                    onChange={toggleAllInspectors}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span>انتخاب همه</span>
                                </label>
                                {selectedInspectors.length > 0 && (
                                  <button
                                    onClick={() => setSelectedInspectors([])}
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
                                    checked={selectedInspectors.includes(inspector)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedInspectors([...selectedInspectors, inspector]);
                                      } else {
                                        setSelectedInspectors(selectedInspectors.filter(i => i !== inspector));
                                      }
                                    }}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-xs text-gray-700">{inspector}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSort('نام بازرس')}
                        className="p-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        {getSortIcon('نام بازرس')}
                      </button>
                    </div>
                    {selectedInspectors.length > 0 && selectedInspectors.length < uniqueInspectors.length && (
                      <div className="text-[10px] text-yellow-300 mt-0.5">
                        {selectedInspectors.length} انتخاب
                      </div>
                    )}
                  </th>
                  
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('تاریخ شمسی')}
                  >
                    <div className="flex items-center gap-1">
                      <span>تاریخ شمسی</span>
                      {getSortIcon('تاریخ شمسی')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('نفر-روز')}
                  >
                    <div className="flex items-center gap-1">
                      <span>نفر-روز</span>
                      {getSortIcon('نفر-روز')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('هزینه بازرسی')}
                  >
                    <div className="flex items-center gap-1">
                      <span>هزینه بازرسی</span>
                      {getSortIcon('هزینه بازرسی')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('قیمت نهایی')}
                  >
                    <div className="flex items-center gap-1">
                      <span>قیمت نهایی</span>
                      {getSortIcon('قیمت نهایی')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('مبلغ کل')}
                  >
                    <div className="flex items-center gap-1">
                      <span>مبلغ کل</span>
                      {getSortIcon('مبلغ کل')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('مبلغ ثابت')}
                  >
                    <div className="flex items-center gap-1">
                      <span>مبلغ ثابت</span>
                      {getSortIcon('مبلغ ثابت')}
                    </div>
                  </th>
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
                  <tr key={`${item["شماره RFI"]}-${index}`} className="hover:bg-gray-50">
                    <td 
                      className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                      style={{ paddingRight: '24px' }}
                    >
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item["نام پروژه"] || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 font-mono">
                      {item["شماره RFI"] || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {item["نام بازرس"] || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                      {formatDate(item["تاریخ شمسی"])}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                      {item["نفر-روز"] || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-left">
                      {formatPrice(item["هزینه بازرسی"])}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-left">
                      {formatPrice(item["قیمت نهایی"])}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-left">
                      {formatPrice(item["مبلغ کل"])}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-left">
                      {formatPrice(item["مبلغ ثابت"])}
                    </td>
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
      
      {/* خلاصه فیلترها و جمع کل */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
        <div className="flex justify-between items-center">
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-semibold">فیلترهای فعال:</span>
              <div className="flex gap-1 flex-wrap">
                {selectedProjects.length > 0 && selectedProjects.length < uniqueProjects.length && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    پروژه: {selectedProjects.length} مورد
                  </span>
                )}
                {selectedInspectors.length > 0 && selectedInspectors.length < uniqueInspectors.length && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    بازرس: {selectedInspectors.length} مورد
                  </span>
                )}
                {rfiFilterText.trim() !== '' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                    RFI: {rfiFilterText}
                  </span>
                )}
              </div>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1 mr-2"
              >
                <FaTimes className="text-xs" />
                حذف فیلترها
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
                {formatPrice(filteredAndSortedData.reduce((sum, item) => sum + (item["مبلغ کل"] || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryTable;