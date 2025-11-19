// src/components/modals/InspectionReportModal.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { FaFileAlt, FaTrash, FaCalendarAlt, FaHashtag, FaCheck, FaExclamationTriangle, FaPlus, FaTimes, FaBuilding, FaList } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import ErrorPopup from '../ui/ErrorPopup';
import ConfirmationModal from '../ui/ConfirmationModal';

// Data & Utils
import { projects, reportStatusOptions } from '../../data/staticData';
import { inspectionReportSchema } from '../../utils/validationSchemas';
import { formatPersianDate } from '../../utils/helpers';

const InspectionReportModal = ({ 
  isOpen, 
  onClose, 
  projectId 
}) => {
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

  // وقتی projectId تغییر کرد، گزارش‌های مربوطه رو لود کن
  useEffect(() => {
    if (projectId) {
      // اینجا می‌تونی از API گزارش‌های موجود رو لود کنی
      // برای نمونه، یک آرایه خالی می‌ذاریم
      const projectReports = []; 
      setReports(projectReports);
      setValue('reportNumber', getNextReportNumber());
      setShowAddForm(false);
    }
  }, [projectId, setValue]);

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
      projectId: projectId,
      projectName: projects.find(p => p.id === projectId)?.name || '',
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

  const selectedProject = projects.find(p => p.id === projectId);
  const projectName = selectedProject?.name || '';

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          
{/* Header */}
<div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-2xl p-4 text-white">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
        <FaFileAlt className="text-lg" />
      </div>
      <div>
        <h2 className="text-lg font-bold">گزارش‌های پروژه {projectName}</h2>
      </div>
    </div>
    <button
      onClick={onClose}
      className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition duration-200"
    >
      <FaTimes className="text-lg" />
    </button>
  </div>
</div>
          

          {/* Content */}
          <div className="p-6">
            
            {/* اگر پروژه انتخاب شده */}
            {projectId && (
              <div className="space-y-6">
                
                {/* وضعیت گزارش‌ها */}
                {reports.length === 0 && !showAddForm && (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                    <FaList className="text-4xl text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">هنوز گزارشی ثبت نشده</h3>
                    <p className="text-sm text-gray-500 mb-6">اولین گزارش را برای این پروژه ثبت کنید</p>
                    <Button
                      onClick={toggleAddForm}
                      variant="primary"
                      size="md"
                      icon="plus"
                      className="mx-auto"
                    >
                      افزودن گزارش جدید
                    </Button>
                  </div>
                )}

                {/* دکمه toggle برای فرم - فقط وقتی گزارش وجود داره یا فرم بازه */}
                {(reports.length > 0 || showAddForm) && (
                  <div className="flex justify-start">
                    <button
                      onClick={toggleAddForm}
                      className={`
                        inline-flex items-center justify-center gap-2 px-4 py-2 text-sm 
                        font-medium rounded-lg transition duration-200 border-2
                        ${showAddForm 
                          ? 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50' 
                          : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        }
                        min-w-[160px]
                      `}
                    >
                      {showAddForm ? (
                        <>
                          <FaTimes className="text-sm" />
                          بستن فرم
                        </>
                      ) : (
                        <>
                          <FaPlus className="text-sm" />
                          افزودن گزارش جدید
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* فرم ثبت گزارش جدید */}
                {showAddForm && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <FaFileAlt className="ml-2 text-blue-500" />
                      ثبت گزارش جدید
                    </h3>
                    
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                      
                      {/* شماره گزارش */}
                      <div className="flex flex-col">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <FaHashtag className="ml-1 text-blue-500" />
                          شماره گزارش *
                        </label>
                        <input
                          type="number"
                          {...register('reportNumber', { valueAsNumber: true })}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                          placeholder="شماره گزارش"
                        />
                        {errors.reportNumber && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <FaExclamationTriangle className="ml-1 text-xs" />
                            {errors.reportNumber.message}
                          </p>
                        )}
                      </div>

                      {/* تاریخ دریافت و وضعیت */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                        
                        {/* تاریخ دریافت */}
                        <div className="flex flex-col">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <FaCalendarAlt className="ml-1 text-blue-500" />
                            تاریخ دریافت *
                          </label>
                          <DatePicker
                            value={receiveDate}
                            onChange={handleDateChange}
                            format="YYYY/MM/DD"
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            inputClass={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
                              errors.receiveDate ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                            }`}
                            placeholder="انتخاب تاریخ"
                          />
                          {errors.receiveDate && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
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
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <FaCheck className="ml-1 text-blue-500" />
                            وضعیت گزارش *
                          </label>
                          <select
                            {...register('status')}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white ${
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
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <FaExclamationTriangle className="ml-1 text-xs" />
                              {errors.status.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* فیلد اصلاحات (اگر وضعیت "نیاز به اصلاحات" باشد) */}
                      {watchStatus === 'needs_correction' && (
                        <div className="flex flex-col">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            اصلاحات *
                          </label>
                          <textarea
                            {...register('corrections')}
                            rows="3"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white resize-none ${
                              errors.corrections ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                            }`}
                            placeholder="توضیحات اصلاحات الزامی است..."
                          />
                          {errors.corrections && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <FaExclamationTriangle className="ml-1 text-xs" />
                              {errors.corrections.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* دکمه ثبت */}
                      <div className="flex justify-center pt-4">
                        <Button
                          type="submit"
                          variant="primary"
                          size="md"
                          icon="check"
                          className="w-full md:w-64"
                        >
                          ثبت گزارش
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* جدول گزارش‌ها */}
                {reports.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <FaFileAlt className="ml-2 text-blue-500" />
                        گزارش‌های پروژه {projectName}
                        <span className="mr-2 text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded">
                          {reports.length} گزارش
                        </span>
                      </h3>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-right font-semibold text-gray-700">شماره</th>
                            <th className="p-3 text-right font-semibold text-gray-700">تاریخ دریافت</th>
                            <th className="p-3 text-right font-semibold text-gray-700">وضعیت</th>
                            <th className="p-3 text-right font-semibold text-gray-700">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3 font-semibold">{report.number}</td>
                              <td className="p-3">{formatPersianDate(report.receiveDate)}</td>
                              <td className="p-3">
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
                              <td className="p-3">
                                <button
                                  onClick={() => handleDelete(report)}
                                  className="text-red-500 hover:text-red-700 transition duration-200"
                                  title="حذف"
                                >
                                  <FaTrash className="text-sm" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden p-4 space-y-3">
                      {reports.map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">شماره:</span>
                              <span className="font-semibold">{report.number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">تاریخ:</span>
                              <span className="font-semibold">{formatPersianDate(report.receiveDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 font-medium">وضعیت:</span>
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
                            {report.corrections && (
                              <div className="flex items-start justify-between">
                                <span className="text-gray-600 font-medium mt-1">اصلاحات:</span>
                                <span className="font-semibold text-right text-xs break-words flex-1 mr-2 text-justify">
                                  {report.corrections}
                                </span>
                              </div>
                            )}
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
                  </div>
                )}
              </div>
            )}

            {/* اگر پروژه انتخاب نشده */}
            {!projectId && (
              <div className="text-center py-8 text-gray-500">
                <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
                <p className="text-lg font-semibold">پروژه‌ای انتخاب نشده</p>
                <p className="text-sm mt-1">لطفاً از طریق جدول پروژه‌ها اقدام کنید</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Popup و ConfirmationModal بدون تغییر */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="خطا در ثبت"
        message={errorMessage}
      />

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
    </>
  );
};

export default InspectionReportModal;