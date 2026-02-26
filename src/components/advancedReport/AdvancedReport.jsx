// src/components/reports/AdvancedReport.jsx
import React, { useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { FaSearch, FaCalendarAlt, FaChartBar, FaFileExcel } from 'react-icons/fa';
import { useDailyReport, useFinancialSummary } from '../../hooks/useCreateReport';
import Button from '../ui/Button';
import FormSection from '../common/FormSection';
import StepHeader from '../common/StepHeader';
import FinancialSummaryTable from './FinancialSummaryTable';
import toast from 'react-hot-toast';

const AdvancedReport = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  
  const { mutate: fetchDailyReport, isLoading: isFetching } = useDailyReport('excel');
  
  // هوک دریافت اطلاعات مالی
  const { 
    data: financialData, 
    isLoading: isLoadingFinancial,
    isFetching: isFetchingFinancial
  } = useFinancialSummary(
    searchParams?.year,
    searchParams?.month,
    'همه',
    !!searchParams
  );
  
  // تبدیل به نام فارسی ماه
  const getPersianMonthName = (dateObject) => {
    if (!dateObject) return '';
    
    if (dateObject.month && dateObject.month.name) {
      return dateObject.month.name;
    }
    
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد',
      'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر',
      'دی', 'بهمن', 'اسفند'
    ];
    
    const monthIndex = dateObject.month?.index || 0;
    return monthNames[monthIndex] || '';
  };
  
  // هندلر دریافت اطلاعات
  const handleGetInfo = () => {
    if (!selectedYear || !selectedMonth) {
      toast.error('لطفاً سال و ماه را انتخاب کنید', {
        position: 'top-center',
        duration: 3000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: 'white',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '14px',
          direction: 'rtl',
          textAlign: 'right',
        },
      });
      return;
    }
    
    // گرفتن نام فارسی ماه
    const monthName = getPersianMonthName(selectedMonth.date);
    
    // console.log('🔍 دریافت اطلاعات با پارامترها:', {
    //   year: selectedYear.year,
    //   month: monthName
    // });
    
    // ذخیره پارامترهای جستجو
    setSearchParams({
      year: selectedYear.year,
      month: monthName
    });
  };
  
  // هندلر دانلود اکسل
  const handleDownloadExcel = () => {
    if (!searchParams) {
      toast.error('لطفاً ابتدا اطلاعات را دریافت کنید', {
        position: 'top-center',
        duration: 3000,
      });
      return;
    }
    
    fetchDailyReport({
      year: searchParams.year,
      month: searchParams.month,
      overDomestic: 'داخلی کالا'
    });
  };
  
  // هندلر تغییر سال
  const handleYearChange = (date) => {
    if (date) {
      setSelectedYear({
        year: date.year,
        date: date
      });
    } else {
      setSelectedYear(null);
    }
    setSearchParams(null);
  };
  
  // هندلر تغییر ماه
  const handleMonthChange = (date) => {
    if (date) {
      setSelectedMonth({
        month: date.month,
        year: date.year,
        date: date
      });
    } else {
      setSelectedMonth(null);
    }
    setSearchParams(null);
  };
  
  // هندلر ویرایش (موقت)
  const handleEdit = (item) => {
    // console.log('ویرایش آیتم:', item);
    // toast.info('ویرایش آیتم - در حال توسعه', {
    //   position: 'top-center',
    //   duration: 2000,
    // });
  };
  
  // هندلر حذف (موقت)
  const handleDelete = (item) => {
    // console.log('حذف آیتم:', item);
    // toast.info('حذف آیتم - در حال توسعه', {
    //   position: 'top-center',
    //   duration: 2000,
    // });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-4 px-3 sm:px-4 lg:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="فرم مدیریت"
          description="مشاهده و دریافت گزارشات مالی بر اساس ماه و سال"
          icon={FaChartBar}
        />

        <div className="bg-white rounded-xl shadow-lg mb-3">
          <div className="p-3">
            
            <FormSection
              title="فیلترهای گزارش"
              icon={FaSearch}
              className="mb-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                
                {/* فیلد سال - با لیبل کنار فیلد */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-1 text-blue-600 min-w-fit">
                    <FaCalendarAlt className="text-xs" />
                    <span className="text-xs font-semibold">سال شمسی</span>
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      value={selectedYear?.date}
                      onChange={handleYearChange}
                      onlyYearPicker
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      placeholder="انتخاب سال"
                      className="w-full py-1 px-2 border-0 bg-transparent focus:outline-none text-sm"
                      inputClass="w-full py-1 px-2 border-0 bg-transparent focus:outline-none text-sm text-right"
                      format="YYYY"
                    />
                  </div>
                </div>
                
                {/* فیلد ماه - با لیبل کنار فیلد */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-1 text-blue-600 min-w-fit">
                    <FaCalendarAlt className="text-xs" />
                    <span className="text-xs font-semibold">ماه شمسی</span>
                  </div>
                  <div className="flex-1">
                    <DatePicker
                      value={selectedMonth?.date}
                      onChange={handleMonthChange}
                      onlyMonthPicker
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      placeholder="انتخاب ماه"
                      className="w-full py-1 px-2 border-0 bg-transparent focus:outline-none text-sm"
                      inputClass="w-full py-1 px-2 border-0 bg-transparent focus:outline-none text-sm text-right"
                      format="MMMM"
                    />
                  </div>
                </div>
                
                {/* دکمه دریافت اطلاعات */}
                <div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon="search"
                    className="w-full py-1.5"
                    onClick={handleGetInfo}
                    disabled={!selectedYear || !selectedMonth || isFetchingFinancial}
                    isLoading={isFetchingFinancial}
                  >
                    {isFetchingFinancial ? "در حال دریافت..." : "دریافت اطلاعات"}
                  </Button>
                </div>
              </div>
              
              {/* نمایش سال و ماه انتخاب شده به صورت فشرده */}
              {/* {(selectedYear || selectedMonth) && (
                <div className="mt-1 text-xs text-gray-500 flex gap-2">
                  {selectedYear && <span>سال: {selectedYear.year}</span>}
                  {selectedMonth && <span>ماه: {getPersianMonthName(selectedMonth.date)}</span>}
                </div>
              )} */}
            </FormSection>
          </div>
        </div>
        
        {/* نمایش جدول اطلاعات */}
        {searchParams && (
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-700">
  نتایج {searchParams.month} {searchParams.year}
  {financialData && (
    <span className="mr-2 text-xs text-gray-500">
      ({financialData.length} رکورد)
    </span>
  )}
</h3>
              
              {/* دکمه دانلود اکسل */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownloadExcel}
                disabled={isFetching || !financialData || financialData.length === 0}
                isLoading={isFetching}
                className="flex items-center gap-1 text-xs py-1 px-2"
              >
                <FaFileExcel className="text-green-600" />
                {isFetching ? "در حال دانلود..." : "دانلود اکسل"}
              </Button>
            </div>
            
            <FinancialSummaryTable 
              data={financialData || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoadingFinancial}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReport;