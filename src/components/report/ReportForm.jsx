// src/components/report/ReportForm.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { FaCalendarAlt, FaHashtag, FaCheck, FaFileAlt,FaExclamationTriangle } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import ConfirmationModal from '../ui/ConfirmationModal';

// Data & Utils
import { reportStatusOptions } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const ReportForm = ({ 
  lastReportNumber, 
  onSubmit, 
  onCancel 
}) => {
  const [reportNumber, setReportNumber] = useState('');
  const [status, setStatus] = useState('under_inspection'); // تغییر: مقدار پیش‌فرض "در حال بازرسی"
  const [corrections, setCorrections] = useState('');
  const [receiveDate, setReceiveDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setReportNumber(lastReportNumber + 1);
    setReceiveDate(new Date());
    // status قبلاً مقدار پیش‌فرض "under_inspection" رو داره
  }, [lastReportNumber]);

  const handleSubmit = () => {
    const formData = {
      number: reportNumber,
      status: status,
      corrections: corrections,
      receiveDate: receiveDate,
    };
    setShowConfirmation(true);
  };

  const handleFinalSubmit = () => {
    const formData = {
      number: reportNumber,
      status: status,
      corrections: corrections,
      receiveDate: receiveDate,
    };
    onSubmit(formData);
    setShowConfirmation(false);
  };

  const isFormValid = reportNumber && 
    status && 
    receiveDate && 
    (status !== 'needs_correction' || corrections);

  const getStatusLabel = (statusValue) => {
    const statusObj = reportStatusOptions.find(option => option.value === statusValue);
    return statusObj ? statusObj.label : '-';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <FaFileAlt className="ml-2 text-blue-500" />
          اطلاعات گزارش بازرس
        </h2>

        <div className="space-y-3">
          {/* سطر اول: شماره گزارش و تاریخ دریافت */}
          <div className="grid grid-cols-2 gap-4 items-start">
            
            {/* Report Number */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                <FaHashtag className="ml-1 text-blue-500" />
                شماره گزارش *
              </label>
              <input
                type="number"
                value={reportNumber}
                onChange={(e) => setReportNumber(parseInt(e.target.value) || '')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="شماره گزارش"
              />
            </div>

            {/* Receive Date */}
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                <FaCalendarAlt className="ml-1 text-blue-500" />
                تاریخ دریافت *
              </label>
              <DatePicker
                value={receiveDate}
                onChange={setReceiveDate}
                format="YYYY/MM/DD"
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                placeholder="انتخاب تاریخ"
              />
            </div>
          </div>

          {/* سطر دوم: وضعیت و فیلد اصلاحات (در صورت نیاز) */}
          {status === 'needs_correction' ? (
            <div className="grid grid-cols-4 gap-4 items-start">
              
              {/* وضعیت */}
              <div className="flex flex-col col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                  <FaCheck className="ml-1 text-blue-500" />
                  وضعیت *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                >
                  {reportStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* فیلد اصلاحات */}
              <div className="flex flex-col col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-0.5">
                 اصلاحات *
                </label>
                <textarea
                  value={corrections}
                  onChange={(e) => setCorrections(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white resize-none"
                  placeholder="توضیحات اصلاحات الزامی است..."
                />
                {!corrections && (
                  <p className="text-red-500 text-xs mt-0.5 flex items-center">
                    <FaExclamationTriangle className="ml-1" />
                    وارد کردن توضیحات اصلاحات الزامی است
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* فقط وضعیت وقتی اصلاحات نیاز نیست */
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                <FaCheck className="ml-1 text-blue-500" />
                وضعیت *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
              >
                {reportStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
        title="تأیید نهایی گزارش"
        message="لطفاً اطلاعات گزارش را بررسی کنید"
        confirmText="تأیید و ثبت نهایی"
        cancelText="ویرایش اطلاعات"
        type="success"
      >
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">خلاصه اطلاعات:</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">شماره گزارش:</span>
              <span className="font-semibold">{reportNumber}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">وضعیت:</span>
              <span className="font-semibold">{getStatusLabel(status)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-600">تاریخ دریافت:</span>
              <span className="font-semibold">{formatPersianDate(receiveDate)}</span>
            </div>
            {status === 'needs_correction' && (
              <div className="flex justify-between items-start">
                <span className="text-gray-600">اصلاحات:</span>
                <span className="font-semibold text-right text-sm max-w-xs">
                  {corrections || '---'}
                </span>
              </div>
            )}
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default ReportForm;