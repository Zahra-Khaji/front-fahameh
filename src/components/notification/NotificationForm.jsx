// src/components/notification/NotificationForm.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import { FaCalendarAlt, FaHashtag, FaExclamationTriangle } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import ConfirmationModal from '../ui/ConfirmationModal';

// Utils
import { formatPersianDate, formatDateRange } from '../../utils/helpers';

const NotificationForm = ({ 
  lastNotificationNumber, 
  onSubmit, 
  onCancel 
}) => {
  const [notificationNumber, setNotificationNumber] = useState('');
  const [sendDate, setSendDate] = useState(null);
  const [inspectionDays, setInspectionDays] = useState('');
  const [inspectionRange, setInspectionRange] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [daysError, setDaysError] = useState('');

  useEffect(() => {
    setNotificationNumber(lastNotificationNumber + 1);
    setSendDate(new Date());
  }, [lastNotificationNumber]);

  const handleInspectionDaysChange = (e) => {
    const value = e.target.value;
    
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

  const handleSubmit = () => {
    const formData = {
      number: notificationNumber,
      sendDate: sendDate,
      inspectionDays: parseInt(inspectionDays) || 0,
      inspectionRange: inspectionRange,
    };
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      number: notificationNumber,
      sendDate: sendDate,
      inspectionDays: parseInt(inspectionDays) || 0,
      inspectionRange: inspectionRange,
    });
    setShowConfirmation(false);
  };

  const isFormValid = notificationNumber && sendDate && inspectionDays && !daysError && inspectionRange.length > 0;

  const formatInspectionDate = (range) => {
    if (!range || range.length === 0) return '-';
    if (range.length === 1) return formatPersianDate(range[0]);
    return formatDateRange(range);
  };

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
              <input
                type="number"
                value={notificationNumber}
                onChange={(e) => setNotificationNumber(parseInt(e.target.value) || '')}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="شماره ثبت"
              />
              <p className="text-xs text-gray-500 mt-1">
                پیشنهاد سیستم: {lastNotificationNumber + 1}
              </p>
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

          {/* سطر دوم: تعداد روز بازرسی و بازه بازرسی */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Inspection Days */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                تعداد روز بازرسی *
              </label>
              <input
                type="text"
                value={inspectionDays}
                onChange={handleInspectionDaysChange}
                inputMode="numeric"
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
                  daysError ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                }`}
                placeholder="تعداد روز را وارد کنید"
              />
              {daysError && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <FaExclamationTriangle className="ml-1 text-xs" />
                  {daysError}
                </p>
              )}
            </div>

            {/* Inspection Range */}
            <div className="flex flex-col">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center">
                <FaCalendarAlt className="ml-1 text-blue-500 text-xs sm:text-sm" />
                تاریخ/بازه انجام بازرسی *
              </label>
              <DatePicker
                dateSeparator=" تا "
                value={inspectionRange}
                onChange={handleInspectionRangeChange}
                range
                rangeHover
                multiple={false}
                plugins={[<Toolbar position="bottom" />]}
                calendar={persian}
                locale={persian_fa}
                inputClass="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="انتخاب تاریخ یا بازه"
              />
              {inspectionRange.length > 0 && (
                <p className="text-xs text-green-600 mt-1 sm:mt-2 mr-1">
                  {inspectionRange.length === 1 
                    ? `تاریخ انتخاب شده: ${formatPersianDate(inspectionRange[0])}`
                    : `بازه انتخاب شده: ${formatDateRange(inspectionRange)}`
                  }
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                می‌توانید یک تاریخ یا یک بازه زمانی انتخاب کنید
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-3">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              variant="primary"
              size="md"
              icon="check"
              className="flex-1 w-full sm:w-auto"
            >
              ادامه و تأیید اطلاعات
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
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تاریخ ارسال:</span>
              <span className="font-semibold">{formatPersianDate(sendDate)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تعداد روز بازرسی:</span>
              <span className="font-semibold">{inspectionDays} روز</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {inspectionRange.length === 1 ? 'تاریخ بازرسی:' : 'بازه بازرسی:'}
              </span>
              <span className="font-semibold text-left text-xs sm:text-sm">
                {formatInspectionDate(inspectionRange)}
              </span>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default NotificationForm;