// src/components/ui/AddReportModal/AddReportModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaFileAlt, 
  FaUser, 
  FaPlusCircle, 
  FaEdit, 
  FaExclamationCircle,
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import { useCreateReport } from '../../../hooks/useCreateReport';
import { useUser } from '../../../hooks/useUser';
import { toast } from 'react-hot-toast';

// Import Components
import ReportTable from './ReportTable';
import ReportMobileView from './ReportMobileView';
import InspectorTable from './InspectorTable';
import InspectorMobileView from './InspectorMobileView';

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
      inspectionDate: '1404/01/15',
      approvalStatus: 'تائید شده',
      inspectorName: 'مهدی صدری',
      fee: '11,000,000 تومان'
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const { mutate: createReport, isLoading } = useCreateReport();

  // وضعیت‌های ممکن
  const statusOptions = [
    { value: 'approved', label: 'تائید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'needs_correction', label: 'نیاز به اصلاحات' }
  ];

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
          inspectionDate: '1404/01/15',
          approvalStatus: 'تائید شده',
          inspectorName: 'مهدی صدری',
          fee: '11,000,000 تومان'
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
      setIsSubmitting(false);
    }
  }, [isOpen, rfiData]);

  // ========== گزارش‌ها ==========
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

  const handleDeleteReportRow = (id) => {
    if (reports.length > 1) {
      setReports(reports.filter(report => report.id !== id));
    }
  };

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

  const handleReportChange = (id, field, value) => {
    setReports(reports.map(report => 
      report.id === id 
        ? { ...report, [field]: value }
        : report
    ));
    
    if (errors[`${id}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${id}_${field}`];
      setErrors(newErrors);
    }
  };

  // ========== صورت وضعیت بازرس ==========
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

  const handleDeleteInspectorRow = (id) => {
    if (inspectorRows.length > 1) {
      const newRows = inspectorRows.filter(row => row.id !== id);
      const updatedRows = newRows.map((row, index) => ({
        ...row,
        rowNumber: index + 1
      }));
      setInspectorRows(updatedRows);
    }
  };

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
    setIsSubmitting(true);
    
    // فقط اولین گزارش رو ارسال کن
    const report = reports[0];
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
  
    createReport(reportData, {
      onSuccess: () => {
        toast.success('✅ گزارش با موفقیت ثبت شد');
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
          if (onAddReport) {
            onAddReport(reports);
          }
        }, 1500);
      },
      onError: (error) => {
        toast.error('❌ خطا در ثبت گزارش');
        setIsSubmitting(false);
      }
    });
  };

  const handleCancel = () => {
    if (!isLoading && !isSubmitting) {
      onClose();
    }
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
              <h3 className="text-lg font-bold text-gray-800">ثبت گزارش و صورت وضعیت</h3>
              {/* <p className="text-xs text-gray-500 mt-1">شماره RFI: {rfiData?.RFI_Number}</p> */}
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isSubmitting}
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
              
              {/* دکمه افزودن گزارش جدید */}
              <button
                type="button"
                onClick={handleAddNewReportRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isSubmitting}
              >
                <FaPlusCircle className="text-base" />
                افزودن گزارش جدید
              </button>
            </div>

            {/* Desktop Table */}
            <ReportTable
              reports={reports}
              errors={errors}
              isLoading={isLoading || isSubmitting}
              statusOptions={statusOptions}
              handleReportChange={handleReportChange}
              handleCopyReportRow={handleCopyReportRow}
              handleDeleteReportRow={handleDeleteReportRow}
            />

            {/* Mobile View */}
            <ReportMobileView
              reports={reports}
              errors={errors}
              isLoading={isLoading || isSubmitting}
              statusOptions={statusOptions}
              handleReportChange={handleReportChange}
              handleCopyReportRow={handleCopyReportRow}
              handleDeleteReportRow={handleDeleteReportRow}
              handleAddNewReportRow={handleAddNewReportRow}
            />
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
              
              {/* دکمه افزودن صورت وضعیت جدید */}
              <button
                type="button"
                onClick={handleAddNewInspectorRow}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isSubmitting}
              >
                <FaPlusCircle className="text-base" />
                افزودن صورت وضعیت
              </button>
            </div>

            {/* Desktop Table */}
            <InspectorTable
              inspectorRows={inspectorRows}
              isLoading={isLoading || isSubmitting}
              inspectorStatusOptions={inspectorStatusOptions}
              handleInspectorChange={handleInspectorChange}
              handleCopyInspectorRow={handleCopyInspectorRow}
              handleDeleteInspectorRow={handleDeleteInspectorRow}
            />

            {/* Mobile View */}
            <InspectorMobileView
              inspectorRows={inspectorRows}
              isLoading={isLoading || isSubmitting}
              inspectorStatusOptions={inspectorStatusOptions}
              handleInspectorChange={handleInspectorChange}
              handleCopyInspectorRow={handleCopyInspectorRow}
              handleDeleteInspectorRow={handleDeleteInspectorRow}
              handleAddNewInspectorRow={handleAddNewInspectorRow}
            />
          </div>

         

          {/* دکمه‌های ثبت و انصراف */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-lg" />
                  ثبت اطلاعات فرم
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading || isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaArrowRight className="text-lg transform rotate-180" />
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReportModal;