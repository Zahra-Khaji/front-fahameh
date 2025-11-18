// src/components/forms/InspectionReportForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { FaClipboardList, FaFileAlt, FaTrash, FaCalendarAlt, FaHashtag, FaCheck, FaExclamationTriangle, FaPlus, FaTimes } from 'react-icons/fa';

// Components
import StepHeader from './../common/StepHeader';
import FormSection from './../common/FormSection';
import SelectField from './../ui/SelectField';
import Button from './../ui/Button';
import ErrorPopup from './../ui/ErrorPopup';
import ConfirmationModal from './../ui/ConfirmationModal';

// Data & Utils
import { projects, reportStatusOptions } from './../../data/staticData';
import { inspectionReportSchema } from './../../utils/validationSchemas';
import { formatPersianDate } from './../../utils/helpers';

const InspectionReportForm = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [reports, setReports] = useState([]);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ 
    show: false, 
    report: null 
  });
  const [receiveDate, setReceiveDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inspectionReportSchema),
    defaultValues: {
      reportNumber: '',
      receiveDate: new Date(),
      status: 'under_inspection',
      corrections: '',
    },
  });

  const watchStatus = watch('status');

  // محاسبه آخرین شماره گزارش
  const getNextReportNumber = () => {
    if (reports.length === 0) return 1001;
    const maxNumber = Math.max(...reports.map(report => report.number));
    return maxNumber + 1;
  };

  // وقتی پروژه تغییر کرد، گزارش‌های مربوطه رو لود کن
  useEffect(() => {
    if (selectedProject) {
      const projectReports = [];
      setReports(projectReports);
      setValue('reportNumber', getNextReportNumber());
      setShowAddForm(false);
    }
  }, [selectedProject, setValue]);

  // مدیریت تغییر تاریخ
  const handleDateChange = (date) => {
    setReceiveDate(date);
    setValue('receiveDate', date, { shouldValidate: true });
  };
  // مدیریت تغییر وضعیت گزارش
const handleStatusChange = (reportId, newStatus) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, corrections: newStatus === 'needs_correction' ? report.corrections : '' }
          : report
      )
    );
  };

  // وقتی فرم ثبت شد
  const onSubmit = (data) => {
    const newReport = {
      id: Date.now(),
      projectId: selectedProject,
      projectName: projects.find(p => p.id === selectedProject)?.name || '',
      number: data.reportNumber,
      receiveDate: data.receiveDate,
      status: data.status,
      corrections: data.corrections || '',
      createdAt: new Date()
    };

    setReports(prev => [newReport, ...prev]);
    
    reset({
      reportNumber: getNextReportNumber() + 1,
      receiveDate: new Date(),
      status: 'under_inspection',
      corrections: '',
    });
    setReceiveDate(new Date());
    setShowAddForm(false);
  };

  const onError = (errors) => {
    console.log('Validation Errors:', errors);
    const firstError = Object.values(errors).find((error) => error);
    if (firstError) {
      setErrorMessage('لطفاً تمام فیلدهای الزامی را پر کنید');
      setShowErrorPopup(true);
    }
  };

  const handleDelete = (report) => {
    setDeleteConfirmation({ show: true, report });
  };

  const confirmDelete = () => {
    if (deleteConfirmation.report) {
      setReports(prev => prev.filter(r => r.id !== deleteConfirmation.report.id));
    }
    setDeleteConfirmation({ show: false, report: null });
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setValue('reportNumber', getNextReportNumber());
      setReceiveDate(new Date());
    }
  };

  const selectedProjectName = projects.find(p => p.id === selectedProject)?.name || '';

  const getStatusLabel = (statusValue) => {
    const statusObj = reportStatusOptions.find(option => option.value === statusValue);
    return statusObj ? statusObj.label : '-';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <StepHeader
          title="سامانه ثبت گزارش بازرسی"
          description="فرم ثبت و مدیریت گزارش‌های بازرسی"
          icon={FaClipboardList}
        />

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-3 lg:p-4">
          
          {/* انتخاب پروژه */}
          <FormSection
            title="انتخاب پروژه"
            icon={FaFileAlt}
            className="mb-2 lg:mb-3"
          >
            <SelectField
              label="نام پروژه *"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              options={projects}
              placeholder="انتخاب پروژه"
              className="w-full py-1.5 sm:py-1.5 lg:py-1.5"
            />
          </FormSection>

          {/* اگر پروژه انتخاب شده */}
          {selectedProject && (
            <>
              {/* دکمه toggle برای فرم */}
              <div className="flex justify-start mb-3 lg:mb-4">
                {/* استفاده از کلاس‌های سفارشی برای حفظ اندازه و تغییر استایل */}
                <button
                  onClick={toggleAddForm}
                  className={`
                    inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs sm:text-sm 
                    font-medium rounded-lg transition duration-200 border-2
                    ${showAddForm 
                      ? 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50' 
                      : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    }
                    min-w-[140px] sm:min-w-[160px] /* حداقل عرض برای حفظ اندازه */
                  `}
                >
                  {showAddForm ? (
                    <>
                      <FaTimes className="text-xs sm:text-sm" />
                      بستن فرم
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-xs sm:text-sm" />
                      افزودن گزارش جدید
                    </>
                  )}
                </button>
              </div>

              {/* فرم ثبت گزارش جدید */}
              {showAddForm && (
                <FormSection
                  title="ثبت گزارش جدید"
                  icon={FaFileAlt}
                  className="mb-2 lg:mb-3"
                >
                  <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-3 sm:space-y-3 lg:space-y-4">
                    
                    {/* سطر اول: شماره گزارش */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                        <FaHashtag className="ml-1 text-blue-500 text-xs sm:text-sm" />
                        شماره گزارش *
                      </label>
                      <input
                        type="number"
                        {...register('reportNumber', { valueAsNumber: true })}
                        className="w-full px-2 sm:px-3 py-1.5 lg:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                        placeholder="شماره گزارش"
                      />
                      {errors.reportNumber && (
                        <p className="text-red-500 text-xs mt-0.5 flex items-center">
                          <FaExclamationTriangle className="ml-1 text-xs" />
                          {errors.reportNumber.message}
                        </p>
                      )}
                    </div>

                    {/* سطر دوم: تاریخ دریافت و وضعیت */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2 lg:gap-4 items-start">
                      
                      {/* تاریخ دریافت */}
                      <div className="flex flex-col">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                          <FaCalendarAlt className="ml-1 text-blue-500 text-xs sm:text-sm" />
                          تاریخ دریافت *
                        </label>
                        <DatePicker
                          value={receiveDate}
                          onChange={setReceiveDate}
                          format="YYYY/MM/DD"
                          calendar={persian}
                          locale={persian_fa}
                          calendarPosition="bottom-right"
                          inputClass={`w-full px-2 sm:px-3 py-1.5 lg:py-1.5 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
                            errors.receiveDate ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          }`}
                          placeholder="انتخاب تاریخ"
                        />
                        {errors.receiveDate && (
                          <p className="text-red-500 text-xs mt-0.5 flex items-center">
                            <FaExclamationTriangle className="ml-1 text-xs" />
                            {errors.receiveDate.message}
                          </p>
                        )}
                        <input
                          type="hidden"
                          {...register('receiveDate', {
                            required: true,
                            value: receiveDate
                          })}
                        />
                      </div>

                      {/* وضعیت گزارش */}
                      <div className="flex flex-col">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5 flex items-center">
                          <FaCheck className="ml-1 text-blue-500 text-xs sm:text-sm" />
                          وضعیت گزارش *
                        </label>
                        <select
                          {...register('status')}
                          className={`w-full px-2 sm:px-3 py-1.5 lg:py-1.5 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
                            errors.status ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          }`}
                        >
                          {reportStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.status && (
                          <p className="text-red-500 text-xs mt-0.5 flex items-center">
                            <FaExclamationTriangle className="ml-1 text-xs" />
                            {errors.status.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* سطر سوم: فیلد اصلاحات (اگر وضعیت "نیاز به اصلاحات" باشد) */}
                    {watchStatus === 'needs_correction' && (
                      <div className="flex flex-col">
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-0.5">
                          اصلاحات *
                        </label>
                        <textarea
                          {...register('corrections')}
                          rows="2"
                          className={`w-full px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white resize-none ${
                            errors.corrections ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                          }`}
                          placeholder="توضیحات اصلاحات الزامی است..."
                        />
                        {errors.corrections && (
                          <p className="text-red-500 text-xs mt-0.5 flex items-center">
                            <FaExclamationTriangle className="ml-1 text-xs" />
                            {errors.corrections.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* دکمه ثبت */}
                    <div className="flex justify-center pt-2 sm:pt-2 lg:pt-3">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        icon="check"
                        className="w-full lg:w-80 px-8"
                      >
                        ثبت گزارش
                      </Button>
                    </div>
                  </form>
                </FormSection>
              )}

              {/* جدول گزارش‌ها */}
              {reports.length > 0 && (
                <FormSection
                  title={`گزارش‌های پروژه ${selectedProjectName}`}
                  icon={FaFileAlt}
                >
                  <div className="mb-2 lg:mb-3">
                    <span className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 rounded">
                      تعداد: {reports.length} گزارش
                    </span>
                  </div>

              {/* Desktop Table */}
<div className="hidden lg:block overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">شماره</th>
        <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">تاریخ دریافت</th>
        <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">وضعیت</th>
        <th className="p-2 sm:p-3 text-right font-semibold text-gray-700 text-xs sm:text-sm">عملیات</th>
      </tr>
    </thead>
    <tbody>
      {reports.map((report) => (
        <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="p-2 sm:p-3 font-semibold text-xs sm:text-sm">{report.number}</td>
          <td className="p-2 sm:p-3 text-xs sm:text-sm">
            {formatPersianDate(report.receiveDate)}
          </td>
        {/* وضعیت در جدول دسکتاپ */}
<td className="p-2 sm:p-3">
  <select
    value={report.status}
    onChange={(e) => handleStatusChange(report.id, e.target.value)}
    className={`w-32 px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 ${
      report.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
      report.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
      report.status === 'under_inspection' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      'bg-yellow-100 text-yellow-800 border-yellow-300'
    }`}
  >
    {reportStatusOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</td>
          <td className="p-2 sm:p-3">
            <button
              onClick={() => handleDelete(report)}
              className="text-red-500 hover:text-red-700 transition duration-200"
              title="حذف"
            >
              <FaTrash className="text-xs" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile Cards */}
<div className="lg:hidden space-y-3">
  {reports.map((report) => (
    <div key={report.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="grid grid-cols-1 gap-2 text-xs">
        {/* شماره گزارش */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium min-w-[60px]">شماره:</span>
          <span className="font-semibold text-left flex-1 mr-2">{report.number}</span>
        </div>
        
        {/* تاریخ دریافت */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium min-w-[60px]">تاریخ:</span>
          <span className="font-semibold text-left flex-1 mr-2">
            {formatPersianDate(report.receiveDate)}
          </span>
        </div>
        
    {/* وضعیت در موبایل */}
<div className="flex items-center justify-between">
  <span className="text-gray-600 font-medium min-w-[60px]">وضعیت:</span>
  <select
    value={report.status}
    onChange={(e) => handleStatusChange(report.id, e.target.value)}
    className={`w-32 text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 ${
      report.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
      report.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
      report.status === 'under_inspection' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      'bg-yellow-100 text-yellow-800 border-yellow-300'
    }`}
  >
    {reportStatusOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
</div>
        
        {/* اصلاحات (اگر وجود دارد) */}
        {report.corrections && (
          <div className="flex items-start justify-between">
            <span className="text-gray-600 font-medium min-w-[60px] mt-1">اصلاحات:</span>
            <span className="font-semibold text-right text-xs break-words flex-1 mr-2 text-justify">
              {report.corrections}
            </span>
          </div>
        )}
        
        {/* دکمه حذف */}
        <div className="flex justify-end pt-2 border-t border-gray-300 mt-2">
          <button
            onClick={() => handleDelete(report)}
            className="text-red-500 hover:text-red-700 transition duration-200 flex items-center gap-1"
          >
            <FaTrash className="text-xs" />
            <span className="text-xs">حذف</span>
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
                </FormSection>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="خطا در ثبت"
        message={errorMessage}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.show}
        onClose={() => setDeleteConfirmation({ show: false, report: null })}
        onConfirm={confirmDelete}
        title="تأیید حذف"
        message={`آیا از حذف گزارش شماره ${deleteConfirmation.report?.number} اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        type="danger"
      />
    </div>
  );
};

export default InspectionReportForm;