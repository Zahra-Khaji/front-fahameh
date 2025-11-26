// src/components/ui/AddReportModal.jsx
import React, { useState } from 'react';
import { FaTimes, FaFileAlt, FaHashtag, FaCalendarAlt, FaDollarSign, FaExclamationTriangle } from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Button from './Button';
import { useCreateReport } from '../../hooks/useCreateReport';
import { useUser } from '../../hooks/useUser';

const AddReportModal = ({ isOpen, onClose, onAddReport, rfiData }) => {
  const [formData, setFormData] = useState({
    reportNumber: '',
    date: null,
    inspectorFee: ''
  });
  
  const { user, loading: userLoading } = useUser(); // اینجا باید باشه
  const { mutate: createReport, isLoading, error } = useCreateReport();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.reportNumber.trim()) {
      const persianDate = formData.date ? formData.date.format("YYYY/MM/DD") : "";

      const reportData = {
        rfi_numbering: rfiData?.RFI_Numbering || '',
        report_no: formData.reportNumber,
        rev_no: "",
        IssueDate: persianDate,
        Doc_Status: "",
        Remark: "",
        App_manday_1stPrice: 1,
        first_price: 80000000,
        UnitNo: "",
        VendorName: rfiData?.VendorName || "",
        IRNNO: "",
        SRNNo: "",
        user: user?.username || "H-Bakhshpoor",
        reportrecivedDatee: persianDate,
        DateShamsi: ""
      };

      console.log('🎯 AddReportModal: Sending report data:', reportData);

      // فراخوانی سرویس
      createReport(reportData, {
        onSuccess: (data) => {
          console.log('✅ AddReportModal: Report created successfully:', data);
          // بستن مدال و ریست فرم
          setFormData({ reportNumber: '', date: null, inspectorFee: '' });
          onClose();
          
          // اگر تابع callback داریم، فراخوانی کنیم
          if (onAddReport) {
            onAddReport({
              ...formData,
              rfiNumber: rfiData?.RFI_Number,
              projectName: rfiData?.ProjectTitle
            });
          }
        },
        onError: (error) => {
          console.error('❌ AddReportModal: Error creating report:', error);
        }
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date: date
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaFileAlt className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">ثبت گزارش جدید</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            disabled={isLoading}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* اطلاعات RFI */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-6">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">اطلاعات RFI</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">شماره RFI:</span>
                <span className="font-semibold">{rfiData?.RFI_Number}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">نام پروژه:</span>
                <span className="font-semibold">{rfiData?.ProjectTitle}</span>
              </div>
            </div>
          </div>

          {/* نمایش خطا */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm flex items-center">
                <FaExclamationTriangle className="ml-1 text-xs" />
                خطا در ثبت گزارش: {error.message}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* شماره گزارش */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaHashtag className="text-blue-500" />
                شماره گزارش *
              </label>
              <input
                type="text"
                name="reportNumber"
                value={formData.reportNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="شماره گزارش را وارد کنید"
                required
                disabled={isLoading}
              />
            </div>

            {/* تاریخ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-500" />
                تاریخ گزارش
              </label>
              <DatePicker
                value={formData.date}
                onChange={handleDateChange}
                format="YYYY/MM/DD"
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass=" w-[310px] md:w-[415px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                placeholder="انتخاب تاریخ"
                disabled={isLoading}
              />
            </div>

            {/* دستمزد بازرس */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="text-blue-500" />
                دستمزد بازرس
              </label>
              <input
                type="text"
                name="inspectorFee"
                value={formData.inspectorFee}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="مبلغ به تومان"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!formData.reportNumber.trim() || isLoading}
            >
              {isLoading ? 'در حال ثبت...' : 'ثبت گزارش'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;