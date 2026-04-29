import React, { useState, useRef } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { FaSearch, FaCalendarAlt, FaChartBar, FaFileExcel, FaCheckDouble, FaSave } from 'react-icons/fa';
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
  const [isEditingEnabled, setIsEditingEnabled] = useState(true); // وضعیت قابلیت ویرایش
  const [initialCopyDone, setInitialCopyDone] = useState(false); // آیا کپی اولیه انجام شده؟
  const tableRef = useRef(null);
  
  const { mutate: fetchDailyReport, isLoading: isFetching } = useDailyReport('excel');
  
  const { 
    data: financialData, 
    isLoading: isLoadingFinancial,
    isFetching: isFetchingFinancial,
    refetch: refetchFinancialData
  } = useFinancialSummary(
    searchParams?.year,
    searchParams?.month,
    'همه',
    !!searchParams
  );
  
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
  
  const handleGetInfo = () => {
    if (!selectedYear || !selectedMonth) {
      toast.error('لطفاً سال و ماه را انتخاب کنید');
      return;
    }
    const monthName = getPersianMonthName(selectedMonth.date);
    setSearchParams({ year: selectedYear.year, month: monthName });
    setInitialCopyDone(false);
    setIsEditingEnabled(true);
  };
  
  const handleDownloadExcel = () => {
    if (!searchParams) {
      toast.error('لطفاً ابتدا اطلاعات را دریافت کنید');
      return;
    }
    fetchDailyReport({
      year: searchParams.year,
      month: searchParams.month,
      overDomestic: 'داخلی کالا'
    });
  };
  
  // هندلر تائید اولیه - کپی مقادیر
  const handleInitialApproval = () => {
    if (tableRef.current && tableRef.current.copyInitialToFinal) {
      tableRef.current.copyInitialToFinal();
      setInitialCopyDone(true);
      toast.success('مقادیر اولیه با موفقیت کپی شدند', {
        position: 'top-center',
        duration: 3000,
        icon: '✅',
      });
    }
  };
  
  // هندلر ذخیره نهایی
  const handleFinalSave = () => {
    if (tableRef.current && tableRef.current.disableEditing) {
      tableRef.current.disableEditing();
      setIsEditingEnabled(false);
      toast.success('تغییرات نهایی با موفقیت ذخیره شد', {
        position: 'top-center',
        duration: 3000,
        icon: '✅',
      });
    }
  };
  
  const handleYearChange = (date) => {
    if (date) setSelectedYear({ year: date.year, date: date });
    else setSelectedYear(null);
    setSearchParams(null);
    setInitialCopyDone(false);
    setIsEditingEnabled(true);
  };
  
  const handleMonthChange = (date) => {
    if (date) setSelectedMonth({ month: date.month, year: date.year, date: date });
    else setSelectedMonth(null);
    setSearchParams(null);
    setInitialCopyDone(false);
    setIsEditingEnabled(true);
  };
  
  const handleEdit = (item) => {};
  const handleDelete = (item) => {};

  const showButtons = searchParams && financialData && financialData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-4 px-3 sm:px-4 lg:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="صورت وضعیت بازرسین(جزئیات)"
          description="مشاهده صورت وضعیت بازرسین بر اساس ماه و سال"
          icon={FaChartBar}
        />

        <div className="bg-white rounded-xl shadow-lg mb-3">
          <div className="p-3">
            <FormSection title="فیلترهای گزارش" icon={FaSearch} className="mb-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
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
            </FormSection>
          </div>
        </div>
        
        {/* نمایش جدول اطلاعات */}
        {searchParams && (
          <div className="bg-white rounded-xl shadow-lg p-3">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-gray-700">
                نتایج {searchParams.month} {searchParams.year}
                {financialData && (
                  <span className="mr-2 text-xs text-gray-500">
                    ({financialData.length} رکورد)
                  </span>
                )}
              </h3>
              
              <div className="flex gap-2">
                {/* دکمه تائید اولیه */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleInitialApproval}
                  disabled={!financialData || financialData.length === 0 || !isEditingEnabled || initialCopyDone}
                  className="flex items-center gap-1 text-xs py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <FaCheckDouble className="text-xs" />
                  تائید اولیه
                </Button>
                
                {/* دکمه ذخیره نهایی تغییرات */}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleFinalSave}
                  disabled={!financialData || financialData.length === 0 || !isEditingEnabled}
                  className="flex items-center gap-1 text-xs py-1 px-3 bg-green-500 hover:bg-green-600 text-white"
                >
                  <FaSave className="text-xs" />
                  ذخیره نهایی تغییرات
                </Button>
                
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
            </div>
            
            <FinancialSummaryTable 
              ref={tableRef}
              data={financialData || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={isLoadingFinancial}
              isEditingEnabled={isEditingEnabled}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedReport;