// src/components/reports/FinancialSummaryTable.jsx
import React, { useState, useRef, useEffect } from 'react';
import { FaTrash, FaEdit, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';

const FinancialSummaryTable = ({ data, onDelete, onEdit, isLoading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const scrollContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);

  // تنظیم موقعیت اسکرول افقی به ابتدا (راست) در بارگذاری اولیه
  useEffect(() => {
    if (scrollContainerRef.current && data && data.length > 0) {
      if (isInitialLoad) {
        // در لود اولیه، صبر می‌کنیم تا جدول کامل رندر بشه
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            // یه کم صبر می‌کنیم تا اسکرول اعمال بشه
            setTimeout(() => {
              setIsTableReady(true);
              setIsInitialLoad(false);
            }, 50);
          }
        });
      }
    }
  }, [data, isInitialLoad]);

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

  // اعمال sort روی داده‌ها
  const sortedData = React.useMemo(() => {
    if (!data) return [];
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
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
  }, [data, sortConfig]);

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
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('نام پروژه')}
                  >
                    <div className="flex items-center gap-1">
                      <span>نام پروژه</span>
                      {getSortIcon('نام پروژه')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('شماره RFI')}
                  >
                    <div className="flex items-center gap-1">
                      <span>شماره RFI</span>
                      {getSortIcon('شماره RFI')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-blue-700 transition-colors"
                    onClick={() => handleSort('نام بازرس')}
                  >
                    <div className="flex items-center gap-1">
                      <span>نام بازرس</span>
                      {getSortIcon('نام بازرس')}
                    </div>
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
                {sortedData.map((item, index) => (
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
      
      {/* خلاصه جمع کل */}
      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
        <div className="flex justify-end gap-6 text-xs">
          <div>
            <span className="font-medium text-gray-600">تعداد رکوردها: </span>
            <span className="text-gray-900">{sortedData.length}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">جمع کل: </span>
            <span className="text-gray-900">
              {formatPrice(sortedData.reduce((sum, item) => sum + (item["مبلغ کل"] || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryTable;