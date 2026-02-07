// src/components/reports/AdvancedReport.jsx
import React, { useState, useEffect } from 'react';
// import { DatePicker } from 'react-date-object';
import DatePicker from "react-multi-date-picker";

import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { FaSearch, FaCalendarAlt, FaChartBar, FaFileExcel } from 'react-icons/fa';
import { useDailyReport } from '../../hooks/useCreateReport';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import Button from '../ui/Button';
import FormSection from '../common/FormSection';
import StepHeader from '../common/StepHeader';
import toast from 'react-hot-toast';

const AdvancedReport = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [fileType, setFileType] = useState('excel'); // excel یا pdf
  
  const { data: projectTypes, isLoading: projectTypesLoading } = useProjectTypes();
  const { mutate: fetchDailyReport, isLoading: isFetching } = useDailyReport(fileType);
  
  // تبدیل به نام فارسی ماه - اصلاح شده
  const getPersianMonthName = (dateObject) => {
    if (!dateObject) return '';
    
    // روش ۱: استفاده از month.name که احتمالاً مستقیم نام فارسی دارد
    if (dateObject.month && dateObject.month.name) {
      return dateObject.month.name;
    }
    
    // روش ۲: استفاده از index و اضافه کردن ۱
    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد',
      'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر',
      'دی', 'بهمن', 'اسفند'
    ];
    
    // month.index از 0 شروع می‌شود
    const monthIndex = dateObject.month?.index || 0;
    return monthNames[monthIndex] || '';
  };
  
  // بررسی اینکه آیا فرم کامل پر شده است
  const isFormValid = () => {
    return selectedYear && selectedMonth && selectedProjectType;
  };
  
  // هندلر جستجو
  const handleSearch = () => {
    if (!isFormValid()) {
      toast.error('لطفاً تمام فیلدها را پر کنید', {
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
    
    // پیدا کردن نام نوع پروژه
    const selectedType = projectTypes?.find(type => 
      type.id === selectedProjectType || 
      type.id?.toString() === selectedProjectType?.toString()
    );
    const projectTypeName = selectedType?.name || selectedProjectType;
    
    console.log('🔍 پارامترهای جستجو:', {
      year: selectedYear.year,
      month: monthName,
      projectType: projectTypeName,
      fileType: fileType
    });
    
    // فراخوانی API
    fetchDailyReport({
      year: selectedYear.year,
      month: monthName,
      overDomestic: projectTypeName
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-4 px-3 sm:px-4 lg:px-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        <StepHeader
          title="گزارشات پیشرفته"
          description="دریافت گزارش روزانه Excel بر اساس فیلترهای پیشرفته"
          icon={FaChartBar}
        />

        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-4 sm:p-5 lg:p-6">
            
            <FormSection
              title="فیلترهای گزارش"
              icon={FaSearch}
              className="mb-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-3">
                
                {/* فیلد سال */}
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="ml-1 text-blue-500 text-xs" />
                    سال شمسی *
                  </label>
                  <div className="relative">
                    <DatePicker
                      value={selectedYear?.date}
                      onChange={handleYearChange}
                      onlyYearPicker
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      placeholder="انتخاب سال"
                      className="w-full py-1.5 pr-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      inputClass="w-full py-1.5 pr-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                      format="YYYY"
                    />
                    {/* <div className="absolute left-0 top-0 bottom-0 flex items-center px-2 pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div> */}
                  </div>
                  {selectedYear && (
                    <p className="text-xs text-green-600 mt-1">
                      سال انتخابی: {selectedYear.year}
                    </p>
                  )}
                </div>
                
                {/* فیلد ماه */}
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="ml-1 text-blue-500 text-xs" />
                    ماه شمسی *
                  </label>
                  <div className="relative">
                    <DatePicker
                      value={selectedMonth?.date}
                      onChange={handleMonthChange}
                      onlyMonthPicker
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      placeholder="انتخاب ماه"
                      className="w-full py-1.5 pr-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      inputClass="w-full py-1.5 pr-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-right"
                      format="MMMM"
                    />
                    {/* <div className="absolute left-0 top-0 bottom-0 flex items-center px-2 pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div> */}
                  </div>
                  {selectedMonth && (
                    <p className="text-xs text-green-600 mt-1">
                      ماه انتخابی: {getPersianMonthName(selectedMonth.date)}
                    </p>
                  )}
                </div>
                
                {/* فیلد نوع پروژه */}
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    نوع پروژه *
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProjectType}
                      onChange={(e) => setSelectedProjectType(e.target.value)}
                      className="w-full py-1.5 pl-3 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none"
                      disabled={projectTypesLoading}
                      required
                    >
                      <option value="" disabled>
                        {projectTypesLoading ? "در حال دریافت..." : "انتخاب نوع پروژه"}
                      </option>
                      {projectTypes?.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* انتخاب نوع فایل */}
              {/* <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                  <FaFileExcel className="ml-1 text-green-500 text-xs" />
                  نوع فایل خروجی
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="fileType"
                      value="excel"
                      checked={fileType === 'excel'}
                      onChange={(e) => setFileType(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className="text-green-600 font-medium">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="fileType"
                      value="pdf"
                      checked={fileType === 'pdf'}
                      onChange={(e) => setFileType(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className="text-red-600 font-medium">PDF (.pdf)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {fileType === 'excel' 
                    ? 'خروجی Excel با فرمت xlsx - مناسب برای تحلیل داده‌ها' 
                    : 'خروجی PDF - مناسب برای چاپ و اشتراک'}
                </p>
              </div> */}
              
              {/* وضعیت انتخاب‌ها */}
              <div className="mb-3">
                <div className={`p-2 rounded-lg ${isFormValid() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isFormValid() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className={`font-medium ${isFormValid() ? 'text-green-700' : 'text-yellow-700'}`}>
                      {isFormValid() ? 'تمام فیلدها پر شده‌اند. آماده جستجو' : 'لطفاً تمام فیلدهای الزامی را پر کنید'}
                    </span>
                  </div>
                </div>
              </div>
            </FormSection>
            
            {/* دکمه جستجو */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="primary"
                size="md"
                icon="search"
                className="px-8"
                onClick={handleSearch}
                disabled={!isFormValid() || isFetching || projectTypesLoading}
                isLoading={isFetching}
              >
                {isFetching 
                  ? fileType === 'excel' 
                    ? "در حال دریافت فایل Excel..." 
                    : "در حال دریافت فایل PDF..."
                  : ` دانلود  ${fileType === 'excel' ? 'اکسل' : 'PDF'}`
                }
              </Button>
            </div>
            
            {/* راهنما */}
            {/* <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-xs font-semibold text-blue-800 mb-1">راهنمای استفاده:</h4>
              <ul className="text-xs text-blue-700 space-y-1 mr-3">
                <li className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>گزارش روزانه بر اساس سال، ماه و نوع پروژه فیلتر می‌شود</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>پس از پر کردن تمام فیلدها، دکمه جستجو فعال می‌شود</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>فایل به صورت خودکار دانلود خواهد شد</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>هدر Accept برای سرور ارسال می‌شود: <code className="bg-blue-100 px-1 rounded">application/vnd.openxmlformats-officedocument.spreadsheetml.sheet</code></span>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReport;