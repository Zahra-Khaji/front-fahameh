// src/components/notification/NotificationForm.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import { FaCalendarAlt, FaHashtag } from 'react-icons/fa';

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
  const [inspectionRange, setInspectionRange] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setNotificationNumber(lastNotificationNumber + 1);
    setSendDate(new Date());
  }, [lastNotificationNumber]);

  const handleSubmit = () => {
    const formData = {
      number: notificationNumber,
      sendDate: sendDate,
      inspectionRange: inspectionRange,
    };
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      number: notificationNumber,
      sendDate: sendDate,
      inspectionRange: inspectionRange,
    });
    setShowConfirmation(false);
  };

  const isFormValid = notificationNumber && sendDate && inspectionRange.length === 2;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaHashtag className="ml-2 text-blue-500" />
          اطلاعات نوتیفیکیشن
        </h2>

        <div className="space-y-4">
          {/* Notification Number */}
          <InputField
            label={
              <span className="flex items-center">
                <FaHashtag className="ml-1 text-blue-500" />
                شماره ثبت نوتیفیکیشن *
              </span>
            }
            type="number"
            value={notificationNumber}
            onChange={(e) => setNotificationNumber(parseInt(e.target.value) || '')}
            placeholder="شماره ثبت"
            helperText={`پیشنهاد سیستم: ${lastNotificationNumber + 1}`}
          />

          {/* Send Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCalendarAlt className="ml-1 text-blue-500" />
              تاریخ ارسال نوتیفیکیشن *
            </label>
            <DatePicker
              value={sendDate}
              onChange={setSendDate}
              format="YYYY/MM/DD"
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
              placeholder="انتخاب تاریخ"
            />
          </div>

          {/* Inspection Range */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCalendarAlt className="ml-1 text-blue-500" />
              بازه انجام بازرسی *
            </label>
            <DatePicker
              dateSeparator=" تا "
              value={inspectionRange}
              onChange={setInspectionRange}
              range
              rangeHover
              plugins={[<Toolbar position="bottom" />]}
              calendar={persian}
              locale={persian_fa}
              inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
            />
            {inspectionRange.length === 2 && (
              <p className="text-xs text-green-600 mt-2 mr-1">
                بازه انتخاب شده: {formatDateRange(inspectionRange)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              variant="primary"
              size="md"
              icon="check"
              className="flex-1"
            >
              ادامه و تأیید اطلاعات
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              size="md"
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
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">خلاصه اطلاعات:</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">شماره ثبت:</span>
              <span className="font-semibold">{notificationNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تاریخ ارسال:</span>
              <span className="font-semibold">{formatPersianDate(sendDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">بازه بازرسی:</span>
              <span className="font-semibold text-left">{formatDateRange(inspectionRange)}</span>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default NotificationForm;