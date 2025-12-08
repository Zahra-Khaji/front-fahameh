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
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useReportInfo, useUpdateReport } from '../../../hooks/useCreateReport';
import { useUser } from '../../../hooks/useUser';
import { toast } from 'react-hot-toast';

const AddReportModal = ({ isOpen, onClose, rfiData,nextIRN = '' }) => {
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
      // اگر رشته تاریخ داریم
      if (typeof dateString === 'string') {
        // بررسی فرمت های مختلف
        if (dateString.includes('/')) {
          // فرمت شمسی: 1403/10/15
          const [year, month, day] = dateString.split('/').map(Number);
          const date = new DateObject({
            year: year,
            month: month,
            day: day,
            calendar: persian,
            locale: persian_fa
          });
          return date;
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

  // حالت‌های جدول گزارش
  const [reportRows, setReportRows] = useState([]);

  // وضعیت‌های ممکن - مطابق با مقادیر API
  const statusOptions = [
    { value: 'approved', label: 'تائید شده' },
    { value: 'Objection', label: 'نیاز به اصلاحات' } // تغییر از needs_correction به Objection
  ];

  // ریست فرم وقتی مدال باز می‌شود
  useEffect(() => {
    if (isOpen) {
      if (reportInfo) {
        console.log('📥 Setting report info from API:', reportInfo);
        const defaultIRN = reportInfo.irn || nextIRN || '';
        
        // اگر داده از API آمد
        setReportRows([{
          id: 1,
          reportNumber: reportInfo.reportNumber || '',
          revNumber: reportInfo.revNumber || '',
          // مهم: status از Doc_Status میاد
          status: reportInfo.status || '',
          // مهم: corrections از Remark میاد
          corrections: reportInfo.corrections || '',
          issueDate: convertToPersianDate(reportInfo.issueDate),
          receivedDate: convertToPersianDate(reportInfo.receivedDate),
          approvedDays: reportInfo.approvedDays || '',
          unitNumber: reportInfo.unitNumber || '',
          vendorName: reportInfo.vendorName || rfiData?.VendorName || '',
          irn: reportInfo.irn || '',
          srn: reportInfo.srn || '',
          firstPrice: reportInfo.firstPrice || '80000000',
          user: reportInfo.user || user?.username || '',
          dateShamsi: reportInfo.dateShamsi || '',
          rfiNumbering: reportInfo.rfiNumbering || rfiData?.RFI_Numbering || ''
        }]);
      } else if (error && error.response?.status === 404) {
        console.log('📭 No existing report found, creating new one');
        // اگر گزارش وجود ندارد، فرم خالی ایجاد کن
        const todayPersianDate = convertToPersianDate(new Date());
        
        setReportRows([{
          id: 1,
          reportNumber: '',
          revNumber: '',
          status: '',
          corrections: '',
          issueDate: todayPersianDate,
          receivedDate: todayPersianDate,
          approvedDays: '',
          unitNumber: '',
          vendorName: rfiData?.VendorName || '',
          irn: nextIRN,
          srn: '',
          firstPrice: '80000000',
          user: user?.username || '',
          dateShamsi: '',
          rfiNumbering: rfiData?.RFI_Numbering || ''
        }]);
      } else if (!isReportLoading && !error) {
        // حالت اولیه - هنوز لودینگ نیست و خطایی هم نیست
        const todayPersianDate = convertToPersianDate(new Date());
        
        setReportRows([{
          id: 1,
          reportNumber: '',
          revNumber: '',
          status: '',
          corrections: '',
          issueDate: todayPersianDate,
          receivedDate: todayPersianDate,
          approvedDays: '',
          unitNumber: '',
          vendorName: rfiData?.VendorName || '',
          irn: '',
          srn: '',
          firstPrice: '80000000',
          user: user?.username || '',
          dateShamsi: '',
          rfiNumbering: rfiData?.RFI_Numbering || ''
        }]);
      }
    }
  }, [isOpen, rfiData, reportInfo, user, error, isReportLoading,nextIRN]);

  // ========== مدیریت ردیف‌های جدول ==========
  const handleAddNewRow = () => {
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    setReportRows([
      ...reportRows,
      {
        id: newId,
        reportNumber: '',
        revNumber: '',
        status: '',
        corrections: '',
        issueDate: convertToPersianDate(new Date()),
        receivedDate: convertToPersianDate(new Date()),
        approvedDays: '',
        unitNumber: '',
        vendorName: rfiData?.VendorName || '',
        irn: nextIRN || '',
        srn: '',
        firstPrice: '80000000',
        user: user?.username || '',
        dateShamsi: '',
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
          reportNumber: '', // شماره گزارش جدید باید خالی باشد
          irn: nextIRN || rowToCopy.irn
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
      if (!row.reportNumber.trim()) {
        toast.error('❌ شماره گزارش الزامی است');
        return false;
      }
      
      if (!row.status) {
        toast.error('❌ وضعیت گزارش الزامی است');
        return false;
      }
      
      // مهم: اگر وضعیت "نیاز به اصلاحات" (Objection) باشد، شرح اصلاحات الزامی است
      if (row.status === 'Objection' && !row.corrections.trim()) {
        toast.error('❌ برای وضعیت "نیاز به اصلاحات"، شرح اصلاحات الزامی است');
        return false;
      }
      
      if (row.approvedDays && isNaN(parseInt(row.approvedDays))) {
        toast.error('❌ تعداد روز تأیید باید عدد باشد');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // فیلتر ردیف‌های خالی
    const validRows = reportRows.filter(row => 
      row.reportNumber.trim() !== '' || 
      row.vendorName.trim() !== ''
    );

    if (validRows.length === 0) {
      toast.error('❌ هیچ داده‌ای برای ذخیره وجود ندارد');
      return;
    }

    console.log('🚀 Submitting report data for RFI:', rfiData?.RFI_Numbering);
    console.log('📋 Report rows to submit:', validRows);

    // فقط اولین ردیف معتبر را ارسال کن
    const rowToSubmit = validRows[0];
    
    // آماده‌سازی داده برای ارسال
    const reportData = {
      reportNumber: rowToSubmit.reportNumber,
      revNumber: rowToSubmit.revNumber,
      status: rowToSubmit.status, // این Doc_Status می‌شود
      corrections: rowToSubmit.corrections, // این Remark می‌شود
      issueDate: rowToSubmit.issueDate,
      receivedDate: rowToSubmit.receivedDate,
      approvedDays: rowToSubmit.approvedDays,
      unitNumber: rowToSubmit.unitNumber,
      vendorName: rowToSubmit.vendorName,
      irn: rowToSubmit.irn,
      srn: rowToSubmit.srn,
      firstPrice: rowToSubmit.firstPrice,
      user: rowToSubmit.user,
      dateShamsi: rowToSubmit.dateShamsi,
      rfiNumbering: rowToSubmit.rfiNumbering || rfiData?.RFI_Numbering
    };

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
              <table className="w-full text-xs">
             
             
<thead>
  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
    {/* شماره گزارش - 12% (20% کوچکتر از 15%) */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-40" style={{ width: '12%' }}>شماره گزارش</th>
    
    {/* وضعیت - 12% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-36" style={{ width: '12%' }}>وضعیت *</th>
    
    {/* شرح اصلاحات - 24% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-72" style={{ width: '28%' }}>شرح اصلاحات *</th>
    
    {/* تاریخ دریافت - 10% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-28" style={{ width: '10%' }}>تاریخ دریافت</th>
    
    {/* نام وندور - 14% (20% بزرگتر از 12%) */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-40" style={{ width: '14%' }}>نام وندور</th>
    
    {/* تعداد روز - 8% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-24" style={{ width: '8%' }}>تائید‌شده(روز)</th>
    
    {/* شماره واحد - 8% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-24" style={{ width: '8%' }}>شماره واحد</th>
    
    {/* IRN - 10% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-28" style={{ width: '10%' }}>IRN</th>
    
    {/* SRN - 10% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-28" style={{ width: '10%' }}>SRN</th>
    
    {/* عملیات - 6% */}
    <th className="p-3 text-right font-bold text-white text-xs min-w-20" style={{ width: '6%' }}>عملیات</th>
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
      {/* شماره گزارش - 12% */}
      <td className="p-3" style={{ width: '12%' }}>
        <input
          type="text"
          value={row.reportNumber}
          onChange={(e) => handleRowChange(row.id, 'reportNumber', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="شماره گزارش"
          disabled={isLoading}
          required
        />
      </td>

      {/* وضعیت - 12% */}
      <td className="p-3" style={{ width: '12%' }}>
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
          required
        >
          <option value="">انتخاب وضعیت</option>
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>

      {/* شرح اصلاحات - 24% */}
      <td className="p-3" style={{ width: '28%' }}>
        <input
          type="text"
          value={row.corrections}
          title={row.corrections}

          onChange={(e) => handleRowChange(row.id, 'corrections', e.target.value)}
          className={`w-full px-3 py-2 text-xs border rounded-md focus:ring-2 focus:border-transparent ${
            row.status === 'Objection' 
              ? 'border-red-300 focus:ring-red-500 bg-red-50' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder={row.status === 'Objection' ? 'شرح اصلاحات الزامی است' : 'شرح اصلاحات'}
          disabled={isLoading}
          required={row.status === 'Objection'}
        />
        {/* {row.status === 'Objection' && !row.corrections.trim() && (
          <p className="text-red-500 text-xs mt-1">
            برای وضعیت "نیاز به اصلاحات"، این فیلد الزامی است
          </p>
        )} */}
      </td>

      {/* تاریخ دریافت - 10% */}
      <td className="p-3" style={{ width: '10%' }}>
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

      {/* نام وندور - 14% */}
      <td className="p-3" style={{ width: '14%' }}>
        <input
          type="text"
          value={row.vendorName}
          onChange={(e) => handleRowChange(row.id, 'vendorName', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="نام وندور"
          disabled={isLoading}
        />
      </td>

      {/* تعداد روز - 8% */}
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

      {/* شماره واحد - 8% */}
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

      {/* IRN - 10% */}
      <td className="p-3" style={{ width: '10%' }}>
        <input
          type="text"
          value={row.irn}
          onChange={(e) => handleRowChange(row.id, 'irn', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="IRN"
          disabled={isLoading}
        />
      </td>

      {/* SRN - 10% */}
      <td className="p-3" style={{ width: '10%' }}>
        <input
          type="text"
          value={row.srn}
          onChange={(e) => handleRowChange(row.id, 'srn', e.target.value)}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="SRN"
          disabled={isLoading}
        />
      </td>

      {/* عملیات - 6% */}
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

            {/* Mobile View - به دلیل طولانی بودن کد، بخش موبایل رو حذف کردم */}
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