// src/components/ui/PaginationControls.jsx
import React from 'react';
import { 
  FaChevronRight, 
  FaChevronLeft, 
  FaEllipsisH 
} from 'react-icons/fa';

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 20, 50, 100]
}) => {
  // همیشه کنترل‌ها را نمایش بده، حتی اگر یک صفحه باشد
  // این به کاربر اجازه می‌دهد تعداد آیتم در صفحه را تغییر دهد
  
  // محاسبه محدوده نمایش
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // نمایش صفحات (حداکثر 5 صفحه)
  const getPageNumbers = () => {
    // اگر فقط یک صفحه داریم، فقط همان صفحه را نشان بده
    if (totalPages <= 1) {
      return [1];
    }
    
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        // صفحات اول
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // صفحات آخر
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // صفحات وسط
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200" dir="rtl">
      {/* اطلاعات و انتخاب تعداد آیتم */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>نمایش</span>
          <select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-w-[70px]"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span>آیتم در صفحه</span>
        </div>
        
        <div className="text-sm text-gray-700">
          <span className="text-blue-600 font-semibold">
            {startItem}-{endItem}
          </span>
          <span className="mx-1">از</span>
          <span className="text-blue-600 font-semibold">{totalItems}</span>
          <span className="mr-1">مورد</span>
          {totalPages > 1 && (
            <span className="text-gray-500 text-xs">
              (صفحه {currentPage} از {totalPages})
            </span>
          )}
        </div>
      </div>
      
      {/* کنترل‌های صفحه‌بندی - فقط نمایش بده اگر بیش از یک صفحه داشته باشیم */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          {/* دکمه قبلی */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
            aria-label="صفحه قبلی"
          >
            <FaChevronRight className="text-xs" />
          </button>
          
          {/* شماره صفحات */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => (
              pageNum === '...' ? (
                <span 
                  key={`ellipsis-${index}`}
                  className="w-9 h-9 flex items-center justify-center text-gray-500"
                >
                  <FaEllipsisH className="text-xs" />
                </span>
              ) : (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[36px] h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                  aria-label={`صفحه ${pageNum}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>
          
          {/* دکمه بعدی */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
            aria-label="صفحه بعدی"
          >
            <FaChevronLeft className="text-xs" />
          </button>
        </div>
      )}
      
      {/* اطلاعات صفحه - همیشه نمایش بده */}
      <div className="text-sm text-gray-700">
        <span>صفحه</span>
        <span className="mx-1 font-semibold text-blue-600">{currentPage}</span>
        <span>از</span>
        <span className="mx-1 font-semibold text-blue-600">{totalPages}</span>
      </div>
    </div>
  );
};

export default PaginationControls;