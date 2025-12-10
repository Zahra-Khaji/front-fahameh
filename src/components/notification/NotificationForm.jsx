// src/components/notification/NotificationForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import { FaCalendarAlt, FaHashtag, FaExclamationTriangle, FaSpinner, FaCalculator } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import ConfirmationModal from '../ui/ConfirmationModal';

// Hooks
import { useNotificationNumber } from '../../hooks/useNotificationNumber';

// Utils
import { formatPersianDate, formatMultipleDates } from '../../utils/helpers';

const NotificationForm = ({ 
  lastNotificationNumber, 
  onSubmit, 
  onCancel,
  previousData // داده‌های مرحله قبل
}) => {
  const [notificationNumber, setNotificationNumber] = useState('');
  const [sendDate, setSendDate] = useState(null);
  const [inspectionDays, setInspectionDays] = useState('');
  const [inspectionRange, setInspectionRange] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [daysError, setDaysError] = useState('');
  const [isDaysManuallyEdited, setIsDaysManuallyEdited] = useState(false);

  const projectId = previousData?.projectInfo?.projectId;
  const projectTypeId = previousData?.projectInfo?.projectTypeId || previousData?.projectInfo?.projectType;
  
  console.log('Project data for notification:', {
    projectId,
    projectTypeId,
    previousData: previousData?.projectInfo
  });

  // استفاده از هوک برای دریافت شماره نوتیفیکیشن از بک‌اند
  const { 
    data: notificationData, 
    isLoading: notificationLoading, 
    error: notificationError
  } = useNotificationNumber(projectId, projectTypeId);

  // وقتی داده‌های بک‌اند دریافت شد، شماره نوتیفیکیشن رو تنظیم کن
  useEffect(() => {
    if (notificationData?.next_rfi_numbering) {
      setNotificationNumber(notificationData.next_rfi_numbering);
    }
  }, [notificationData]);

  // تنظیم تاریخ پیش‌فرض
  useEffect(() => {
    if (!sendDate) {
      setSendDate(new Date());
    }
  }, []);

  // محاسبه خودکار تعداد روزها بر اساس تاریخ‌های انتخاب شده
  useEffect(() => {
    if (!isDaysManuallyEdited && inspectionRange.length > 0) {
      // تعداد روز = تعداد تاریخ‌های انتخاب شده
      const calculatedDays = inspectionRange.length.toString();
      setInspectionDays(calculatedDays);
    }
  }, [inspectionRange, isDaysManuallyEdited]);

  // وقتی کاربر دستی فیلد روزها رو ویرایش کرد، دیگه خودکار تغییر نکن
  const handleInspectionDaysChange = (e) => {
    const value = e.target.value;
    
    setIsDaysManuallyEdited(true);
    
    if (value === '') {
      setInspectionDays(value);
      setDaysError('');
    } else if (/^\d+$/.test(value)) {
      setInspectionDays(value);
      setDaysError('');
    } else {
      setDaysError('فقط عدد مجاز است');
    }
  };

  const handleInspectionRangeChange = (dates) => {
    setInspectionRange(dates);
  };

  // دکمه "بازنشانی خودکار" برای بازگشت به محاسبه خودکار
  const handleResetAutoCalculate = () => {
    setIsDaysManuallyEdited(false);
    if (inspectionRange.length > 0) {
      setInspectionDays(inspectionRange.length.toString());
    }
  };

  const handleSubmit = () => {
    const formData = {
      number: notificationNumber,
      sendDate: sendDate,
      inspectionDays: parseInt(inspectionDays) || 0,
      inspectionRange: inspectionRange,
      idom: notificationData?.IDOM
    };
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      number: notificationNumber,
      sendDate: sendDate,
      inspectionDays: parseInt(inspectionDays) || 0,
      inspectionRange: inspectionRange,
      idom: notificationData?.IDOM
    });
    setShowConfirmation(false);
  };

  const isFormValid = notificationNumber && sendDate && inspectionDays && !daysError && inspectionRange.length > 0;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-4 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
          <FaHashtag className="ml-2 text-blue-500 text-sm sm:text-base" />
          اطلاعات نوتیفیکیشن
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {/* سطر اول: شماره ثبت و تاریخ ارسال */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Notification Number */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                <FaHashtag className="ml-1 text-blue-500 text-xs sm:text-sm" />
                شماره ثبت نوتیفیکیشن *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={notificationNumber}
                  onChange={(e) => setNotificationNumber(parseInt(e.target.value) || '')}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                  placeholder="شماره ثبت"
                  disabled={notificationLoading}
                />
                {notificationLoading && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <FaSpinner className="animate-spin text-blue-500 text-xs" />
                  </div>
                )}
              </div>
              
              {/* نمایش وضعیت */}
              <div className="mt-1">
                {notificationLoading ? (
                  <p className="text-xs text-blue-500 flex items-center">
                    <FaSpinner className="ml-1 animate-spin text-xs" />
                    در حال دریافت شماره از سرور...
                  </p>
                ) : notificationError ? (
                  <p className="text-xs text-red-500 flex items-center">
                    <FaExclamationTriangle className="ml-1 text-xs" />
                    خطا در دریافت شماره از سرور
                  </p>
                ) : notificationData?.next_rfi_numbering ? (
                  <p className="text-xs text-green-600">
                    شماره پیشنهادی سیستم: {notificationData.next_rfi_numbering}
                  </p>
                ) : !projectId || !projectTypeId ? (
                  <p className="text-xs text-orange-500">
                    ابتدا پروژه و نوع آن را در مرحله قبل انتخاب کنید
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    شماره را وارد کنید
                  </p>
                )}
              </div>
            </div>

            {/* Send Date */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                <FaCalendarAlt className="ml-1 text-blue-500 text-xs sm:text-sm" />
                تاریخ ارسال نوتیفیکیشن *
              </label>
              <DatePicker
                value={sendDate}
                onChange={setSendDate}
                format="YYYY/MM/DD"
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="انتخاب تاریخ"
              />
            </div>
          </div>

          {/* سطر دوم: تاریخ بازرسی و تعداد روز بازرسی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Inspection Range - حالا اولویت اول */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                <FaCalendarAlt className="ml-1 text-blue-500 text-xs sm:text-sm" />
                تاریخ انجام بازرسی *
              </label>
              <DatePicker
                value={inspectionRange}
                onChange={handleInspectionRangeChange}
                multiple
                plugins={[<Toolbar position="bottom" />]}
                calendar={persian}
                locale={persian_fa}
                inputClass="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="انتخاب تاریخ"
              />
              {inspectionRange.length > 0 && (
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-green-600">
                    {inspectionRange.length} تاریخ انتخاب شده
                  </p>
                  {/* <div className="flex items-center text-xs text-blue-600">
                    <FaCalculator className="ml-1 text-xs" />
                    <span className="font-semibold">محاسبه خودکار: {inspectionRange.length} روز</span>
                  </div> */}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                می‌توانید یک یا چند تاریخ انتخاب کنید
              </p>
            </div>

            {/* Inspection Days - حالا دوم */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  تعداد روز بازرسی *
                </label>
                {isDaysManuallyEdited && (
                  <button
                    type="button"
                    onClick={handleResetAutoCalculate}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    title="بازنشانی به محاسبه خودکار"
                  >
                    <FaCalculator className="text-xs" />
                    بازنشانی خودکار
                  </button>
                )}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={inspectionDays}
                  onChange={handleInspectionDaysChange}
                  inputMode="numeric"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white pr-8 ${
                    daysError ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                  }`}
                  placeholder="تعداد روز را وارد کنید"
                />
                
                {/* آیکون وضعیت */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  {isDaysManuallyEdited ? (
                    <FaExclamationTriangle className="text-yellow-500 text-xs" title="ویرایش دستی" />
                  ) : inspectionRange.length > 0 ? (
                    <FaCalculator className="text-green-500 text-xs" title="محاسبه خودکار" />
                  ) : null}
                </div>
              </div>
              
              <div className="mt-1">
                {daysError ? (
                  <p className="text-red-500 text-xs flex items-center">
                    <FaExclamationTriangle className="ml-1 text-xs" />
                    {daysError}
                  </p>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {isDaysManuallyEdited 
                        ? 'ویرایش دستی فعال' 
                        : inspectionRange.length > 0 
                          ? 'محاسبه خودکار بر اساس تاریخ‌ها' 
                          : 'انتخاب تاریخ برای محاسبه خودکار'
                      }
                    </p>
                    {inspectionDays && !daysError && (
                      <p className="text-xs font-semibold text-green-600">
                        {inspectionDays} روز
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || notificationLoading}
              variant="primary"
              size="md"
              icon="check"
              className="flex-1 w-full sm:w-auto"
            >
              {notificationLoading ? "در حال دریافت داده..." : "ادامه و تأیید اطلاعات"}
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleFinalSubmit}
        title="تأیید نهایی"
        message="لطفاً اطلاعات را بررسی کنید"
        confirmText="تأیید و ثبت نهایی"
        cancelText="ویرایش اطلاعات"
        type="success"
      >
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm">خلاصه اطلاعات:</h4>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">شماره ثبت:</span>
              <span className="font-semibold">{notificationNumber}</span>
            </div>
            {notificationData?.IDOM && (
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-600">IDOM:</span>
                <span className="font-semibold">{notificationData.IDOM}</span>
              </div>
            )}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تاریخ ارسال:</span>
              <span className="font-semibold">{formatPersianDate(sendDate)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تعداد روز بازرسی:</span>
              <span className="font-semibold">{inspectionDays} روز</span>
              <span className="text-xs text-gray-500">
                {isDaysManuallyEdited ? '(ویرایش دستی)' : '(محاسبه خودکار)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {inspectionRange.length === 1 ? 'تاریخ بازرسی:' : 'تاریخ‌های بازرسی:'}
              </span>
              <span className="font-semibold text-left text-xs sm:text-sm">
                {formatMultipleDates(inspectionRange)}
                <span className="block text-xs text-gray-500 mt-1">
                  ({inspectionRange.length} تاریخ)
                </span>
              </span>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default NotificationForm;