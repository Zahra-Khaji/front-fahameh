// src/components/report/ReportForm.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { FaCalendarAlt, FaHashtag, FaCheck,FaFileAlt } from 'react-icons/fa';



// Components
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
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
  const [status, setStatus] = useState('');
  const [corrections, setCorrections] = useState('');
  const [receiveDate, setReceiveDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setReportNumber(lastReportNumber + 1);
    setReceiveDate(new Date());
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

  const isFormValid = reportNumber && status && receiveDate && 
    (status !== 'needs_correction' || corrections);

  const getStatusLabel = (statusValue) => {
    const statusObj = reportStatusOptions.find(option => option.value === statusValue);
    return statusObj ? statusObj.label : '-';
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaFileAlt className="ml-2 text-blue-500" />
          اطلاعات گزارش بازرس
        </h2>

        <div className="space-y-4">
          {/* Report Number */}
          <InputField
            label={
              <span className="flex items-center">
                <FaHashtag className="ml-1 text-blue-500" />
                شماره گزارش *
              </span>
            }
            type="number"
            value={reportNumber}
            onChange={(e) => setReportNumber(parseInt(e.target.value) || '')}
            placeholder="شماره گزارش"
            helperText={`پیشنهاد سیستم: ${lastReportNumber + 1}`}
          />

          {/* Status */}
          <SelectField
  label={
    <span className="flex items-center">
      <FaCheck className="ml-1 text-blue-500" />
      وضعیت *
    </span>
  }
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  options={reportStatusOptions.map(option => ({
    id: option.value,
    name: option.label
  }))}
  placeholder="انتخاب وضعیت"
/>

          {/* Corrections */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              اصلاحات
            </label>
            <textarea
              value={corrections}
              onChange={(e) => setCorrections(e.target.value)}
              rows="3"
              className="w-full px-3 h-11 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white resize-none"
              placeholder="در صورت نیاز به اصلاحات، توضیحات را وارد کنید..."
            />
            <p className="text-xs text-gray-500 mt-1">
              این فیلد در صورت انتخاب وضعیت "نیاز به اصلاحات" الزامی خواهد بود
            </p>
          </div>

          {/* Receive Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCalendarAlt className="ml-1 text-blue-500" />
              تاریخ دریافت گزارش *
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              variant="primary"
              size="lg"
              icon="check"
              className="flex-1"
            >
              ادامه و تأیید اطلاعات
            </Button>
            <Button
              onClick={onCancel}
              variant="secondary"
              size="lg"
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
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
            <div className="flex justify-between items-start">
              <span className="text-gray-600">اصلاحات:</span>
              <span className="font-semibold text-right text-xs max-w-xs">
                {corrections || '---'}
              </span>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </>
  );
};

export default ReportForm;