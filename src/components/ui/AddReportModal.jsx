// src/components/ui/AddReportModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaFileAlt, 
  FaHashtag, 
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit,
  FaCalendarCheck,
  FaListOl,
  FaUserTie,
  FaSpinner,
  FaUser,
  FaDollarSign,
  FaEye,
  FaTable,
  FaClipboardList,
  FaStickyNote,
  FaReceipt,
  FaIdCard,
  FaFileContract,
  FaWarehouse,
  FaPlusCircle,
  FaTrash,
  FaCopy
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Button from './Button';
import { useCreateReport } from '../../hooks/useCreateReport';
import { useUser } from '../../hooks/useUser';

const AddReportModal = ({ isOpen, onClose, onAddReport, rfiData }) => {
  const [reports, setReports] = useState([
    {
      id: 1,
      reportNumber: '',
      status: '',
      corrections: '',
      receivedDate: null,
      approvedDays: '',
      unitNumber: '',
      vendorName: rfiData?.VendorName || '',
      irn: '',
      srn: ''
    }
  ]);
  
  const [inspectorRows, setInspectorRows] = useState([
    {
      id: 1,
      rowNumber: 1,
      inspectionDate: '1403/01/15',
      approvalStatus: 'تائید شده',
      inspectorName: 'علی محمدی',
      fee: '15,000,000 تومان'
    },
    // {
    //   id: 2,
    //   rowNumber: 2,
    //   inspectionDate: '1403/01/20',
    //   approvalStatus: 'در انتظار',
    //   inspectorName: 'مریم کریمی',
    //   fee: '12,500,000 تومان'
    // }
  ]);
  
  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState('');

  const { user } = useUser();
  const { mutate: createReport, isLoading, error } = useCreateReport();

  // وضعیت‌های ممکن برای سلکت
  const statusOptions = [
    { value: 'approved', label: 'تائید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'needs_correction', label: 'نیاز به اصلاحات' }
  ];

  // وضعیت‌های ممکن برای صورت وضعیت بازرس
  const inspectorStatusOptions = [
    { value: 'approved', label: 'تائید شده' },
    { value: 'pending', label: 'در انتظار' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'under_review', label: 'در حال بررسی' }
  ];

  // ریست فرم وقتی مدال باز می‌شود
  useEffect(() => {
    if (isOpen) {
      setReports([
        {
          id: 1,
          reportNumber: '',
          status: '',
          corrections: '',
          receivedDate: null,
          approvedDays: '',
          unitNumber: '',
          vendorName: rfiData?.VendorName || '',
          irn: '',
          srn: ''
        }
      ]);
      setInspectorRows([
        {
          id: 1,
          rowNumber: 1,
          inspectionDate: '1403/01/15',
          approvalStatus: 'تائید شده',
          inspectorName: 'علی محمدی',
          fee: '15,000,000 تومان'
        },
        // {
        //   id: 2,
        //   rowNumber: 2,
        //   inspectionDate: '1403/01/20',
        //   approvalStatus: 'در انتظار',
        //   inspectorName: 'مریم کریمی',
        //   fee: '12,500,000 تومان'
        // }
      ]);
      setErrors({});
      setLocalError('');
    }
  }, [isOpen, rfiData]);

  // افزودن سطر جدید به گزارش‌ها
  const handleAddNewReportRow = () => {
    const newId = reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1;
    setReports([
      ...reports,
      {
        id: newId,
        reportNumber: '',
        status: '',
        corrections: '',
        receivedDate: null,
        approvedDays: '',
        unitNumber: '',
        vendorName: rfiData?.VendorName || '',
        irn: '',
        srn: ''
      }
    ]);
  };

  // افزودن سطر جدید به صورت وضعیت بازرس
  const handleAddNewInspectorRow = () => {
    const newId = inspectorRows.length > 0 ? Math.max(...inspectorRows.map(r => r.id)) + 1 : 1;
    setInspectorRows([
      ...inspectorRows,
      {
        id: newId,
        rowNumber: inspectorRows.length + 1,
        inspectionDate: '',
        approvalStatus: 'pending',
        inspectorName: '',
        fee: ''
      }
    ]);
  };

  // حذف سطر گزارش
  const handleDeleteReportRow = (id) => {
    if (reports.length > 1) {
      setReports(reports.filter(report => report.id !== id));
    }
  };

  // حذف سطر صورت وضعیت بازرس
  const handleDeleteInspectorRow = (id) => {
    if (inspectorRows.length > 1) {
      const newRows = inspectorRows.filter(row => row.id !== id);
      // آپدیت شماره ردیف‌ها
      const updatedRows = newRows.map((row, index) => ({
        ...row,
        rowNumber: index + 1
      }));
      setInspectorRows(updatedRows);
    }
  };

  // کپی سطر گزارش
  const handleCopyReportRow = (id) => {
    const reportToCopy = reports.find(report => report.id === id);
    if (reportToCopy) {
      const newId = Math.max(...reports.map(r => r.id)) + 1;
      setReports([
        ...reports,
        {
          ...reportToCopy,
          id: newId,
          reportNumber: ''
        }
      ]);
    }
  };

  // کپی سطر صورت وضعیت
  const handleCopyInspectorRow = (id) => {
    const rowToCopy = inspectorRows.find(row => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...inspectorRows.map(r => r.id)) + 1;
      setInspectorRows([
        ...inspectorRows,
        {
          ...rowToCopy,
          id: newId,
          rowNumber: inspectorRows.length + 1,
          inspectorName: rowToCopy.inspectorName + ' (کپی)'
        }
      ]);
    }
  };

  // تغییر مقدار سطر گزارش
  const handleReportChange = (id, field, value) => {
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, [field]: value }
        : report
    ));
    
    // پاک کردن خطا برای این فیلد
    if (errors[`${id}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}_${field}`];
      setErrors(newErrors);
    }
  };

  // تغییر مقدار سطر صورت وضعیت بازرس
  const handleInspectorChange = (id, field, value) => {
    setInspectorRows(inspectorRows.map(row => 
      row.id === id 
        ? { ...row, [field]: value }
        : row
    ));
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors = {};
    
    reports.forEach(report => {
      if (!report.reportNumber.trim()) {
        newErrors[`${report.id}_reportNumber`] = 'شماره گزارش الزامی است';
      }
      
      if (!report.status) {
        newErrors[`${report.id}_status`] = 'وضعیت الزامی است';
      }
      
      if (report.status === 'needs_correction' && !report.corrections.trim()) {
        newErrors[`${report.id}_corrections`] = 'شرح اصلاحات الزامی است';
      }
      
      if (!report.receivedDate) {
        newErrors[`${report.id}_receivedDate`] = 'تاریخ دریافت الزامی است';
      }
      
      if (report.approvedDays && isNaN(parseInt(report.approvedDays))) {
        newErrors[`${report.id}_approvedDays`] = 'تعداد روز باید عدد باشد';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setLocalError('لطفاً فیلدهای الزامی را پر کنید');
      return;
    }
    
    setLocalError('');
    
    // ارسال تمام گزارش‌ها
    reports.forEach((report, index) => {
      const persianDate = report.receivedDate ? report.receivedDate.format("YYYY/MM/DD") : "";
      
      const reportData = {
        rfi_numbering: rfiData?.RFI_Numbering || '',
        report_no: report.reportNumber.trim(),
        rev_no: "",
        IssueDate: persianDate,
        Doc_Status: report.status,
        Remark: report.corrections || "",
        App_manday_1stPrice: report.approvedDays ? parseInt(report.approvedDays) : 0,
        first_price: 80000000,
        UnitNo: report.unitNumber || "",
        VendorName: report.vendorName || rfiData?.VendorName || "",
        IRNNO: report.irn || "",
        SRNNo: report.srn || "",
        user: user?.username || "H-Bakhshpoor",
        reportrecivedDatee: persianDate,
        DateShamsi: persianDate,
        RFI_Number: rfiData?.RFI_Number || "",
        ProjectTitle: rfiData?.ProjectTitle || ""
      };

      console.log(`🎯 AddReportModal: Sending report ${index + 1}:`, reportData);

      // فراخوانی سرویس برای هر گزارش
      createReport(reportData, {
        onSuccess: (data) => {
          console.log(`✅ AddReportModal: Report ${index + 1} created successfully:`, data);
          
          // اگر آخرین گزارش بود، مدال رو ببند
          if (index === reports.length - 1) {
            setTimeout(() => {
              onClose();
              if (onAddReport) {
                onAddReport(reports);
              }
            }, 500);
          }
        },
        onError: (error) => {
          console.error(`❌ AddReportModal: Error creating report ${index + 1}:`, error);
          setLocalError(`خطا در ثبت گزارش ${index + 1}: ${error.message || 'خطای نامشخص'}`);
        }
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaFileAlt className="text-blue-500 text-lg" />
            <div>
              <h3 className="text-lg font-bold text-gray-800">ثبت گزارش جدید</h3>
              <p className="text-xs text-gray-500 mt-1">شماره RFI: {rfiData?.RFI_Number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            title="بستن"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* نمایش خطاها */}
          {localError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm flex items-start gap-2">
                <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                <span>{localError}</span>
              </p>
            </div>
          )}

          {/* خطاهای سرویس */}
          {error && !localError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm flex items-start gap-2">
                <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
                <span>خطا در ثبت گزارش: {error.message || 'خطای نامشخص'}</span>
              </p>
            </div>
          )}

          {/* بخش اطلاعات گزارش */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">اطلاعات گزارش</h4>
                <span className="text-xs text-gray-500 bg-indigo-100 px-2 py-1 rounded">
                  {reports.length} گزارش
                </span>
              </div>
              
              {/* دکمه افزودن گزارش جدید - رنگ آبی */}
              <button
                type="button"
                onClick={handleAddNewReportRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن گزارش جدید
              </button>
            </div>

            {/* Desktop Table (Medium به بالا) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-6 shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-700 to-purple-700">
                    <th className="p-3 text-center font-semibold text-white min-w-16">ردیف</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">شماره گزارش</th>
                    <th className="p-3 text-center font-semibold text-white min-w-28">وضعیت</th>
                    <th className="p-3 text-center font-semibold text-white min-w-28">تاریخ دریافت</th>
                    <th className="p-3 text-center font-semibold text-white min-w-32">روز تائید شده</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">نام وندور</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">شماره واحد</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">IRN</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">SRN</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr 
                      key={report.id} 
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-indigo-50'
                      } hover:bg-indigo-100`}
                    >
                      {/* ستون ردیف */}
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-bold shadow-sm">
                          {index + 1}
                        </span>
                      </td>
                      
                      {/* ستون شماره گزارش */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={report.reportNumber}
                            onChange={(e) => handleReportChange(report.id, 'reportNumber', e.target.value)}
                            className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              errors[`${report.id}_reportNumber`] ? 'border-red-300' : 'border-gray-300'
                            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            placeholder="******"
                            required
                            disabled={isLoading}
                          />
                          {errors[`${report.id}_reportNumber`] && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                              {errors[`${report.id}_reportNumber`]}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* ستون وضعیت */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <select
                            value={report.status}
                            onChange={(e) => handleReportChange(report.id, 'status', e.target.value)}
                            className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              errors[`${report.id}_status`] ? 'border-red-300' : 'border-gray-300'
                            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            required
                            disabled={isLoading}
                          >
                            <option value="">انتخاب</option>
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors[`${report.id}_status`] && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                              {errors[`${report.id}_status`]}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* ستون تاریخ دریافت */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <DatePicker
                            value={report.receivedDate}
                            onChange={(date) => handleReportChange(report.id, 'receivedDate', date)}
                            format="YYYY/MM/DD"
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            inputClass={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                              errors[`${report.id}_receivedDate`] ? 'border-red-300' : 'border-gray-300'
                            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            placeholder="تاریخ"
                            disabled={isLoading}
                          />
                          {errors[`${report.id}_receivedDate`] && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                              {errors[`${report.id}_receivedDate`]}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* ستون روز تائید شده */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="number"
                            value={report.approvedDays}
                            onChange={(e) => handleReportChange(report.id, 'approvedDays', e.target.value)}
                            className={`w-full px-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              errors[`${report.id}_approvedDays`] ? 'border-red-300' : 'border-gray-300'
                            } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                            placeholder="تعداد روز"
                            min="0"
                            disabled={isLoading}
                          />
                          {errors[`${report.id}_approvedDays`] && (
                            <p className="text-red-500 text-xs mt-1 text-center">
                              {errors[`${report.id}_approvedDays`]}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      {/* ستون نام وندور */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={report.vendorName}
                            onChange={(e) => handleReportChange(report.id, 'vendorName', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="نام وندور"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      
                      {/* ستون شماره واحد */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={report.unitNumber}
                            onChange={(e) => handleReportChange(report.id, 'unitNumber', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="شماره واحد"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      
                      {/* ستون IRN */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={report.irn}
                            onChange={(e) => handleReportChange(report.id, 'irn', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="IRN"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      
                      {/* ستون SRN */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={report.srn}
                            onChange={(e) => handleReportChange(report.id, 'srn', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="SRN"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      
                      {/* ستون عملیات */}
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyReportRow(report.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition duration-200 border border-blue-200 disabled:opacity-50"
                            title="کپی این سطر"
                            disabled={isLoading}
                          >
                            <FaCopy className="text-sm" />
                          </button>
                          {reports.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteReportRow(report.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200 border border-red-200 disabled:opacity-50"
                              title="حذف این سطر"
                              disabled={isLoading}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* فیلد اصلاحات برای سطرهایی که وضعیت "نیاز به اصلاحات" دارند */}
              {reports.map((report, index) => (
                report.status === 'needs_correction' && (
                  <div key={`corrections-${report.id}`} className="bg-amber-50 border-t border-amber-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaEdit className="text-amber-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        شرح اصلاحات برای گزارش ردیف {index + 1}
                      </span>
                    </div>
                    <textarea
                      value={report.corrections}
                      onChange={(e) => handleReportChange(report.id, 'corrections', e.target.value)}
                      rows="2"
                      className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none ${
                        errors[`${report.id}_corrections`] ? 'border-red-300' : 'border-gray-300'
                      } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                      placeholder="شرح کامل اصلاحات مورد نیاز را وارد کنید..."
                      disabled={isLoading}
                    />
                    {errors[`${report.id}_corrections`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`${report.id}_corrections`]}
                      </p>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Mobile View (همان فیلدهای قبلی برای موبایل) */}
            <div className="md:hidden space-y-6">
              {reports.map((report, index) => (
                <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">گزارش {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyReportRow(report.id)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition duration-200 disabled:opacity-50"
                        title="کپی این گزارش"
                        disabled={isLoading}
                      >
                        <FaCopy className="text-xs" />
                      </button>
                      {reports.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReportRow(report.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200 disabled:opacity-50"
                          title="حذف این گزارش"
                          disabled={isLoading}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* شماره گزارش */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaHashtag className="text-blue-500" />
                        شماره گزارش *
                      </label>
                      <input
                        type="text"
                        value={report.reportNumber}
                        onChange={(e) => handleReportChange(report.id, 'reportNumber', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[`${report.id}_reportNumber`] ? 'border-red-300' : 'border-gray-300'
                        } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        placeholder="******"
                        required
                        disabled={isLoading}
                      />
                      {errors[`${report.id}_reportNumber`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`${report.id}_reportNumber`]}
                        </p>
                      )}
                    </div>

                    {/* وضعیت */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        وضعیت *
                      </label>
                      <select
                        value={report.status}
                        onChange={(e) => handleReportChange(report.id, 'status', e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors[`${report.id}_status`] ? 'border-red-300' : 'border-gray-300'
                        } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        required
                        disabled={isLoading}
                      >
                        <option value="">انتخاب وضعیت</option>
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors[`${report.id}_status`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`${report.id}_status`]}
                        </p>
                      )}
                    </div>

                    {/* تاریخ دریافت */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FaCalendarAlt className="text-purple-500" />
                        تاریخ دریافت گزارش *
                      </label>
                      <DatePicker
                        value={report.receivedDate}
                        onChange={(date) => handleReportChange(report.id, 'receivedDate', date)}
                        format="YYYY/MM/DD"
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors[`${report.id}_receivedDate`] ? 'border-red-300' : 'border-gray-300'
                        } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                        placeholder="انتخاب تاریخ"
                        disabled={isLoading}
                      />
                      {errors[`${report.id}_receivedDate`] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[`${report.id}_receivedDate`]}
                        </p>
                      )}
                    </div>

                    {/* بقیه فیلدها... */}
                    {/* ... */}
                    
                  </div>
                </div>
              ))}
            </div>
            
            {/* دکمه افزودن جدید برای موبایل */}
            <div className="md:hidden mt-4">
              <button
                type="button"
                onClick={handleAddNewReportRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن گزارش جدید
              </button>
            </div>
          </div>

          {/* بخش صورت وضعیت بازرس */}
          <div className="mt-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">صورت وضعیت بازرس</h4>
                <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded">
                  {inspectorRows.length} مورد
                </span>
              </div>
              
              {/* دکمه افزودن صورت وضعیت جدید - رنگ سبز */}
              <button
                type="button"
                onClick={handleAddNewInspectorRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن صورت وضعیت
              </button>
            </div>

            {/* Desktop Table (Medium به بالا) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-6 shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-green-700 to-emerald-700">
                    <th className="p-3 text-center font-semibold text-white min-w-16">ردیف</th>
                    <th className="p-3 text-center font-semibold text-white min-w-28">تاریخ بازرسی</th>
                    <th className="p-3 text-center font-semibold text-white min-w-32">وضعیت تائید</th>
                    <th className="p-3 text-center font-semibold text-white min-w-36">نام بازرس</th>
                    <th className="p-3 text-center font-semibold text-white min-w-32">دستمزد</th>
                    <th className="p-3 text-center font-semibold text-white min-w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {inspectorRows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-green-50'
                      } hover:bg-green-100`}
                    >
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold shadow-sm">
                          {row.rowNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <DatePicker
                            value={row.inspectionDate}
                            onChange={(date) => handleInspectorChange(row.id, 'inspectionDate', date)}
                            format="YYYY/MM/DD"
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="تاریخ بازرسی"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <select
                            value={row.approvalStatus}
                            onChange={(e) => handleInspectorChange(row.id, 'approvalStatus', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            disabled={isLoading}
                          >
                            {inspectorStatusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={row.inspectorName}
                            onChange={(e) => handleInspectorChange(row.id, 'inspectorName', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="نام بازرس"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <input
                            type="text"
                            value={row.fee}
                            onChange={(e) => handleInspectorChange(row.id, 'fee', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white disabled:bg-gray-100"
                            placeholder="مبلغ به تومان"
                            disabled={isLoading}
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyInspectorRow(row.id)}
                            className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition duration-200 border border-emerald-200 disabled:opacity-50"
                            title="کپی این سطر"
                            disabled={isLoading}
                          >
                            <FaCopy className="text-sm" />
                          </button>
                          {inspectorRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteInspectorRow(row.id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition duration-200 border border-red-200 disabled:opacity-50"
                              title="حذف این سطر"
                              disabled={isLoading}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (برای صفحه‌های کوچک) */}
            <div className="md:hidden space-y-4">
              {inspectorRows.map((row) => (
                <div key={row.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold">
                        {row.rowNumber}
                      </span>
                      <span className="text-sm font-semibold text-gray-800">صورت وضعیت بازرس</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyInspectorRow(row.id)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition duration-200 disabled:opacity-50"
                        title="کپی این سطر"
                        disabled={isLoading}
                      >
                        <FaCopy className="text-xs" />
                      </button>
                      {inspectorRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteInspectorRow(row.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition duration-200 disabled:opacity-50"
                          title="حذف این سطر"
                          disabled={isLoading}
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        تاریخ بازرسی
                      </label>
                      <DatePicker
                        value={row.inspectionDate}
                        onChange={(date) => handleInspectorChange(row.id, 'inspectionDate', date)}
                        format="YYYY/MM/DD"
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        placeholder="تاریخ بازرسی"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        وضعیت تائید
                      </label>
                      <select
                        value={row.approvalStatus}
                        onChange={(e) => handleInspectorChange(row.id, 'approvalStatus', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        disabled={isLoading}
                      >
                        {inspectorStatusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        نام بازرس
                      </label>
                      <input
                        type="text"
                        value={row.inspectorName}
                        onChange={(e) => handleInspectorChange(row.id, 'inspectorName', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        placeholder="نام بازرس"
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        دستمزد
                      </label>
                      <input
                        type="text"
                        value={row.fee}
                        onChange={(e) => handleInspectorChange(row.id, 'fee', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white disabled:bg-gray-100"
                        placeholder="مبلغ به تومان"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* دکمه افزودن جدید برای موبایل */}
            <div className="md:hidden mt-4">
              <button
                type="button"
                onClick={handleAddNewInspectorRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن صورت وضعیت
              </button>
            </div>
          </div>

          {/* اطلاعات پروژه */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 mb-6 border border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <FaFileAlt className="text-gray-400" />
                <div>
                  <span className="font-semibold">پروژه: </span>
                  <span className="font-bold text-gray-700">{rfiData?.ProjectTitle}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaUser className="text-gray-400" />
                <div>
                  <span className="font-semibold">کاربر: </span>
                  <span className="font-bold text-blue-600">{user?.username || 'H-Bakhshpoor'}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;