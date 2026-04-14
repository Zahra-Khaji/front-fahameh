// src/components/ui/AddReportModal/AddReportModal.jsx

import React, { useState, useEffect, useRef, useMemo } from "react"; 
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

import {
  getReportStatusInPersian,
  transformReportStatuses,
  getEnglishStatus,
} from "../../../utils/helpers";

import {
  useReportStatuses,
  useDeleteReport,
  useSuggestedReportNo
} from "../../../hooks/useCreateReport";
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
      <div
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      <div
        className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full`}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
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
  const {
    data: reportInfo,
    isLoading: isReportLoading,
    error,
  } = useReportInfo(
    rfiData?.RFI_Numbering,
    rfiData?.Report_No
  );
  const { mutate: updateReport, isLoading: isUpdating } = useUpdateReport();
  const { mutate: createReport, isLoading: isCreating } = useCreateNewReport();
  const { data: statusesData, isLoading: statusesLoading } = useReportStatuses();
  const { mutate: deleteReport, isLoading: isDeleting } = useDeleteReport();
  const { user } = useUser();

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [newReportAction, setNewReportAction] = useState(null);
  const [selectedRowToCopy, setSelectedRowToCopy] = useState(null);
  
  const [suggestParams, setSuggestParams] = useState({
    rfiNumbering: '',
    reportNo: '',
    revNo: ''
  });

  const [reportRows, setReportRows] = useState([]);
  const [newlyAddedRows, setNewlyAddedRows] = useState([]);
  const [rowsToUpdate, setRowsToUpdate] = useState([]);
  const [hasRowAddition, setHasRowAddition] = useState(false);
    
  const { data: suggestedReportNo, isLoading: isSuggesting, refetch: fetchSuggestedReport } = useSuggestedReportNo(
    suggestParams.rfiNumbering,
    suggestParams.reportNo,
    suggestParams.revNo,
    false
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedReportForDelete, setSelectedReportForDelete] = useState(null);
  const initialDataRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);

  const statusOptions = useMemo(() => {
    return transformReportStatuses(statusesData);
  }, [statusesData]);

// ========== تابع اعمال منطق نوع گزارش با ذخیره مقدار اصلی ==========
const applyRevTypeLogic = (rowId, newRevValue, currentRows) => {
  const currentIndex = currentRows.findIndex(row => row.id === rowId);
  if (currentIndex === -1) return currentRows;
  
  const updatedRows = [...currentRows];
  const currentRow = { ...updatedRows[currentIndex] };
  
  // پیدا کردن آخرین سطر قبلی (غیر از سطر جاری)
  let previousRow = null;
  let previousIndex = -1;
  
  for (let i = currentIndex - 1; i >= 0; i--) {
    const row = updatedRows[i];
    previousRow = row;
    previousIndex = i;
    break;
  }
  
  // اگر سطر قبلی پیدا نشد، فقط مقدار نوع گزارش را تغییر بده
  if (!previousRow) {
    currentRow.revNumber = newRevValue;
    updatedRows[currentIndex] = currentRow;
    return updatedRows;
  }
  
  // مقدار اصلی سطر قبلی را محاسبه کن
  let originalApprovedDays = previousRow.approvedDays;
  
  // اگر سطر قبلی مقدار originalApprovedDays دارد (یعنی قبلاً تغییر کرده بود)
  if (previousRow.originalApprovedDays !== undefined) {
    originalApprovedDays = previousRow.originalApprovedDays;
  }
  
  const previousApprovedDaysValue = originalApprovedDays !== undefined && originalApprovedDays !== ""
    ? parseInt(originalApprovedDays) || 0
    : 0;
  
  if (newRevValue === 'multipart') {
    // Multipart: 
    // 1. مقدار سطر قبلی را به مقدار اصلی برگردان
    // 2. مقدار سطر جدید = مقدار اصلی سطر قبلی
    
    const previousRowUpdated = { ...previousRow };
    
    // برگرداندن مقدار اصلی به سطر قبلی
    if (previousRowUpdated.originalApprovedDays !== undefined) {
      previousRowUpdated.approvedDays = previousRowUpdated.originalApprovedDays;
    }
    previousRowUpdated.needsUpdate = true;
    updatedRows[previousIndex] = previousRowUpdated;
    
    // مقدار سطر جدید را برابر با مقدار اصلی سطر قبلی بگذار
    currentRow.approvedDays = previousApprovedDaysValue;
    currentRow.revNumber = newRevValue;
    updatedRows[currentIndex] = currentRow;
    
  } else if (newRevValue === 'rev') {
    // Rev: 
    // 1. مقدار اصلی سطر قبلی را ذخیره کن (اگر قبلاً ذخیره نشده)
    // 2. مقدار فعلی سطر قبلی را صفر کن
    // 3. مقدار سطر جدید را برابر با مقدار اصلی سطر قبلی بگذار
    
    const previousRowUpdated = { ...previousRow };
    
    // ذخیره مقدار اصلی اگر قبلاً ذخیره نشده
    if (previousRowUpdated.originalApprovedDays === undefined && previousRowUpdated.approvedDays !== undefined) {
      previousRowUpdated.originalApprovedDays = previousRowUpdated.approvedDays;
    }
    
    // مقدار فعلی را صفر کن
    previousRowUpdated.approvedDays = 0;
    previousRowUpdated.needsUpdate = true;
    updatedRows[previousIndex] = previousRowUpdated;
    
    currentRow.approvedDays = previousApprovedDaysValue;
    currentRow.revNumber = newRevValue;
    updatedRows[currentIndex] = currentRow;
    
    if (!previousRow.isNew && !rowsToUpdate.includes(previousRow.id)) {
      setRowsToUpdate(prev => [...prev, previousRow.id]);
    }
  } else {
    currentRow.revNumber = newRevValue;
    updatedRows[currentIndex] = currentRow;
  }
  
  return updatedRows;
};

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
      if (dateString instanceof DateObject) {
        return dateString;
      }

      if (typeof dateString === "string") {
        if (dateString.includes("/")) {
          const [year, month, day] = dateString.split("/").map(Number);
          return new DateObject({
            year: year,
            month: month,
            day: day,
            calendar: persian,
            locale: persian_fa,
          });
        } else if (dateString.includes("-")) {
          const date = new Date(dateString);
          return new DateObject({
            date: date,
            calendar: persian,
            locale: persian_fa,
          });
        }
      }

      if (dateString instanceof Date) {
        return new DateObject({
          date: dateString,
          calendar: persian,
          locale: persian_fa,
        });
      }

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

  const formatDateForAPI = (dateObj) => {
    if (!dateObj) return "";

    try {
      if (dateObj instanceof DateObject) {
        return dateObj.format("YYYY/MM/DD");
      }

      if (typeof dateObj === "string") {
        return dateObj;
      }

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

  const convertToString = (value) => {
    if (value == null) return "";

    if (value instanceof DateObject) {
      return value.format("YYYY/MM/DD");
    }

    if (typeof value === "string" && value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 3) {
        return parts.map((p) => p.padStart(2, "0")).join("/");
      }
    }

    return String(value).trim();
  };

  const areValuesEqual = (val1, val2) => {
    if (val1 == null && val2 == null) return true;
    if (val1 == null || val2 == null) return false;
    const str1 = convertToString(val1);
    const str2 = convertToString(val2);
    return str1 === str2;
  };

  // ========== تابع افزودن سطر جدید (بدون تغییر در approvedDays) ==========
  const handleAddNewRowBasic = () => {
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    
    // سطر قبلی را تغییر نده! فقط سطر جدید اضافه کن
    const newRow = {
      id: newId,
      reportNumber: '',
      revNumber: '',
      status: "5",
      statusEnglish: "approved",
      corrections: "",
      receivedDate: convertToPersianDate(new Date()),
      approvedDays: "", // خالی بگذار، مقداردهی بعد از انتخاب نوع گزارش انجام شود
      unitNumber: "",
      vendorName: rfiData?.VendorName || "",
      irn: "",
      srn: "",
      firstPrice: "80000000",
      rfiNumbering: rfiData?.RFI_Numbering || "",
      issueDate: new Date().toISOString().split("T")[0],
      isNew: true,
      needsUpdate: false
    };
    
    setReportRows([...reportRows, newRow]);
    setHasRowAddition(true);
    
    toast.info('📝 یک سطر جدید اضافه شد. لطفاً نوع گزارش را انتخاب کنید');
  };

  const fetchNewReportNumber = async (action, rowToCopy = null) => {
    if (!rfiData?.RFI_Numbering) {
      console.error('❌ rfiData یا RFI_Numbering موجود نیست');
      toast.error('❌ شماره RFI نامشخص است');
      return;
    }
    
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
    
    if (!reportNo || reportNo.trim() === '') {
      console.error('⚠️ reportNo خالی است');
      toast.error('❌ ابتدا یک شماره گزارش موجود را پر کنید');
      return;
    }
    
    setSuggestParams({
      rfiNumbering: rfiData.RFI_Numbering,
      reportNo: reportNo,
      revNo: revNo
    });
    
    setNewReportAction(action);
    setShowNewReportDialog(true);
    
    setTimeout(() => {
      fetchSuggestedReport();
    }, 100);
  };

  // ========== تابع ایجاد سطر جدید با شماره پیشنهادی (بدون تغییر approvedDays) ==========
  const createNewRowWithSuggestedNumber = () => {
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    
    let newRow = {
      id: newId,
      reportNumber: suggestedReportNo || '',
      revNumber: '',
      status: "5",
      statusEnglish: "approved",
      corrections: "",
      receivedDate: convertToPersianDate(new Date()),
      approvedDays: "", // خالی بگذار، مقداردهی بعد از انتخاب نوع گزارش انجام شود
      unitNumber: "",
      vendorName: rfiData?.VendorName || "",
      irn: "",
      srn: "",
      firstPrice: "80000000",
      rfiNumbering: rfiData?.RFI_Numbering || "",
      issueDate: new Date().toISOString().split("T")[0],
      isNew: true,
      needsUpdate: false
    };
    
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
        irn: "",
        srn: selectedRowToCopy.srn || "",
        firstPrice: selectedRowToCopy.firstPrice || "80000000",
        approvedDays: "", // خالی بگذار
        isNew: true,
        needsUpdate: false
      };
    }
    
    // سطرهای قبلی را تغییر نده!
    setReportRows([...reportRows, newRow]);
    setNewlyAddedRows([...newlyAddedRows, newId]);
    setHasRowAddition(true);
    setShowNewReportDialog(false);
    setSelectedRowToCopy(null);
    setNewReportAction(null);
  };

  useEffect(() => {
    if (suggestedReportNo && showNewReportDialog) {
      createNewRowWithSuggestedNumber();
    }
  }, [suggestedReportNo]);

  useEffect(() => {
    if (reportRows.length > 0 && hasRowAddition) {
      const secondLastIndex = reportRows.length - 2;
      if (secondLastIndex >= 0) {
        const secondLastRow = reportRows[secondLastIndex];
        if (secondLastRow && !rowsToUpdate.includes(secondLastRow.id)) {
          setRowsToUpdate([...rowsToUpdate, secondLastRow.id]);
        }
      }
    }
  }, [reportRows, hasRowAddition]);

  const handleAddNewRow = () => {
    fetchNewReportNumber('add');
  };

  const handleDeleteRow = (id) => {
    const rowToDelete = reportRows.find((row) => row.id === id);
    const hasExistingReport = reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0;

    if (hasExistingReport) {
      setSelectedReportForDelete({
        reportNumber: reportInfo.Report_No,
        rfiNumbering: reportInfo.RFI_Numbering || rfiData?.RFI_Numbering,
        rowId: id,
      });
      setShowDeleteConfirm(true);
    } else {
      setReportRows(reportRows.filter((row) => row.id !== id));
      if (reportRows.length === 1) {
        setTimeout(() => {
          onClose();
        }, 100);
      }
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedReportForDelete) return;

    deleteReport(selectedReportForDelete.reportNumber, {
      onSuccess: () => {
        setTimeout(() => {
          onClose();
        }, 300);
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
    if (field === "revNumber") {
      setReportRows(prevRows => applyRevTypeLogic(id, value, prevRows));
    } else {
      setReportRows(
        reportRows.map((row) => {
          if (row.id === id) {
            if (field === "status") {
              const selectedOption = statusOptions.find(
                (opt) => opt.value === value
              );
              const englishStatus = selectedOption?.textValue || value;

              return {
                ...row,
                [field]: value,
                statusEnglish: englishStatus,
                ...(englishStatus !== "Objection" && { corrections: "" }),
              };
            }

            if (field === "approvedDays") {
              if (value === "" || value === null || value === undefined) {
                return { ...row, [field]: "" };
              }
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0) {
                return { ...row, [field]: numValue };
              }
              return row;
            }
            return { ...row, [field]: value };
          }
          return row;
        })
      );
    }
  };

  const checkForChanges = () => {
    if (!initialDataRef.current) return false;
  
    const initial = initialDataRef.current;
    const current = {
      reportRows: reportRows.map((row) => ({
        ...row,
        receivedDate: row.receivedDate?.format?.() || row.receivedDate,
      })),
    };
  
    if (initial.reportRows.length !== current.reportRows.length) {
      return true;
    }
  
    for (let i = 0; i < initial.reportRows.length; i++) {
      const initialRow = initial.reportRows[i];
      const currentRow = current.reportRows[i];
  
      const fields = [
        "reportNumber", "revNumber", "status", "corrections", "receivedDate",
        "approvedDays", "unitNumber", "vendorName", "irn", "srn", "firstPrice", "rfiNumbering",
      ];
  
      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) {
          return true;
        }
      }
    }
  
    if (hasRowAddition) {
      return true;
    }
  
    return false;
  };

  useEffect(() => {
    if (initialDataRef.current) {
      const changed = checkForChanges();
      setHasChanges(changed);
    }
  }, [reportRows]);

  const prepareReportData = (row) => {
    const formattedReceivedDate = formatDateForAPI(row.receivedDate);
    const today = new Date();
    const todayIsoDate = today.toISOString().split("T")[0];
    const todayPersian = convertToPersianDate(today);
    const todayShamsi = todayPersian.format("YYYY/MM/DD");

    const englishStatus = row.statusEnglish || getEnglishStatus(statusesData, row.status) || "approved";

    return {
      reportNumber: row.reportNumber.trim(),
      revNumber: row.revNumber || "",
      status: englishStatus,
      corrections: row.corrections || "",
      receivedDate: formattedReceivedDate,
      approvedDays: row.approvedDays || "",
      unitNumber: row.unitNumber || "",
      vendorName: row.vendorName || "",
      irn: row.irn || "",
      srn: row.srn || "",
      firstPrice: row.firstPrice || "80000000",
      rfiNumbering: row.rfiNumbering || rfiData?.RFI_Numbering,
      user: user?.username || "",
      issueDate: todayIsoDate,
      dateShamsi: todayShamsi,
    };
  };

  const handleSuccess = () => {
    initialDataRef.current = {
      reportRows: reportRows.map((row) => ({
        ...row,
        receivedDate: row.receivedDate?.format?.() || row.receivedDate,
        approvedDays: typeof row.approvedDays === "number" ? row.approvedDays.toString() : row.approvedDays,
        isNew: false,
        needsUpdate: false
      })),
    };
    
    setHasRowAddition(false);
    setNewlyAddedRows([]);
    setRowsToUpdate([]);
    setHasChanges(false);
    
    setTimeout(() => {
      onClose();
    }, 750);
  };

  const validateForm = () => {
    if (reportRows.length === 0) {
      toast.error("❌ حداقل یک ردیف گزارش باید وجود داشته باشد");
      return false;
    }

    for (const row of reportRows) {
      if (!row.reportNumber || !row.reportNumber.trim()) {
        toast.error("❌ شماره گزارش الزامی است");
        return false;
      }

      if (!row.status) {
        handleRowChange(row.id, "status", "5");
      }

      if (row.statusEnglish === "Objection" && (!row.corrections || !row.corrections.trim())) {
        toast.error('❌ برای وضعیت "نیاز به اصلاحات"، شرح نظرات الزامی است');
        return false;
      }

      if (row.approvedDays !== "" && row.approvedDays != null) {
        const daysValue = typeof row.approvedDays === "string" ? row.approvedDays.trim() : row.approvedDays.toString();
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

  const handleSubmitInternal = () => {
    if (!validateForm()) return;

    const validRows = reportRows.filter(row => row.reportNumber && row.reportNumber.trim() !== "");

    if (validRows.length === 0) {
      toast.error("❌ هیچ گزارش معتبری برای ذخیره وجود ندارد");
      return;
    }

    if (hasRowAddition && validRows.length > 1) {
      const lastIndex = validRows.length - 1;
      const secondLastRow = validRows[lastIndex - 1];
      const lastRow = validRows[lastIndex];
      
      if (secondLastRow) {
        const secondLastRowData = prepareReportData(secondLastRow);
        
        updateReport(
          {
            reportData: { ...secondLastRowData, approvedDays: secondLastRow.approvedDays || 0 },
            rfiNumbering: rfiData?.RFI_Numbering || secondLastRow.rfiNumbering,
          },
          {
            onSuccess: () => {
              const lastRowData = prepareReportData(lastRow);
              createReport(
                {
                  reportData: { ...lastRowData, approvedDays: lastRow.approvedDays || "" },
                  rfiNumbering: rfiData?.RFI_Numbering || lastRow.rfiNumbering,
                },
                {
                  onSuccess: () => handleSuccess(),
                  onError: (createError) => console.error('❌ Create failed:', createError),
                }
              );
            },
            onError: (updateError) => console.error('❌ Update failed:', updateError),
          }
        );
      }
    } else {
      const rowToSubmit = validRows[0];
      const reportData = prepareReportData(rowToSubmit);
      
      const hasValidExistingReport = reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0;

      if (hasValidExistingReport) {
        updateReport(
          {
            reportData: reportData,
            rfiNumbering: rfiData?.RFI_Numbering || rowToSubmit.rfiNumbering,
          },
          {
            onSuccess: () => handleSuccess(),
            onError: (error) => console.error("❌ Update failed:", error),
          }
        );
      } else {
        createReport(
          {
            reportData: reportData,
            rfiNumbering: rfiData?.RFI_Numbering || rowToSubmit.rfiNumbering,
          },
          {
            onSuccess: () => handleSuccess(),
            onError: (error) => console.error("❌ Create failed:", error),
          }
        );
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasChanges) {
      setShowSaveConfirm(true);
    } else {
      handleSubmitInternal();
    }
  };

  const handleCancelInternal = () => {
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      const reportSource = reportInfo || rfiData;
      const hasValidReport = reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0;
      const todayPersianDate = convertToPersianDate(new Date());

      if (hasValidReport) {
        const englishStatus = reportSource.Doc_Status || "Acc";
        let initialStatusValue = "Acc";

        if (statusesData && Object.values(statusesData).length > 0) {
          const exactMatch = Object.values(statusesData).find(status => status === englishStatus);
          if (exactMatch) {
            initialStatusValue = exactMatch;
          } else {
            const caseInsensitiveMatch = Object.values(statusesData).find(
              status => status.toLowerCase() === englishStatus.toLowerCase()
            );
            if (caseInsensitiveMatch) {
              initialStatusValue = caseInsensitiveMatch;
            } else {
              const partialMatch = Object.values(statusesData).find(
                status => status.toLowerCase().includes(englishStatus.toLowerCase()) ||
                          englishStatus.toLowerCase().includes(status.toLowerCase())
              );
              initialStatusValue = partialMatch || Object.values(statusesData)[0];
            }
          }
        }

        const initialRow = {
          id: 1,
          reportNumber: reportSource.Report_No || "",
          revNumber: reportSource.RevNO || "",
          status: initialStatusValue,
          statusEnglish: initialStatusValue,
          corrections: reportSource.Remark || "",
          receivedDate: convertToPersianDate(reportSource.ReportReceivedDate || reportSource.IssueDate),
          approvedDays: reportSource.App_manday_1stPrice || "",
          unitNumber: reportSource.UnitNo || "",
          vendorName: reportSource.VendorName || "",
          irn: (reportSource.IRNNO && reportSource.IRNNO.trim() !== "") ? reportSource.IRNNO : "",
          srn: reportSource.SRNNO || "",
          firstPrice: reportSource.FirstPrice || "80000000",
          rfiNumbering: reportSource.RFI_Numbering || "",
          issueDate: reportSource.IssueDate || new Date().toISOString().split("T")[0],
        };

        setReportRows([initialRow]);
        initialDataRef.current = {
          reportRows: [{
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
          }],
        };
      } else {
        const defaultStatus = statusesData && Object.values(statusesData).length > 0
          ? Object.values(statusesData)[0]
          : "Acc";

        const newRow = {
          id: 1,
          reportNumber: rfiData?.Report_No === "************" ? "" : rfiData?.Report_No || "",
          revNumber: "",
          status: defaultStatus,
          statusEnglish: defaultStatus,
          corrections: "",
          receivedDate: todayPersianDate,
          approvedDays: "",
          unitNumber: "",
          vendorName: rfiData?.VendorName || "",
          irn: "", 
          srn: "",
          firstPrice: "80000000",
          rfiNumbering: rfiData?.RFI_Numbering || "",
          issueDate: new Date().toISOString().split("T")[0],
        };

        setReportRows([newRow]);
        initialDataRef.current = {
          reportRows: [{
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
          }],
        };
      }

      setHasChanges(false);
    }
  }, [isOpen, rfiData, reportInfo, nextIRN, statusesData]);

  if (!isOpen) return null;

  const isLoading = isReportLoading || isUpdating || isCreating || statusesLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-blue-500 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {rfiData?.Report_No === "************" || !rfiData?.Report_No
                    ? "📝 ثبت گزارش جدید"
                    : "✏️ ویرایش گزارش"} - شماره {rfiData?.RFI_Numbering || "نامشخص"}
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

        {error && error.response?.status !== 404 && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              خطا در دریافت اطلاعات: {error.message}
            </p>
          </div>
        )}

        {(isReportLoading || statusesLoading) && (
          <div className="p-8 text-center">
            <FaSync className="animate-spin text-blue-500 text-2xl mx-auto mb-4" />
            <p className="text-gray-600">در حال دریافت اطلاعات...</p>
          </div>
        )}

        {!isReportLoading && !statusesLoading && (
          <form onSubmit={handleSubmit} className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">لیست گزارش‌ها</h4>
                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{reportRows.length} مورد</span>
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
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[180px]">شماره گزارش *</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[90px]">نوع گزارش</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[130px]">وضعیت</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[350px]">نظرات <span className="text-yellow-300 text-xs">*</span></th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[120px]">تاریخ دریافت</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[160px]">نام وندور</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>تائید‌شده(روز)</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>شماره واحد</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>IRN</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>SRN</th>
                      {reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 && (
                        <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '6%' }}>عملیات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row, index) => (
                      <tr key={row.id} className={`border-b border-gray-200 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                        <td className="p-3 min-w-[180px]">
                          <input
                            type="text"
                            value={row.reportNumber}
                            onChange={(e) => handleRowChange(row.id, "reportNumber", e.target.value)}
                            className="w-full px-3 py-2 text-gray-800 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="مثال: FAH-INS-APGT-0766"
                            disabled={isLoading}
                            required
                          />
                        </td>
                        <td className="p-3 min-w-[90px] text-gray-800">
                          <select
                            value={row.revNumber || ""}
                            onChange={(e) => handleRowChange(row.id, "revNumber", e.target.value)}
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
                            onChange={(e) => handleRowChange(row.id, "status", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isLoading}
                          >
                            <option value="">انتخاب وضعیت</option>
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 min-w-[350px] align-middle text-gray-800">
                          <textarea
                            value={row.corrections}
                            onChange={(e) => handleRowChange(row.id, "corrections", e.target.value)}
                            className={`w-full px-3 py-2 text-xs border-gray-300 focus:ring-blue-500 border rounded-md focus:ring-2 focus:border-transparent resize-y overflow-auto
                              ${row.statusEnglish === "Objection" ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-300 focus:ring-blue-500"}`}
                            placeholder={row.statusEnglish === "Objection" ? "شرح نظرات الزامی است" : "شرح نظرات (اختیاری)"}
                            disabled={isLoading}
                            required={row.statusEnglish === "Objection"}
                            rows="2"
                            style={{ minHeight: "38px", maxHeight: "38px", whiteSpace: "pre-wrap", wordWrap: "break-word" }}
                          />
                        </td>
                        <td className="p-3 min-w-[120px] text-gray-800">
                          <DatePicker
                            value={row.receivedDate}
                            onChange={(date) => handleRowChange(row.id, "receivedDate", date)}
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
                            onChange={(e) => handleRowChange(row.id, "vendorName", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="نام وندور"
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="number"
                            value={row.approvedDays !== undefined && row.approvedDays !== "" ? row.approvedDays : ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "") {
                                handleRowChange(row.id, "approvedDays", "");
                              } else {
                                const numValue = parseInt(value, 10);
                                if (!isNaN(numValue) && numValue >= 0) {
                                  handleRowChange(row.id, "approvedDays", numValue);
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
                            onChange={(e) => handleRowChange(row.id, "unitNumber", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="شماره واحد"
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="text"
                            value={row.irn}
                            onChange={(e) => handleRowChange(row.id, "irn", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="IRN"
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                          <input
                            type="text"
                            value={row.srn}
                            onChange={(e) => handleRowChange(row.id, "srn", e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="SRN"
                            disabled={isLoading}
                          />
                        </td>
                        {reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 && (
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
                        <span className="text-gray-600 block mb-1">شماره گزارش *</span>
                        <input
                          type="text"
                          value={row.reportNumber}
                          onChange={(e) => handleRowChange(row.id, "reportNumber", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره گزارش"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">نوع گزارش (RevNO)</span>
                        <select
                          value={row.revNumber || ""}
                          onChange={(e) => handleRowChange(row.id, "revNumber", e.target.value)}
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
                          onChange={(e) => handleRowChange(row.id, "status", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading}
                        >
                          <option value="">انتخاب وضعیت</option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تاریخ دریافت</span>
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) => handleRowChange(row.id, "receivedDate", date)}
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
                        onChange={(e) => handleRowChange(row.id, "corrections", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-xs ${row.statusEnglish === "Objection" ? "border-red-300 bg-red-50" : "border-gray-300"}`}
                        placeholder={row.statusEnglish === "Objection" ? "شرح نظرات الزامی است" : "شرح نظرات (اختیاری)"}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">نام وندور</span>
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) => handleRowChange(row.id, "vendorName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام وندور"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تعداد روز</span>
                        <input
                          type="number"
                          value={row.approvedDays !== undefined && row.approvedDays !== "" ? row.approvedDays : ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              handleRowChange(row.id, "approvedDays", "");
                            } else {
                              const numValue = parseInt(value, 10);
                              if (!isNaN(numValue) && numValue >= 0) {
                                handleRowChange(row.id, "approvedDays", numValue);
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
                        <span className="text-gray-600 block mb-1">شماره واحد</span>
                        <input
                          type="text"
                          value={row.unitNumber}
                          onChange={(e) => handleRowChange(row.id, "unitNumber", e.target.value)}
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
                          onChange={(e) => handleRowChange(row.id, "irn", e.target.value)}
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
                        onChange={(e) => handleRowChange(row.id, "srn", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="SRN"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ))}
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
                ) : reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 ? (
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
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">در حال دریافت شماره گزارش جدید</h3>
                  <p className="text-xs text-gray-600">لطفاً منتظر بمانید...</p>
                </>
              ) : suggestedReportNo ? (
                <>
                  <FaCheckCircle className="text-green-500 text-2xl mb-3" />
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">شماره جدید دریافت شد</h3>
                  <p className="text-xs text-gray-800 font-mono bg-gray-100 p-2 rounded mb-3">{suggestedReportNo}</p>
                  <p className="text-xs text-gray-600 mb-3">
                    سطر جدید با این شماره اضافه خواهد شد.
                  </p>
                  <button onClick={() => setShowNewReportDialog(false)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition duration-200">
                    ادامه
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

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