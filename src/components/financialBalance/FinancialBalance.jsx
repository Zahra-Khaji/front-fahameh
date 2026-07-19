import React, { useState } from 'react';
import DatePicker from "react-multi-date-picker";
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { FaCalendarAlt, FaChartBar, FaFileExcel } from 'react-icons/fa';
import { useDailyReport } from '../../hooks/useCreateReport';
import Button from '../ui/Button';
import FormSection from '../common/FormSection';
import StepHeader from '../common/StepHeader';
import toast from 'react-hot-toast';

const FinancialBalance = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  
  const { mutate: fetchDailyReport, isLoading: isFetching } = useDailyReport('excel');
  
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
  
  const handleDownloadBalance = () => {
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
    
    const monthName = getPersianMonthName(selectedMonth.date);
    
    fetchDailyReport({
      year: selectedYear.year,
      month: monthName,
      overDomestic: 'داخلی کالا'
    });
  };
  
  const handleYearChange = (date) => {
    if (date) {
      setSelectedYear({
        year: date.year,
        date: date
      });
    } else {
      setSelectedYear(null);
    }
  };
  
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-4 px-3 sm:px-4 lg:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="بالانس مالی"
          description="دانلود بالانس مالی بر اساس ماه و سال"
          icon={FaChartBar}
        />

        <div className="bg-white rounded-xl shadow-lg mb-3">
          <div className="p-3">
            <FormSection title="فیلترهای گزارش" icon={FaCalendarAlt} className="mb-0">
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
                
                {/* دکمه بالانس مالی */}
                <div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadBalance}
                    disabled={!selectedYear || !selectedMonth || isFetching}
                    isLoading={isFetching}
                    className="w-full py-1.5 flex items-center justify-center gap-2"
                  >
                    <FaFileExcel className="text-white text-sm" />
                    {isFetching ? "در حال دانلود..." : "دانلود بالانس مالی"}
                  </Button>
                </div>
              </div>
            </FormSection>
          </div>
        </div>
        
        {/* توضیحات راهنما */}
        <div className="bg-blue-50 rounded-xl shadow-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-blue-800">راهنما</h4>
          </div>
          <p className="text-xs text-blue-700 mt-2 mr-4">
            پس از انتخاب سال و ماه مورد نظر، دکمه "دانلود بالانس مالی" را بزنید تا فایل اکسل بالانس مالی دانلود شود.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialBalance;