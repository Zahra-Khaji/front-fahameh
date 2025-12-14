// src/components/ui/AddReportModal/AddReportModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaFileAlt, 
  FaPlusCircle, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaSync,
  FaCopy,
  FaTrash
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
// import DateObject from "react-date-object";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useReportInfo, useUpdateReport } from '../../../hooks/useCreateReport';
import { useUser } from '../../../hooks/useUser';
import { toast } from 'react-hot-toast';

const AddReportModal = ({ isOpen, onClose, rfiData, nextIRN = '' }) => {
  // استفاده از هوک‌ها
  const { data: reportInfo, isLoading: isReportLoading, error } = useReportInfo(rfiData?.RFI_Numbering);
  const { mutate: updateReport, isLoading: isUpdating } = useUpdateReport();
  
  const { user } = useUser();

  // تابع تبدیل تاریخ به شمسی
  const convertToPersianDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa
      });
    }
    
    try {
      // اگر از قبل DateObject باشد
      if (dateString instanceof DateObject) {
        return dateString;
      }
      
      // اگر رشته تاریخ داریم
      if (typeof dateString === 'string') {
        // بررسی فرمت های مختلف
        if (dateString.includes('/')) {
          // فرمت شمسی: 1403/10/15
          const [year, month, day] = dateString.split('/').map(Number);
          return new DateObject({
            year: year,
            month: month,
            day: day,
            calendar: persian,
            locale: persian_fa
          });
        } else if (dateString.includes('-')) {
          // فرمت میلادی: 2024-12-25
          const date = new Date(dateString);
          return new DateObject({
            date: date,
            calendar: persian,
            locale: persian_fa
          });
        }
      }
      
      // برای تاریخ‌های Date
      if (dateString instanceof Date) {
        return new DateObject({
          date: dateString,
          calendar: persian,
          locale: persian_fa
        });
      }
      
      // روش fallback
      const date = new Date(dateString);
      return new DateObject({
        date: date,
        calendar: persian,
        locale: persian_fa
      });
    } catch (err) {
      console.error('Error converting date:', err, 'dateString:', dateString);
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa
      });
    }
  };

  // تابع برای فرمت کردن تاریخ به فرمت مورد نیاز API
  const formatDateForAPI = (dateObj) => {
    if (!dateObj) return '';
    
    try {
      // اگر DateObject باشد
      if (dateObj instanceof DateObject) {
        return dateObj.format("YYYY/MM/DD");
      }
      
      // اگر رشته باشد
      if (typeof dateObj === 'string') {
        return dateObj;
      }
      
      // اگر Date باشد
      if (dateObj instanceof Date) {
        const date = new DateObject({
          date: dateObj,
          calendar: persian,
          locale: persian_fa
        });
        return date.format("YYYY/MM/DD");
      }
      
      return '';
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  // حالت‌های جدول گزارش
  const [reportRows, setReportRows] = useState([]);

  // وضعیت‌های ممکن - مطابق با مقادیر API
  const statusOptions = [
    { value: 'approved', label: 'تائید شده' },
    { value: 'Objection', label: 'نیاز به اصلاحات' }
  ];

  // ریست فرم وقتی مدال باز می‌شود
  useEffect(() => {
    if (isOpen) {
      if (reportInfo) {
        console.log('📥 Setting report info from API:', reportInfo);
        
        // اگر داده از API آمد
        setReportRows([{
          id: 1,
          reportNumber: reportInfo.reportNumber || '',
          revNumber: reportInfo.revNumber || '', // RevNO از API
          status: reportInfo.status || 'approved', // پیش‌فرض approved
          corrections: reportInfo.corrections || '',
          receivedDate: convertToPersianDate(reportInfo.receivedDate),
          approvedDays: reportInfo.approvedDays || '',
          unitNumber: reportInfo.unitNumber || '',
          vendorName: reportInfo.vendorName || rfiData?.VendorName || '',
          irn: reportInfo.irn || '', // از API گرفته شده
          srn: reportInfo.srn || '',
          firstPrice: reportInfo.firstPrice || '80000000',
          rfiNumbering: reportInfo.rfiNumbering || rfiData?.RFI_Numbering || ''
        }]);
      } else if (error && error.response?.status === 404) {
        console.log('📭 No existing report found, creating new one');
        
        // اگر گزارش وجود ندارد، فرم خالی ایجاد کن
        const todayPersianDate = convertToPersianDate(new Date());
        
        setReportRows([{
          id: 1,
          reportNumber: '',
          revNumber: '', // RevNO خالی
          status: 'approved', // پیش‌فرض approved
          corrections: '',
          receivedDate: todayPersianDate,
          approvedDays: '',
          unitNumber: '',
          vendorName: rfiData?.VendorName || '',
          irn: nextIRN || '', // برای گزارش جدید از nextIRN استفاده کن
          srn: '',
          firstPrice: '80000000',
          rfiNumbering: rfiData?.RFI_Numbering || ''
        }]);
      } else if (!isReportLoading && !error) {
        // حالت اولیه - هنوز لودینگ نیست و خطایی هم نیست
        const todayPersianDate = convertToPersianDate(new Date());
        
        setReportRows([{
          id: 1,
          reportNumber: '',
          revNumber: '', // RevNO خالی
          status: 'approved', // پیش‌فرض approved
          corrections: '',
          receivedDate: todayPersianDate,
          approvedDays: '',
          unitNumber: '',
          vendorName: rfiData?.VendorName || '',
          irn: nextIRN || '',
          srn: '',
          firstPrice: '80000000',
          rfiNumbering: rfiData?.RFI_Numbering || ''
        }]);
      }
    }
  }, [isOpen, rfiData, reportInfo, user, error, isReportLoading, nextIRN]);

  // ========== مدیریت ردیف‌های جدول ==========
  const handleAddNewRow = () => {
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    setReportRows([
      ...reportRows,
      {
        id: newId,
        reportNumber: '',
        revNumber: '', // RevNO خالی
        status: 'approved', // پیش‌فرض approved
        corrections: '',
        receivedDate: convertToPersianDate(new Date()),
        approvedDays: '',
        unitNumber: '',
        vendorName: rfiData?.VendorName || '',
        irn: nextIRN || '', // برای سطر جدید از nextIRN استفاده کن
        srn: '',
        firstPrice: '80000000',
        rfiNumbering: rfiData?.RFI_Numbering || ''
      }
    ]);
  };

  const handleDeleteRow = (id) => {
    if (reportRows.length > 1) {
      setReportRows(reportRows.filter(row => row.id !== id));
    }
  };

  const handleCopyRow = (id) => {
    const rowToCopy = reportRows.find(row => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...reportRows.map(r => r.id)) + 1;
      setReportRows([
        ...reportRows,
        {
          ...rowToCopy,
          id: newId,
          reportNumber: '',
          revNumber: rowToCopy.revNumber || '', // RevNO رو کپی کن
          irn: nextIRN || '' // برای کپی سطر از nextIRN استفاده کن
        }
      ]);
    }
  };

  const handleRowChange = (id, field, value) => {
    setReportRows(reportRows.map(row => 
      row.id === id 
        ? { ...row, [field]: value }
        : row
    ));
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (reportRows.length === 0) {
      toast.error('❌ حداقل یک ردیف گزارش باید وجود داشته باشد');
      return false;
    }

    for (const row of reportRows) {
      // **فقط شماره گزارش اجباری است**
      if (!row.reportNumber || !row.reportNumber.trim()) {
        toast.error('❌ شماره گزارش الزامی است');
        return false;
      }
      
      // وضعیت اختیاری - اگر خالی بود به عنوان approved در نظر بگیر
      if (!row.status) {
        // اگر وضعیت خالی است، به صورت پیش‌فرض approved بذار
        handleRowChange(row.id, 'status', 'approved');
      }
      
      // **اگر وضعیت "نیاز به اصلاحات" (Objection) باشد، شرح اصلاحات الزامی است**
      if (row.status === 'Objection' && (!row.corrections || !row.corrections.trim())) {
        toast.error('❌ برای وضعیت "نیاز به اصلاحات"، شرح نظرات الزامی است');
        return false;
      }
      
      // اعتبارسنجی عددی برای approvedDays
      if (row.approvedDays && row.approvedDays.trim() !== '') {
        const days = parseInt(row.approvedDays);
        if (isNaN(days) || days < 0) {
          toast.error('❌ تعداد روز تأیید باید عدد مثبت باشد');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // فیلتر ردیف‌های معتبر (فقط آنهایی که شماره گزارش دارند)
    const validRows = reportRows.filter(row => 
      row.reportNumber && row.reportNumber.trim() !== ''
    );

    if (validRows.length === 0) {
      toast.error('❌ هیچ گزارش معتبری برای ذخیره وجود ندارد');
      return;
    }

    console.log('🚀 Submitting report data for RFI:', rfiData?.RFI_Numbering);

    // فقط اولین ردیف معتبر را ارسال کن
    const rowToSubmit = validRows[0];
    
    // **فرمت تاریخ برای ارسال به API**
    const formattedReceivedDate = formatDateForAPI(rowToSubmit.receivedDate);
    
    // آماده‌سازی داده برای ارسال
    const reportData = {
      reportNumber: rowToSubmit.reportNumber.trim(),
      revNumber: rowToSubmit.revNumber || '', // RevNO - اختیاری
      status: rowToSubmit.status || 'approved', // اگر خالی بود approved بذار
      corrections: rowToSubmit.corrections || '',
      receivedDate: formattedReceivedDate, // تاریخ فرمت شده
      approvedDays: rowToSubmit.approvedDays || '',
      unitNumber: rowToSubmit.unitNumber || '',
      vendorName: rowToSubmit.vendorName || '',
      irn: rowToSubmit.irn || '',
      srn: rowToSubmit.srn || '',
      firstPrice: rowToSubmit.firstPrice || '80000000',
      rfiNumbering: rowToSubmit.rfiNumbering || rfiData?.RFI_Numbering
    };

    console.log('📋 Report data to submit:', reportData);

    updateReport(
      {
        reportData: reportData,
        rfiNumbering: rfiData?.RFI_Numbering || rowToSubmit.rfiNumbering
      },
      {
        onSuccess: (data) => {
          console.log('✅ Update successful:', data);
          toast.success('✅ گزارش با موفقیت ذخیره شد');
          onClose();
        },
        onError: (error) => {
          console.error('❌ Update failed:', error);
          const errorMessage = error.response?.data?.message || 
                              error.response?.data?.detail || 
                              error.message || 
                              'خطای ناشناخته';
          toast.error(`❌ خطا در ذخیره گزارش: ${errorMessage}`);
        }
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isLoading = isReportLoading || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-blue-500 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  مدیریت گزارش‌ها - شماره {rfiData?.RFI_Numbering || 'نامشخص'}
                </h3>
            
                {reportInfo?.irn && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <span className="font-bold">IRN گزارش موجود: {reportInfo.irn}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            title="بستن"
            disabled={isLoading}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* نمایش خطا */}
        {error && error.response?.status !== 404 && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              خطا در دریافت اطلاعات: {error.message}
            </p>
          </div>
        )}

        {/* نمایش در حال لود */}
        {isReportLoading && (
          <div className="p-8 text-center">
            <FaSync className="animate-spin text-blue-500 text-2xl mx-auto mb-4" />
            <p className="text-gray-600">در حال دریافت اطلاعات گزارش...</p>
          </div>
        )}

        {/* Form */}
        {!isReportLoading && (
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {/* Header با دکمه افزودن */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">لیست گزارش‌ها</h4>
                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                  {reportRows.length} مورد
                </span>
              </div>
              
              {/* دکمه افزودن سطر جدید */}
              <button
                type="button"
                onClick={handleAddNewRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن سطر جدید
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
            <div className="min-w-[1400px]">
            <table className="w-full text-xs">
          
            
            <thead>
  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
    <th className="p-3 text-right font-bold text-white text-xs min-w-[180px]">شماره گزارش *</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-[90px]">نوع گزارش</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-[130px]">وضعیت</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-[350px]">نظرات <span className="text-yellow-300 text-xs">*</span></th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-[120px]">تاریخ دریافت</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-[160px]">نام وندور</th>
    <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '8%' }}>تائید‌شده(روز)</th>
    <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '8%' }}>شماره واحد</th>
    <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '8%' }}>IRN</th>
    <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '8%' }}>SRN</th>
    <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '6%' }}>عملیات</th>
  </tr>
</thead>

<tbody>
  {reportRows.map((row, index) => (
    <tr 
      key={row.id} 
      className={`border-b border-gray-200 transition duration-150 ${
        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
      } hover:bg-blue-50`}
    >
      <td className="p-3 min-w-[180px]">
        <input
          type="text"
          value={row.reportNumber}
          onChange={(e) => handleRowChange(row.id, 'reportNumber', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="مثال: FAH-INS-APGT-0766"
          disabled={isLoading}
          required
        />
      </td>

      <td className="p-3 min-w-[90px]">
        <select
          value={row.revNumber || ''}
          onChange={(e) => handleRowChange(row.id, 'revNumber', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="">-</option>
          <option value="rev">Rev</option>
          <option value="multipart">Multipart</option>
        </select>
      </td>

      <td className="p-3 min-w-[130px]">
        <select
          value={row.status}
          onChange={(e) => {
            handleRowChange(row.id, 'status', e.target.value);
            if (e.target.value !== 'Objection') {
              handleRowChange(row.id, 'corrections', '');
            }
          }}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        >
          <option value="approved">تائید شده</option>
          <option value="Objection">نیاز به اصلاحات</option>
        </select>
      </td>

      <td className="p-3 min-w-[350px] align-middle">
  <textarea
    value={row.corrections}
    title={row.corrections}
    onChange={(e) => handleRowChange(row.id, 'corrections', e.target.value)}
    className={`w-full px-3 py-2 text-xs border-gray-300 focus:ring-blue-500 border rounded-md focus:ring-2 focus:border-transparent resize-y overflow-auto
      ${row.status === 'Objection' 
        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
        : 'border-gray-300 focus:ring-blue-500'
      }
      [&::-webkit-scrollbar]:w-2
      [&::-webkit-scrollbar-track]:bg-gray-100
      [&::-webkit-scrollbar-thumb]:bg-blue-300
      [&::-webkit-scrollbar-thumb]:rounded-full
      [&::-webkit-scrollbar-thumb:hover]:bg-blue-400`}
    placeholder={row.status === 'Objection' ? 'شرح نظرات الزامی است' : 'شرح نظرات (اختیاری)'}
    disabled={isLoading}
    required={row.status === 'Objection'}
    rows="2"
    style={{
      minHeight: '38px',
      maxHeight: '38px',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    }}
  />
</td>

      <td className="p-3 min-w-[120px]">
        <DatePicker
          value={row.receivedDate}
          onChange={(date) => handleRowChange(row.id, 'receivedDate', date)}
          calendar={persian}
          locale={persian_fa}
          format="YYYY/MM/DD"
          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
      </td>

      <td className="p-3 min-w-[160px]">
        <input
          type="text"
          value={row.vendorName}
          onChange={(e) => handleRowChange(row.id, 'vendorName', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="نام وندور"
          disabled={isLoading}
        />
      </td>

      <td className="p-3" style={{ width: '8%' }}>
        <input
          type="number"
          value={row.approvedDays}
          onChange={(e) => handleRowChange(row.id, 'approvedDays', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="تعداد روز"
          min="0"
          disabled={isLoading}
        />
      </td>

      <td className="p-3" style={{ width: '8%' }}>
        <input
          type="text"
          value={row.unitNumber}
          onChange={(e) => handleRowChange(row.id, 'unitNumber', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="شماره واحد"
          disabled={isLoading}
        />
      </td>

      <td className="p-3" style={{ width: '8%' }}>
        <input
          type="text"
          value={row.irn}
          onChange={(e) => handleRowChange(row.id, 'irn', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="IRN"
          disabled={isLoading}
          title={row.id === 1 && reportInfo?.irn ? "IRN از گزارش موجود" : "IRN جدید"}
        />
      </td>

      <td className="p-3" style={{ width: '8%' }}>
        <input
          type="text"
          value={row.srn}
          onChange={(e) => handleRowChange(row.id, 'srn', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="SRN"
          disabled={isLoading}
        />
      </td>

      <td className="p-3" style={{ width: '6%' }}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleCopyRow(row.id)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-100 transition duration-200"
            title="کپی کردن سطر"
            disabled={isLoading}
          >
            <FaCopy className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteRow(row.id)}
            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-100 transition duration-200"
            title="حذف سطر"
            disabled={reportRows.length === 1 || isLoading}
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
                        </table>
            </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 mb-6">
              {reportRows.map((row, index) => (
                <div key={row.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-blue-500" />
                      <span className="font-semibold">سطر #{index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyRow(row.id)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="کپی"
                        disabled={isLoading}
                      >
                        <FaCopy className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="حذف"
                        disabled={reportRows.length === 1 || isLoading}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">شماره گزارش *</span>
                        <input
                          type="text"
                          value={row.reportNumber}
                          onChange={(e) => handleRowChange(row.id, 'reportNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره گزارش"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">نوع گزارش (RevNO)</span>
                        <select
                          value={row.revNumber || ''}
                          onChange={(e) => handleRowChange(row.id, 'revNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        >
                          <option value="">-</option>
                          <option value="rev">Rev</option>
                          <option value="multipart">Multipart</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">وضعیت</span>
                        <select
                          value={row.status}
                          onChange={(e) => {
                            handleRowChange(row.id, 'status', e.target.value);
                            if (e.target.value !== 'Objection') {
                              handleRowChange(row.id, 'corrections', '');
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        >
                          <option value="approved">تائید شده</option>
                          <option value="Objection">نیاز به اصلاحات</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تاریخ دریافت</span>
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) => handleRowChange(row.id, 'receivedDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">شرح نظرات</span>
                      <input
                        type="text"
                        value={row.corrections}
                        onChange={(e) => handleRowChange(row.id, 'corrections', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-xs ${
                          row.status === 'Objection' 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder={row.status === 'Objection' ? 'شرح نظرات الزامی است' : 'شرح نظرات (اختیاری)'}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">نام وندور</span>
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) => handleRowChange(row.id, 'vendorName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام وندور"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تعداد روز</span>
                        <input
                          type="number"
                          value={row.approvedDays}
                          onChange={(e) => handleRowChange(row.id, 'approvedDays', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="تعداد روز"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">شماره واحد</span>
                        <input
                          type="text"
                          value={row.unitNumber}
                          onChange={(e) => handleRowChange(row.id, 'unitNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره واحد"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">IRN</span>
                        <input
                          type="text"
                          value={row.irn}
                          onChange={(e) => handleRowChange(row.id, 'irn', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="IRN"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">SRN</span>
                      <input
                        type="text"
                        value={row.srn}
                        onChange={(e) => handleRowChange(row.id, 'srn', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="SRN"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* دکمه اضافه کردن برای موبایل */}
              <button
                type="button"
                onClick={handleAddNewRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن سطر جدید
              </button>
            </div>

            {/* دکمه‌های ثبت و انصراف */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSync className="animate-spin text-lg" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-lg" />
                    ذخیره گزارش‌ها
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowRight className="text-lg transform rotate-180" />
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddReportModal;