// src/components/ui/AddReportModal/AddReportModal.jsx
// فقط تغییرات مورد نیاز:

import React, { useState, useEffect, useRef, useMemo } from "react"; // useMemo رو اضافه کردیم
import {
  FaTimes,
  FaFileAlt,
  FaPlusCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaSync,
  FaCopy,
  FaTrash,
  FaExclamationCircle,
  FaQuestionCircle,
  FaCheck,
  FaBan,
} from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  useReportInfo,
  useUpdateReport,
  useCreateNewReport,
} from "../../../hooks/useCreateReport";
import { useUser } from "../../../hooks/useUser";
import { toast } from "react-hot-toast";

// ایمپورت helper جدید
import {
  getReportStatusInPersian,
  transformReportStatuses,
  getEnglishStatus,
} from "../../../utils/helpers";

// ایمپورت هوک جدید برای وضعیت‌ها
import {
  useReportStatuses,
  useDeleteReport,useSuggestedReportNo
} from "../../../hooks/useCreateReport";
// ایمپورت پاپ‌آپ جدید
import DeleteConfirmationPopover from "./DeleteConfirmationPopover";


// پاپ‌آپ تأیید مینیمال
const ConfirmationPopover = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  confirmText = "بله",
  cancelText = "انصراف",
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: <FaExclamationCircle className="text-yellow-500 text-xl" />,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      confirmBtn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <FaQuestionCircle className="text-blue-500 text-xl" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      confirmBtn: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Popover */}
      <div
        className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{styles.icon}</div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1"
            >
              <FaBan className="text-xs" />
              {cancelText}
            </button>

            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition duration-200 flex items-center gap-1 ${styles.confirmBtn}`}
            >
              <FaCheck className="text-xs" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddReportModal = ({ isOpen, onClose, rfiData, nextIRN = "" }) => {
  // استفاده از هوک‌ها
  // const { data: reportInfo, isLoading: isReportLoading, error } = useReportInfo(rfiData?.RFI_Numbering);
  const {
    data: reportInfo,
    isLoading: isReportLoading,
    error,
  } = useReportInfo(
    rfiData?.RFI_Numbering,
    rfiData?.Report_No // اضافه کردن شماره گزارش به عنوان پارامتر دوم
  );
  const { mutate: updateReport, isLoading: isUpdating } = useUpdateReport();
  const { mutate: createReport, isLoading: isCreating } = useCreateNewReport();

  // هوک جدید برای دریافت وضعیت‌ها از API
  const { data: statusesData, isLoading: statusesLoading } =
    useReportStatuses();
  // اضافه کردن هوک حذف
  const { mutate: deleteReport, isLoading: isDeleting } = useDeleteReport();

  const { user } = useUser();

  // حالت‌های پاپ‌آپ
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    // متغیرهای جدید
    const [showNewReportDialog, setShowNewReportDialog] = useState(false);
    const [newReportAction, setNewReportAction] = useState(null); // 'add' یا 'copy'
    const [selectedRowToCopy, setSelectedRowToCopy] = useState(null);
    
    // هوک برای دریافت شماره گزارش پیشنهادی
    const [suggestParams, setSuggestParams] = useState({
      rfiNumbering: '',
      reportNo: '',
      revNo: ''
    });
    
    const { data: suggestedReportNo, isLoading: isSuggesting, refetch: fetchSuggestedReport } = useSuggestedReportNo(
      suggestParams.rfiNumbering,
      suggestParams.reportNo,
      suggestParams.revNo,
      false // ابتدا غیرفعال
    );


  // در AddReportModal.jsx - تابع را اصلاح کنید:
const fetchNewReportNumber = async (action, rowToCopy = null) => {
  // console.log('🟢 fetchNewReportNumber شروع شد - action:', action);
  
  if (!rfiData?.RFI_Numbering) {
    console.error('❌ rfiData یا RFI_Numbering موجود نیست');
    toast.error('❌ شماره RFI نامشخص است');
    return;
  }
  
  // تعیین پارامترها
  let reportNo = '';
  let revNo = 'rev';
  
  if (action === 'copy' && rowToCopy) {
    reportNo = rowToCopy.reportNumber || '';
    revNo = rowToCopy.revNumber || 'rev';
    setSelectedRowToCopy(rowToCopy);
  } else if (action === 'add') {
    if (reportRows.length > 0) {
      const lastRow = reportRows[reportRows.length - 1];
      reportNo = lastRow.reportNumber || '';
      revNo = lastRow.revNumber || 'rev';
    } else {

      handleAddNewRowBasic();
      return;
    }
  }
  

  
  // اعتبارسنجی نهایی
  if (!reportNo || reportNo.trim() === '') {
    console.error('⚠️ reportNo خالی است - نمی‌توان API را فراخوانی کرد');
    toast.error('❌ ابتدا یک شماره گزارش موجود را پر کنید');
    return;
  }
  
  // تنظیم پارامترها
  setSuggestParams({
    rfiNumbering: rfiData.RFI_Numbering,
    reportNo: reportNo,
    revNo: revNo
  });
  
  setNewReportAction(action);
  setShowNewReportDialog(true);
  
 
  setTimeout(() => {
 
    fetchSuggestedReport().then(result => {
     
    }).catch(error => {

    });
  }, 100);
};

// تابع جایگزین برای افزودن سطر بدون API
const handleAddNewRowBasic = () => {
  const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
  
  setReportRows([
    ...reportRows,
    {
      id: newId,
      reportNumber: '',
      revNumber: '',
      status: "5",
      statusEnglish: "approved",
      corrections: "",
      receivedDate: convertToPersianDate(new Date()),
      approvedDays: "",
      unitNumber: "",
      vendorName: rfiData?.VendorName || "",
      irn: nextIRN || "",
      srn: "",
      firstPrice: "80000000",
      rfiNumbering: rfiData?.RFI_Numbering || "",
      issueDate: new Date().toISOString().split("T")[0],
    },
  ]);
  
  toast.info('📝 یک سطر جدید اضافه شد');
};
    
// تابع کمکی: ایجاد سطر گزارش اولیه
const createInitialReportRow = () => {
  const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
  
  const newRow = {
    id: newId,
    reportNumber: '', // خالی می‌ماند تا کاربر پر کند
    revNumber: '',
    status: "5",
    statusEnglish: "approved",
    corrections: "",
    receivedDate: convertToPersianDate(new Date()),
    approvedDays: "",
    unitNumber: "",
    vendorName: rfiData?.VendorName || "",
    irn: nextIRN || "",
    srn: "",
    firstPrice: "80000000",
    rfiNumbering: rfiData?.RFI_Numbering || "",
    issueDate: new Date().toISOString().split("T")[0],
  };
  
  setReportRows([...reportRows, newRow]);
  toast.info('📝 یک سطر خالی اضافه شد. لطفاً شماره گزارش را وارد کنید');
};

  // وقتی شماره پیشنهادی دریافت شد
  useEffect(() => {
    if (suggestedReportNo && showNewReportDialog) {
      // ایجاد سطر جدید با شماره پیشنهادی
      createNewRowWithSuggestedNumber();
    }
  }, [suggestedReportNo]);

  // تابع ایجاد سطر جدید با شماره پیشنهادی
  const createNewRowWithSuggestedNumber = () => {
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    
    // داده‌های پایه
    let newRow = {
      id: newId,
      reportNumber: suggestedReportNo || '',
      revNumber: '',
      status: "5",
      statusEnglish: "approved",
      corrections: "",
      receivedDate: convertToPersianDate(new Date()),
      approvedDays: "", // جدید: خالی باشد
      unitNumber: "",
      vendorName: rfiData?.VendorName || "",
      irn: nextIRN || "",
      srn: "",
      firstPrice: "80000000",
      rfiNumbering: rfiData?.RFI_Numbering || "",
      issueDate: new Date().toISOString().split("T")[0],
    };
    
    // اگر کپی کردن است، داده‌های سطر اصلی را کپی کن (به جز approvedDays)
    if (newReportAction === 'copy' && selectedRowToCopy) {
      newRow = {
        ...newRow,
        revNumber: selectedRowToCopy.revNumber || '',
        status: selectedRowToCopy.status || "5",
        statusEnglish: selectedRowToCopy.statusEnglish || "approved",
        corrections: selectedRowToCopy.corrections || "",
        receivedDate: selectedRowToCopy.receivedDate || convertToPersianDate(new Date()),
        unitNumber: selectedRowToCopy.unitNumber || "",
        vendorName: selectedRowToCopy.vendorName || rfiData?.VendorName || "",
        irn: nextIRN || selectedRowToCopy.irn || "",
        srn: selectedRowToCopy.srn || "",
        firstPrice: selectedRowToCopy.firstPrice || "80000000",
        // approvedDays عمداً خالی می‌ماند
      };
    }
    
    // **مهم: تمام سطرهای قبلی را آپدیت کن - ستون approvedDays را صفر کن**
    const updatedPreviousRows = reportRows.map(row => ({
      ...row,
      approvedDays: "" // یا 0 اگر عددی باشد
    }));
    
    // افزودن سطر جدید
    setReportRows([...updatedPreviousRows, newRow]);
    
    // بستن دیالوگ
    setShowNewReportDialog(false);
    setSelectedRowToCopy(null);
    setNewReportAction(null);
  };


  // حالت برای پاپ‌آپ حذف
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedReportForDelete, setSelectedReportForDelete] = useState(null);

  // ردِ تغییرات
  const initialDataRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);

  // تبدیل داده‌های API به options برای select
  const statusOptions = useMemo(() => {
    return transformReportStatuses(statusesData);
  }, [statusesData]);

  // تابع تبدیل تاریخ به شمسی
  const convertToPersianDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa,
      });
    }

    try {
      // اگر از قبل DateObject باشد
      if (dateString instanceof DateObject) {
        return dateString;
      }

      // اگر رشته تاریخ داریم
      if (typeof dateString === "string") {
        // بررسی فرمت های مختلف
        if (dateString.includes("/")) {
          // فرمت شمسی: 1403/10/15
          const [year, month, day] = dateString.split("/").map(Number);
          return new DateObject({
            year: year,
            month: month,
            day: day,
            calendar: persian,
            locale: persian_fa,
          });
        } else if (dateString.includes("-")) {
          // فرمت میلادی: 2024-12-25
          const date = new Date(dateString);
          return new DateObject({
            date: date,
            calendar: persian,
            locale: persian_fa,
          });
        }
      }

      // برای تاریخ‌های Date
      if (dateString instanceof Date) {
        return new DateObject({
          date: dateString,
          calendar: persian,
          locale: persian_fa,
        });
      }

      // روش fallback
      const date = new Date(dateString);
      return new DateObject({
        date: date,
        calendar: persian,
        locale: persian_fa,
      });
    } catch (err) {
      console.error("Error converting date:", err, "dateString:", dateString);
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa,
      });
    }
  };

  // تابع برای فرمت کردن تاریخ به فرمت مورد نیاز API
  const formatDateForAPI = (dateObj) => {
    if (!dateObj) return "";

    try {
      // اگر DateObject باشد
      if (dateObj instanceof DateObject) {
        return dateObj.format("YYYY/MM/DD");
      }

      // اگر رشته باشد
      if (typeof dateObj === "string") {
        return dateObj;
      }

      // اگر Date باشد
      if (dateObj instanceof Date) {
        const date = new DateObject({
          date: dateObj,
          calendar: persian,
          locale: persian_fa,
        });
        return date.format("YYYY/MM/DD");
      }

      return "";
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  };

  // حالت‌های جدول گزارش
  const [reportRows, setReportRows] = useState([]);

  // وضعیت‌های ممکن - حالا از API می‌گیریم
  // const statusOptions = [
  //   { value: 'approved', label: 'تائید شده' },
  //   { value: 'Objection', label: 'نیاز به اصلاحات' }
  // ]; // این خط رو حذف کردیم

  // تابع مقایسه دو مقدار
  // جایگزین تابع areValuesEqual
  const areValuesEqual = (val1, val2) => {
    // هر دو undefined یا null
    if (val1 == null && val2 == null) return true;

    // یکی undefined/null و دیگری نه
    if (val1 == null || val2 == null) return false;

    // تبدیل هر دو به string برای مقایسه
    const str1 = convertToString(val1);
    const str2 = convertToString(val2);

    return str1 === str2;
  };

  // تابع کمکی برای تبدیل به string
  const convertToString = (value) => {
    if (value == null) return "";

    // اگر DateObject بود
    if (value instanceof DateObject) {
      return value.format("YYYY/MM/DD");
    }

    // اگر رشته تاریخ شمسی با فرمت متفاوت است
    if (typeof value === "string" && value.includes("/")) {
      // نرمال‌سازی فرمت تاریخ
      const parts = value.split("/");
      if (parts.length === 3) {
        return parts.map((p) => p.padStart(2, "0")).join("/");
      }
    }

    // برای اعداد و رشته‌ها
    return String(value).trim();
  };

  // خطوط 267-297
  const checkForChanges = () => {
    if (!initialDataRef.current) return false;

    const initial = initialDataRef.current;
    const current = {
      reportRows: reportRows.map((row) => ({
        ...row,
        receivedDate: row.receivedDate?.format?.() || row.receivedDate,
      })),
    };

    // مقایسه تعداد ردیف‌ها
    if (initial.reportRows.length !== current.reportRows.length) {
      return true;
    }

    // مقایسه محتوای ردیف‌ها
    for (let i = 0; i < initial.reportRows.length; i++) {
      const initialRow = initial.reportRows[i];
      const currentRow = current.reportRows[i];

      const fields = [
        "reportNumber",
        "revNumber",
        "status",
        "corrections",
        "receivedDate",
        "approvedDays",
        "unitNumber",
        "vendorName",
        "irn",
        "srn",
        "firstPrice",
        "rfiNumbering",
      ];

      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) {
          return true;
        }
      }
    }

    return false;
  };

  // در AddReportModal.jsx - اصلاح منطق useEffect:
  useEffect(() => {
    if (isOpen) {
      // اولویت‌بندی: اول از reportInfo استفاده کن، اگر نبود از rfiData
      const reportSource = reportInfo || rfiData;

      // بررسی وضعیت گزارش موجود
      const hasValidReport =
        reportSource?.Report_No &&
        reportSource.Report_No.trim() !== "" &&
        reportSource.Report_No !== "************";

      const todayPersianDate = convertToPersianDate(new Date());

      // اگر گزارش معتبر داریم
      if (hasValidReport) {
        const englishStatus = reportSource.Doc_Status || "Acc"; // پیش‌فرض: Acc
        // console.log('🎯 English status from API:', englishStatus);

        // مقدار پیش‌فرض
        let initialStatusValue = "Acc";

        // اگر statusesData موجود باشد
        if (statusesData && Object.values(statusesData).length > 0) {
          // console.log('📊 Available statuses from API:', Object.values(statusesData));

          // جستجوی دقیق برای پیدا کردن status
          // 1. اول جستجوی دقیق
          const exactMatch = Object.values(statusesData).find(
            (status) => status === englishStatus
          );

          if (exactMatch) {
            initialStatusValue = exactMatch;
            // console.log('✅ Found exact match:', exactMatch);
          }
          // 2. اگر پیدا نشد، جستجوی case-insensitive
          else {
            const caseInsensitiveMatch = Object.values(statusesData).find(
              (status) => status.toLowerCase() === englishStatus.toLowerCase()
            );

            if (caseInsensitiveMatch) {
              initialStatusValue = caseInsensitiveMatch;
              // console.log('✅ Found case-insensitive match:', caseInsensitiveMatch);
            }
            // 3. اگر هنوز پیدا نشد، partial match
            else {
              const partialMatch = Object.values(statusesData).find(
                (status) =>
                  status.toLowerCase().includes(englishStatus.toLowerCase()) ||
                  englishStatus.toLowerCase().includes(status.toLowerCase())
              );

              if (partialMatch) {
                initialStatusValue = partialMatch;
                // console.log('✅ Found partial match:', partialMatch);
              } else {
                // 4. اگر هیچ matchی پیدا نشد، از اولین گزینه استفاده کن
                initialStatusValue = Object.values(statusesData)[0];
                // console.log('⚠️ No match found, using first option:', initialStatusValue);
              }
            }
          }
        }

        // console.log('✅ Final initial status value:', initialStatusValue);

        const initialRow = {
          id: 1,
          reportNumber: reportSource.Report_No || "",
          revNumber: reportSource.RevNO || "",
          status: initialStatusValue, // استفاده از متن انگلیسی به عنوان value
          statusEnglish: initialStatusValue,
          corrections: reportSource.Remark || "",
          receivedDate: convertToPersianDate(
            reportSource.ReportReceivedDate || reportSource.IssueDate
          ),
          approvedDays: reportSource.App_manday_1stPrice || "",
          unitNumber: reportSource.UnitNo || "",
          vendorName: reportSource.VendorName || "",
          irn: reportSource.IRNNO || nextIRN || "",
          srn: reportSource.SRNNo || "",
          firstPrice: reportSource.first_price || "80000000",
          rfiNumbering: reportSource.RFI_Numbering || "",
          issueDate:
            reportSource.IssueDate || new Date().toISOString().split("T")[0],
        };

        // console.log('📝 Initial row created:', initialRow);
        setReportRows([initialRow]);

        // ذخیره داده اولیه
        initialDataRef.current = {
          reportRows: [
            {
              reportNumber: initialRow.reportNumber || "",
              revNumber: initialRow.revNumber || "",
              status: initialRow.status || "Acc",
              statusEnglish: initialRow.statusEnglish || "Acc",
              corrections: initialRow.corrections || "",
              receivedDate: convertToString(initialRow.receivedDate),
              approvedDays: convertToString(initialRow.approvedDays),
              unitNumber: initialRow.unitNumber || "",
              vendorName: initialRow.vendorName || "",
              irn: initialRow.irn || "",
              srn: initialRow.srn || "",
              firstPrice: convertToString(initialRow.firstPrice),
              rfiNumbering: initialRow.rfiNumbering || "",
            },
          ],
        };

        // console.log('💾 Initial data saved to ref');
      } else {
        // اگر گزارش معتبر نداریم
        // console.log('📝 Creating new report form (no existing report)');

        const defaultStatus =
          statusesData && Object.values(statusesData).length > 0
            ? Object.values(statusesData)[0]
            : "Acc";

        const newRow = {
          id: 1,
          reportNumber: "",
          revNumber: "",
          status: defaultStatus, // پیش‌فرض: اولین گزینه از statusesData یا 'Acc'
          statusEnglish: defaultStatus,
          corrections: "",
          receivedDate: todayPersianDate,
          approvedDays: "",
          unitNumber: "",
          vendorName: rfiData?.VendorName || "",
          irn: nextIRN || "",
          srn: "",
          firstPrice: "80000000",
          rfiNumbering: rfiData?.RFI_Numbering || "",
          issueDate: new Date().toISOString().split("T")[0],
        };

        // console.log('📝 New row created:', newRow);
        setReportRows([newRow]);

        initialDataRef.current = {
          reportRows: [
            {
              reportNumber: newRow.reportNumber || "",
              revNumber: newRow.revNumber || "",
              status: newRow.status || "Acc",
              statusEnglish: newRow.statusEnglish || "Acc",
              corrections: newRow.corrections || "",
              receivedDate: convertToString(newRow.receivedDate),
              approvedDays: convertToString(newRow.approvedDays),
              unitNumber: newRow.unitNumber || "",
              vendorName: newRow.vendorName || "",
              irn: newRow.irn || "",
              srn: newRow.srn || "",
              firstPrice: convertToString(newRow.firstPrice),
              rfiNumbering: newRow.rfiNumbering || "",
            },
          ],
        };
      }

      setHasChanges(false);
      // console.log('✅ Modal initialization completed');
    }
  }, [isOpen, rfiData, reportInfo, nextIRN, statusesData]);

  // بررسی تغییرات هنگام تغییر داده‌ها
  useEffect(() => {
    if (initialDataRef.current) {
      const changed = checkForChanges();
      setHasChanges(changed);
    }
  }, [reportRows]);

  // ========== مدیریت ردیف‌های جدول ==========
  // const handleAddNewRow = () => {
  //   const newId =
  //     reportRows.length > 0 ? Math.max(...reportRows.map((r) => r.id)) + 1 : 1;
  //   setReportRows([
  //     ...reportRows,
  //     {
  //       id: newId,
  //       reportNumber: "",
  //       revNumber: "",
  //       status: "5",
  //       statusEnglish: "approved",
  //       corrections: "",
  //       receivedDate: convertToPersianDate(new Date()),
  //       approvedDays: "",
  //       unitNumber: "",
  //       vendorName: rfiData?.VendorName || "",
  //       irn: nextIRN || "",
  //       srn: "",
  //       firstPrice: "80000000",
  //       rfiNumbering: rfiData?.RFI_Numbering || "",
  //       issueDate: new Date().toISOString().split("T")[0],
  //     },
  //   ]);
  // };
   const handleAddNewRow = () => {
    fetchNewReportNumber('add');
  };

  const handleDeleteRow = (id) => {
    const rowToDelete = reportRows.find((row) => row.id === id);

    // بررسی اینکه آیا این گزارش از قبل در سرور ذخیره شده یا نه
    const hasExistingReport =
      reportInfo &&
      reportInfo.Report_No &&
      reportInfo.Report_No.trim() !== "" &&
      reportInfo.Report_No !== "************";

    if (hasExistingReport) {
      // console.log("📊 Existing report found in server - show delete confirmation");

      // نمایش پاپ‌آپ تأیید حذف از سرور
      setSelectedReportForDelete({
        reportNumber: reportInfo.Report_No,
        rfiNumbering: reportInfo.RFI_Numbering || rfiData?.RFI_Numbering,
        rowId: id,
      });
      setShowDeleteConfirm(true);
    }
    // اگر گزارش جدید است (هنوز در سرور ذخیره نشده)
    else {
      // console.log("📝 New report (not saved in server) - delete row immediately");

      // حذف ردیف از لیست (حتی اگر فقط یک ردیف باشد)
      setReportRows(reportRows.filter((row) => row.id !== id));

      // اگر تمام ردیف‌ها حذف شدند، یک ردیف جدید خالی اضافه کن
      if (reportRows.length === 1) {
        // یعنی این ردیف تنها ردیف است
        // console.log("📝 Last row deleted - closing modal");
        // کمی تأخیر برای مشاهده اثر حذف
        setTimeout(() => {
          onClose(); // مدال را ببند
        }, 100);
      }
    }
  };

  // تابع handleConfirmDelete
  const handleConfirmDelete = () => {
    if (!selectedReportForDelete) return;

    // console.log("🗑️ Deleting report from server:", selectedReportForDelete);

    deleteReport(selectedReportForDelete.reportNumber, {
      onSuccess: () => {
        // console.log("✅ Report deleted from server successfully");

        // بستن مدال بلافاصله بعد از حذف موفق
        setTimeout(() => {
          onClose();
        }, 300); // کمی تأخیر برای نمایش پیام موفقیت

        setSelectedReportForDelete(null);
        setShowDeleteConfirm(false);
      },
      onError: (error) => {
        console.error("❌ Failed to delete report:", error);
        setSelectedReportForDelete(null);
        setShowDeleteConfirm(false);
      },
    });
  };

  const handleCopyRow = (id) => {
    const rowToCopy = reportRows.find(row => row.id === id);
    if (rowToCopy) {
      fetchNewReportNumber('copy', rowToCopy);
    }
  };

  const handleRowChange = (id, field, value) => {
    setReportRows(
      reportRows.map((row) => {
        if (row.id === id) {
          // اگر فیلد status باشد
          if (field === "status") {
            // پیدا کردن متن انگلیسی متناظر
            const selectedOption = statusOptions.find(
              (opt) => opt.value === value
            );
            const englishStatus = selectedOption?.textValue || value;

            return {
              ...row,
              [field]: value,
              statusEnglish: englishStatus,
              // اگر وضعیت Objection نیست، corrections را پاک کن
              ...(englishStatus !== "Objection" && { corrections: "" }),
            };
          }

          // اگر فیلد approvedDays باشد، مطمئن شو مقدار درست باشد
          if (field === "approvedDays") {
            // اگر خالی بود، رشته خالی
            if (value === "" || value === null || value === undefined) {
              return { ...row, [field]: "" };
            }
            // اگر عدد معتبر بود، به عدد تبدیل کن
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue >= 0) {
              return { ...row, [field]: numValue };
            }
            // اگر عدد معتبر نبود، مقدار قبلی را نگه دار
            return row;
          }
          // برای سایر فیلدها
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (reportRows.length === 0) {
      toast.error("❌ حداقل یک ردیف گزارش باید وجود داشته باشد");
      return false;
    }

    for (const row of reportRows) {
      // **فقط شماره گزارش اجباری است**
      if (!row.reportNumber || !row.reportNumber.trim()) {
        toast.error("❌ شماره گزارش الزامی است");
        return false;
      }

      // وضعیت اختیاری - اگر خالی بود به عنوان approved در نظر بگیر
      if (!row.status) {
        handleRowChange(row.id, "status", "5");
      }

      // **اگر وضعیت "Objection" باشد، شرح اصلاحات الزامی است**
      if (
        row.statusEnglish === "Objection" &&
        (!row.corrections || !row.corrections.trim())
      ) {
        toast.error('❌ برای وضعیت "نیاز به اصلاحات"، شرح نظرات الزامی است');
        return false;
      }

      // اعتبارسنجی عددی برای approvedDays - اصلاح شده
      if (row.approvedDays !== "" && row.approvedDays != null) {
        // اگر رشته بود trim کن، اگر عدد بود مستقیم استفاده کن
        const daysValue =
          typeof row.approvedDays === "string"
            ? row.approvedDays.trim()
            : row.approvedDays.toString();

        if (daysValue !== "") {
          const days = parseInt(daysValue, 10);
          if (isNaN(days) || days < 0) {
            toast.error("❌ تعداد روز تأیید باید عدد مثبت باشد");
            return false;
          }
        }
      }
    }

    return true;
  };

  // هندلر اصلی ذخیره
  // در AddReportModal.jsx - تابع handleSubmitInternal:
  const handleSubmitInternal = () => {
    if (!validateForm()) {
      return;
    }

    const validRows = reportRows.filter(
      (row) => row.reportNumber && row.reportNumber.trim() !== ""
    );

    if (validRows.length === 0) {
      toast.error("❌ هیچ گزارش معتبری برای ذخیره وجود ندارد");
      return;
    }

    // console.log('🚀 Submitting report data for RFI:', rfiData?.RFI_Numbering);

    const rowToSubmit = validRows[0];

    const formattedReceivedDate = formatDateForAPI(rowToSubmit.receivedDate);
    const today = new Date();
    const todayIsoDate = today.toISOString().split("T")[0];
    const todayPersian = convertToPersianDate(today);
    const todayShamsi = todayPersian.format("YYYY/MM/DD");

    // استفاده از متن انگلیسی وضعیت
    const englishStatus =
      rowToSubmit.statusEnglish ||
      getEnglishStatus(statusesData, rowToSubmit.status) ||
      "approved";

    const reportData = {
      reportNumber: rowToSubmit.reportNumber.trim(),
      revNumber: rowToSubmit.revNumber || "",
      status: englishStatus, // ارسال متن انگلیسی به API
      corrections: rowToSubmit.corrections || "",
      receivedDate: formattedReceivedDate,
      approvedDays: rowToSubmit.approvedDays || "",
      unitNumber: rowToSubmit.unitNumber || "",
      vendorName: rowToSubmit.vendorName || "",
      irn: rowToSubmit.irn || "",
      srn: rowToSubmit.srn || "",
      firstPrice: rowToSubmit.firstPrice || "80000000",
      rfiNumbering: rowToSubmit.rfiNumbering || rfiData?.RFI_Numbering,
      user: user?.username || "",
      issueDate: todayIsoDate,
      dateShamsi: todayShamsi,
    };

    // console.log('📋 Report data to submit:', reportData);

    // **منطق جدید برای تشخیص PUT/POST**
    // از reportInfo استفاده می‌کنیم چون هوک دقیقاً همین گزارش را دریافت کرده
    const hasValidExistingReport =
      reportInfo &&
      reportInfo.Report_No &&
      reportInfo.Report_No.trim() !== "" &&
      reportInfo.Report_No !== "************" &&
      // همچنین مطمئن شویم که گزارش فعلی با گزارش موجود یکسان است
      reportInfo.Report_No === rowToSubmit.reportNumber.trim();

    // console.log('📊 PUT/POST Decision:', {
    //   hasReportInfo: !!reportInfo,
    //   reportInfoReportNo: reportInfo?.Report_No,
    //   rowReportNo: rowToSubmit.reportNumber.trim(),
    //   hasValidExistingReport,
    //   isSameReportNumber: reportInfo?.Report_No === rowToSubmit.reportNumber.trim()
    // });

    if (hasValidExistingReport) {
      // گزارش موجود و معتبر - PUT

      updateReport(
        {
          reportData: reportData,
          rfiNumbering: rfiData?.RFI_Numbering || rowToSubmit.rfiNumbering,
        },
        {
          onSuccess: (data) => {
            // console.log('✅ Update successful:', data);

            // بروزرسانی داده‌های اولیه
            initialDataRef.current = {
              reportRows: reportRows.map((row) => ({
                ...row,
                receivedDate: row.receivedDate?.format?.() || row.receivedDate,
                approvedDays:
                  typeof row.approvedDays === "number"
                    ? row.approvedDays.toString()
                    : row.approvedDays,
              })),
            };
            setHasChanges(false);
            setTimeout(() => {
              onClose();
            }, 750); // کمی تاخیر برای نمایش toast
          },
          onError: (error) => {
            console.error("❌ Update failed:", error);
            // toast توسط هوک نمایش داده می‌شود
          },
        }
      );
    } else {
      // گزارش جدید - POST

      createReport(
        {
          reportData: reportData,
          rfiNumbering: rfiData?.RFI_Numbering || rowToSubmit.rfiNumbering,
        },
        {
          onSuccess: (data) => {
            // console.log('✅ Create successful:', data);
            toast.success("✅ گزارش جدید با موفقیت ثبت شد", {
              position: "top-center",
              duration: 3000,
              icon: "✅",
              style: {
                background: "#10b981",
                color: "white",
                borderRadius: "10px",
                padding: "16px",
                fontSize: "14px",
                direction: "rtl",
                textAlign: "right",
              },
            });

            initialDataRef.current = {
              reportRows: reportRows.map((row) => ({
                ...row,
                receivedDate: row.receivedDate?.format?.() || row.receivedDate,
                approvedDays:
                  typeof row.approvedDays === "number"
                    ? row.approvedDays.toString()
                    : row.approvedDays,
              })),
            };
            setHasChanges(false);
            setTimeout(() => {
              onClose();
            }, 750);
          },
          onError: (error) => {
            console.error("❌ Create failed:", error);
            toast.error(
              `❌ خطا در ثبت گزارش جدید: ${
                error.response?.data?.message || error.message
              }`,
              {
                position: "top-center",
                duration: 4000,
                icon: "❌",
                style: {
                  background: "#ef4444",
                  color: "white",
                  borderRadius: "10px",
                  padding: "16px",
                  fontSize: "14px",
                  direction: "rtl",
                  textAlign: "right",
                },
              }
            );
          },
        }
      );
    }
  };

  // هندلر کلیک روی دکمه ذخیره
  const handleSubmit = (e) => {
    e.preventDefault();

    if (hasChanges) {
      // اگر تغییری ایجاد شده، پاپ‌آپ تأیید نمایش بده
      setShowSaveConfirm(true);
    } else {
      // اگر تغییری نداد، مستقیماً ذخیره کن
      handleSubmitInternal();
    }
  };

  // هندلر انصراف
  const handleCancelInternal = () => {
    onClose();
  };

  // هندلر کلیک روی دکمه انصراف
  const handleCancel = () => {
    if (hasChanges) {
      // اگر تغییری ایجاد شده، پاپ‌آپ تأیید نمایش بده
      setShowCancelConfirm(true);
    } else {
      // اگر تغییری نداد، مستقیماً ببند
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading =
    isReportLoading || isUpdating || isCreating || statusesLoading;

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
                  {rfiData?.Report_No === "************" || !rfiData?.Report_No
                    ? "📝 ثبت گزارش جدید"
                    : "✏️ ویرایش گزارش"}{" "}
                  - شماره {rfiData?.RFI_Numbering || "نامشخص"}
                </h3>

                {/* {rfiData?.Report_No === '************' && (
    <p className="text-xs text-blue-600 mt-1">
      <span className="font-bold">نکته:</span> گزارش قبلی ثبت نشده است. فرم جدید را پر کنید.
    </p>
  )} */}
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
        {(isReportLoading || statusesLoading) && (
          <div className="p-8 text-center">
            <FaSync className="animate-spin text-blue-500 text-2xl mx-auto mb-4" />
            <p className="text-gray-600">در حال دریافت اطلاعات...</p>
          </div>
        )}

        {/* Form */}
        {!isReportLoading && !statusesLoading && (
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            {/* Header با دکمه افزودن */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">
                  لیست گزارش‌ها
                </h4>
                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                  {reportRows.length} مورد
                </span>
              </div>
              <button
      type="button"
      onClick={handleAddNewRow}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isLoading || isSuggesting}
    >
      {isSuggesting && newReportAction === 'add' ? (
        <FaSync className="animate-spin text-base" />
      ) : (
        <FaPlusCircle className="text-base" />
      )}
      {isSuggesting && newReportAction === 'add' ? 'دریافت شماره جدید...' : 'افزودن گزارش'}
    </button>
           
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="min-w-[1500px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[180px]">
                        شماره گزارش *
                      </th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[90px]">
                        نوع گزارش
                      </th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[130px]">
                        وضعیت
                      </th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[350px]">
                        نظرات <span className="text-yellow-300 text-xs">*</span>
                      </th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[120px]">
                        تاریخ دریافت
                      </th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[160px]">
                        نام وندور
                      </th>
                      <th
                        className="p-3 text-right font-bold text-white text-xs"
                        style={{ width: "8%" }}
                      >
                        تائید‌شده(روز)
                      </th>
                      <th
                        className="p-3 text-right font-bold text-white text-xs"
                        style={{ width: "8%" }}
                      >
                        شماره واحد
                      </th>
                      <th
                        className="p-3 text-right font-bold text-white text-xs"
                        style={{ width: "8%" }}
                      >
                        IRN
                      </th>
                      <th
                        className="p-3 text-right font-bold text-white text-xs"
                        style={{ width: "8%" }}
                      >
                        SRN
                      </th>
                   

{reportInfo && reportInfo.Report_No && reportInfo.Report_No !== '************' && (
  <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '6%' }}>
    عملیات
  </th>
)}

                    </tr>
                  </thead>

                  <tbody>
                    {reportRows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-200 transition duration-150  ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50`}
                      >
                        <td className="p-3 min-w-[180px]">
                          <input
                            type="text"
                            value={row.reportNumber}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "reportNumber",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-gray-800 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="مثال: FAH-INS-APGT-0766"
                            disabled={isLoading}
                            required
                          />
                        </td>

                        <td className="p-3 min-w-[90px] text-gray-800">
                          <select
                            value={row.revNumber || ""}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "revNumber",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          >
                            <option value="">-</option>
                            <option value="rev">Rev</option>
                            <option value="multipart">Multipart</option>
                          </select>
                        </td>

                        <td className="p-3 min-w-[130px] text-gray-800">
                          <select
                            value={row.status}
                            onChange={(e) => {
                              handleRowChange(row.id, "status", e.target.value);
                            }}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          >
                            <option value="">انتخاب وضعیت</option>
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3 min-w-[350px] align-middle text-gray-800">
                          <textarea
                            value={row.corrections}
                            title={row.corrections}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "corrections",
                                e.target.value
                              )
                            }
                            className={`w-full px-3 py-2 text-xs border-gray-300 focus:ring-blue-500 border rounded-md focus:ring-2 focus:border-transparent resize-y overflow-auto
                              ${
                                row.statusEnglish === "Objection"
                                  ? "border-red-300 focus:ring-red-500 bg-red-50"
                                  : "border-gray-300 focus:ring-blue-500"
                              }
                              [&::-webkit-scrollbar]:w-2
                              [&::-webkit-scrollbar-track]:bg-gray-100
                              [&::-webkit-scrollbar-thumb]:bg-blue-300
                              [&::-webkit-scrollbar-thumb]:rounded-full
                              [&::-webkit-scrollbar-thumb:hover]:bg-blue-400`}
                            placeholder={
                              row.statusEnglish === "Objection"
                                ? "شرح نظرات الزامی است"
                                : "شرح نظرات (اختیاری)"
                            }
                            disabled={isLoading}
                            required={row.statusEnglish === "Objection"}
                            rows="2"
                            style={{
                              minHeight: "38px",
                              maxHeight: "38px",
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
                          />
                        </td>

                        <td className="p-3 min-w-[120px] text-gray-800">
                          <DatePicker
                            value={row.receivedDate}
                            onChange={(date) =>
                              handleRowChange(row.id, "receivedDate", date)
                            }
                            calendar={persian}
                            locale={persian_fa}
                            format="YYYY/MM/DD"
                            inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          />
                        </td>

                        <td className="p-3 min-w-[160px] text-gray-800">
                          <input
                            type="text"
                            value={row.vendorName}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "vendorName",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="نام وندور"
                            disabled={isLoading}
                          />
                        </td>

                        <td className="p-3 text-gray-800" style={{ width: "8%" }} >
                          <input
                            type="number"
                            value={row.approvedDays || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // اگر خالی بود، رشته خالی بفرست
                              if (value === "") {
                                handleRowChange(row.id, "approvedDays", "");
                              } else {
                                const numValue = parseInt(value, 10);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  handleRowChange(
                                    row.id,
                                    "approvedDays",
                                    numValue
                                  );
                                }
                              }
                            }}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="تعداد روز"
                            min="0"
                            disabled={isLoading}
                          />
                        </td>

                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="text"
                            value={row.unitNumber}
                            onChange={(e) =>
                              handleRowChange(
                                row.id,
                                "unitNumber",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="شماره واحد"
                            disabled={isLoading}
                          />
                        </td>

                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="text"
                            value={row.irn}
                            onChange={(e) =>
                              handleRowChange(row.id, "irn", e.target.value)
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="IRN"
                            disabled={isLoading}
                            title={
                              row.id === 1 && reportInfo?.irn
                                ? "IRN از گزارش موجود"
                                : "IRN جدید"
                            }
                          />
                        </td>

                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="text"
                            value={row.srn}
                            onChange={(e) =>
                              handleRowChange(row.id, "srn", e.target.value)
                            }
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="SRN"
                            disabled={isLoading}
                          />
                        </td>
                       {/* ستون عملیات - فقط وقتی گزارش موجود است */}
    {reportInfo && reportInfo.Report_No && reportInfo.Report_No !== '************' && (
     <td className="p-3" style={{ width: '6%' }}>
     <div className="flex items-center gap-1">
       <button
         type="button"
         onClick={() => handleCopyRow(row.id)}
         className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-100 transition duration-200"
         title="کپی سطر"
         disabled={isLoading || isSuggesting}
       >
         {isSuggesting && newReportAction === 'copy' && selectedRowToCopy?.id === row.id ? (
           <FaSync className="animate-spin text-xs" />
         ) : (
           <FaCopy className="text-xs" />
         )}
       </button>
       <button
         type="button"
         onClick={() => handleDeleteRow(row.id)}
         className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-100 transition duration-200"
         title="حذف سطر"
         disabled={isLoading || isDeleting}
       >
         <FaTrash className="text-xs" />
       </button>
     </div>
   </td>
    )}

                        {/* <td className="p-3" style={{ width: '6%' }}>
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
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 mb-6">
              {reportRows.map((row, index) => (
                <div
                  key={row.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaFileAlt className="text-blue-500" />
                      <span className="font-semibold">سطر #{index + 1}</span>
                    </div>
                    // در بخش Mobile View:
<div className="flex gap-2">
  <button
    type="button"
    onClick={() => handleCopyRow(row.id)}
    className="text-blue-600 hover:text-blue-800 p-1"
    title="کپی"
    disabled={isLoading || isSuggesting}
  >
    {isSuggesting && newReportAction === 'copy' && selectedRowToCopy?.id === row.id ? (
      <FaSync className="animate-spin text-sm" />
    ) : (
      <FaCopy className="text-sm" />
    )}
  </button>
  <button
    type="button"
    onClick={() => handleDeleteRow(row.id)}
    className="text-red-600 hover:text-red-800 p-1"
    title="حذف"
    disabled={isLoading || isDeleting}
  >
    <FaTrash className="text-sm" />
  </button>
</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          شماره گزارش *
                        </span>
                        <input
                          type="text"
                          value={row.reportNumber}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "reportNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره گزارش"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          نوع گزارش (RevNO)
                        </span>
                        <select
                          value={row.revNumber || ""}
                          onChange={(e) =>
                            handleRowChange(row.id, "revNumber", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleRowChange(row.id, "status", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        >
                          <option value="">انتخاب وضعیت</option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          تاریخ دریافت
                        </span>
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) =>
                            handleRowChange(row.id, "receivedDate", date)
                          }
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">
                        شرح نظرات
                      </span>
                      <input
                        type="text"
                        value={row.corrections}
                        onChange={(e) =>
                          handleRowChange(row.id, "corrections", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md text-xs ${
                          row.statusEnglish === "Objection"
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                        placeholder={
                          row.statusEnglish === "Objection"
                            ? "شرح نظرات الزامی است"
                            : "شرح نظرات (اختیاری)"
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          نام وندور
                        </span>
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "vendorName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام وندور"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          تعداد روز
                        </span>
                        <input
                          type="number"
                          value={row.approvedDays || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleRowChange(row.id, "approvedDays", "");
                            } else {
                              const numValue = parseInt(value, 10);
                              if (!isNaN(numValue) && numValue >= 0) {
                                handleRowChange(
                                  row.id,
                                  "approvedDays",
                                  numValue
                                );
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="تعداد روز"
                          min="0"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          شماره واحد
                        </span>
                        <input
                          type="text"
                          value={row.unitNumber}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "unitNumber",
                              e.target.value
                            )
                          }
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
                          onChange={(e) =>
                            handleRowChange(row.id, "irn", e.target.value)
                          }
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
                        onChange={(e) =>
                          handleRowChange(row.id, "srn", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="SRN"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* دکمه اضافه کردن برای موبایل */}
              {/* <button
                type="button"
                onClick={handleAddNewRow}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <FaPlusCircle className="text-base" />
                افزودن سطر جدید
              </button> */}
            </div>

            {/* دکمه‌های ثبت و انصراف */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {/* در بخش دکمه‌ها اصلاح کنید: */}
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
                ) : reportInfo &&
                  reportInfo.Report_No &&
                  reportInfo.Report_No !== "************" ? (
                  <>
                    <FaCheckCircle className="text-lg" />
                    بروزرسانی گزارش
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-lg" />
                    ثبت گزارش جدید
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
      {showNewReportDialog && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4">
        <div className="flex flex-col items-center text-center">
          {isSuggesting ? (
            <>
              <FaSync className="animate-spin text-blue-500 text-2xl mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                در حال دریافت شماره گزارش جدید
              </h3>
              <p className="text-xs text-gray-600">
                لطفاً منتظر بمانید...
              </p>
            </>
          ) : suggestedReportNo ? (
            <>
              <FaCheckCircle className="text-green-500 text-2xl mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                شماره جدید دریافت شد
              </h3>
              <p className="text-xs text-gray-800 font-mono bg-gray-100 p-2 rounded mb-3">
                {suggestedReportNo}
              </p>
              <p className="text-xs text-gray-600 mb-3">
                سطر جدید با این شماره اضافه خواهد شد.
                <br />
                <span className="text-yellow-600 font-medium">
                  توجه: ستون "تعداد روز تائید شده" برای تمام سطرهای قبلی صفر شد.
                </span>
              </p>
              <button
                onClick={() => setShowNewReportDialog(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition duration-200"
              >
                ادامه
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )}

      {/* پاپ‌آپ تأیید ذخیره */}
      <ConfirmationPopover
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSubmitInternal}
        title="تغییرات ذخیره نشده"
        message="آیا از ذخیره‌سازی تغییرات ایجاد شده در گزارش اطمینان دارید؟"
        type="warning"
        confirmText="بله، ذخیره کن"
        cancelText="انصراف"
      />

      {/* پاپ‌آپ تأیید انصراف */}
      <ConfirmationPopover
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelInternal}
        title="انصراف از تغییرات"
        message="تغییرات ایجاد شده در گزارش ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید انصراف دهید؟"
        type="info"
        confirmText="بله، انصراف بده"
        cancelText="بازگشت"
      />
      {/* پاپ‌آپ تأیید حذف */}
      <DeleteConfirmationPopover
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedReportForDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        reportNumber={selectedReportForDelete?.reportNumber || ""}
        rfiNumbering={selectedReportForDelete?.rfiNumbering || ""}
        title="حذف گزارش از سیستم"
        message="این عمل گزارش را به طور کامل از سیستم حذف می‌کند و قابل بازگشت نیست. آیا مطمئن هستید؟"
        confirmText={isDeleting ? "در حال حذف..." : "بله، حذف شود"}
        cancelText="انصراف"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AddReportModal;
