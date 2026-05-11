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
import { useVendors } from "../../../hooks/useVendors";
import { toast } from "react-hot-toast";

import {
  getReportStatusInPersian,
  transformReportStatuses,
  getEnglishStatus,
} from "../../../utils/helpers";

import {
  useReportStatuses,
  useDeleteReport,
} from "../../../hooks/useCreateReport";
import DeleteConfirmationPopover from "./DeleteConfirmationPopover";
import reportService from "../../../services/reportService";
import TableSearchableSelect from "../TableSearchableSelect";

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
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={onClose} />
      <div className={`relative ${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-xl max-w-sm w-full`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">{styles.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition duration-200 flex items-center gap-1">
              <FaBan className="text-xs" />
              {cancelText}
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`px-3 py-1.5 text-xs font-medium rounded-md transition duration-200 flex items-center gap-1 ${styles.confirmBtn}`}>
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
  } = useReportInfo(rfiData?.RFI_Numbering, rfiData?.Report_No);
  const { mutate: updateReport, isLoading: isUpdating } = useUpdateReport();
  const { mutate: createReport, isLoading: isCreating } = useCreateNewReport();
  const { data: statusesData, isLoading: statusesLoading } = useReportStatuses();
  const { mutate: deleteReport, isLoading: isDeleting } = useDeleteReport();
  const { user } = useUser();

  const { data: vendors, isLoading: vendorsLoading } = useVendors(false);

  const vendorOptions = useMemo(() => {
    return vendors?.map((vendor) => ({ value: vendor.name, label: vendor.name })) || [];
  }, [vendors]);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedReportForDelete, setSelectedReportForDelete] = useState(null);
  const [reportRows, setReportRows] = useState([]);
  const [newlyAddedRows, setNewlyAddedRows] = useState([]);
  const [rowsToUpdate, setRowsToUpdate] = useState([]);
  const [hasRowAddition, setHasRowAddition] = useState(false);
  const initialDataRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [duplicateReportNumbers, setDuplicateReportNumbers] = useState({});

  const statusOptions = useMemo(() => transformReportStatuses(statusesData), [statusesData]);

  const applyRevTypeLogicWithDays = (rowId, newRevValue, currentRows) => {
    const currentIndex = currentRows.findIndex(row => row.id === rowId);
    if (currentIndex === -1) return currentRows;
    
    const updatedRows = [...currentRows];
    const currentRow = { ...updatedRows[currentIndex] };
    
    let previousRow = null;
    let previousIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) {
      const row = updatedRows[i];
      previousRow = row;
      previousIndex = i;
      break;
    }
    
    if (!previousRow) {
      currentRow.revNumber = newRevValue;
      updatedRows[currentIndex] = currentRow;
      return updatedRows;
    }
    
    let originalApprovedDays = previousRow.originalApprovedDays;
    if (originalApprovedDays === undefined) {
      originalApprovedDays = previousRow.approvedDays;
    }
    
    const previousApprovedDaysValue = originalApprovedDays !== undefined && originalApprovedDays !== ""
      ? parseInt(originalApprovedDays) || 0 : 0;
    
    if (newRevValue === 'multipart') {
      const previousRowUpdated = { ...previousRow };
      if (previousRowUpdated.originalApprovedDays !== undefined) {
        previousRowUpdated.approvedDays = previousRowUpdated.originalApprovedDays;
      }
      previousRowUpdated.needsUpdate = true;
      updatedRows[previousIndex] = previousRowUpdated;
      currentRow.approvedDays = previousApprovedDaysValue;
      currentRow.revNumber = newRevValue;
      updatedRows[currentIndex] = currentRow;
    } else if (newRevValue === 'rev') {
      const previousRowUpdated = { ...previousRow };
      if (previousRowUpdated.originalApprovedDays === undefined && previousRowUpdated.approvedDays !== undefined) {
        previousRowUpdated.originalApprovedDays = previousRowUpdated.approvedDays;
      }
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
      if (previousRow.originalApprovedDays !== undefined) {
        const previousRowUpdated = { ...previousRow };
        previousRowUpdated.approvedDays = previousRowUpdated.originalApprovedDays;
        previousRowUpdated.needsUpdate = true;
        updatedRows[previousIndex] = previousRowUpdated;
      }
      currentRow.revNumber = newRevValue;
      updatedRows[currentIndex] = currentRow;
    }
    return updatedRows;
  };

  const convertToPersianDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return new DateObject({ date: today, calendar: persian, locale: persian_fa });
    }
    try {
      if (dateString instanceof DateObject) return dateString;
      if (typeof dateString === "string") {
        if (dateString.includes("/")) {
          const [year, month, day] = dateString.split("/").map(Number);
          return new DateObject({ year, month, day, calendar: persian, locale: persian_fa });
        } else if (dateString.includes("-")) {
          const date = new Date(dateString);
          return new DateObject({ date, calendar: persian, locale: persian_fa });
        }
      }
      if (dateString instanceof Date) {
        return new DateObject({ date: dateString, calendar: persian, locale: persian_fa });
      }
      const date = new Date(dateString);
      return new DateObject({ date, calendar: persian, locale: persian_fa });
    } catch (err) {
      const today = new Date();
      return new DateObject({ date: today, calendar: persian, locale: persian_fa });
    }
  };

  const formatDateForAPI = (dateObj) => {
    if (!dateObj) return "";
    try {
      if (dateObj instanceof DateObject) return dateObj.format("YYYY/MM/DD");
      if (typeof dateObj === "string") return dateObj;
      if (dateObj instanceof Date) {
        const date = new DateObject({ date: dateObj, calendar: persian, locale: persian_fa });
        return date.format("YYYY/MM/DD");
      }
      return "";
    } catch (err) {
      return "";
    }
  };

  const convertToString = (value) => {
    if (value == null) return "";
    if (value instanceof DateObject) return value.format("YYYY/MM/DD");
    if (typeof value === "string" && value.includes("/")) {
      const parts = value.split("/");
      if (parts.length === 3) return parts.map((p) => p.padStart(2, "0")).join("/");
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

  const checkDuplicateReportNumbers = (rows) => {
    const duplicates = {};
    const reportNumberCount = {};
    
    rows.forEach(row => {
      const reportNumber = row.reportNumber?.trim();
      if (reportNumber && reportNumber !== "************" && reportNumber !== "") {
        if (!reportNumberCount[reportNumber]) {
          reportNumberCount[reportNumber] = [];
        }
        reportNumberCount[reportNumber].push(row.id);
      }
    });
    
    Object.entries(reportNumberCount).forEach(([number, ids]) => {
      if (ids.length > 1) {
        ids.forEach(id => {
          duplicates[id] = true;
        });
      }
    });
    
    return duplicates;
  };

  const updateDuplicateStatus = (rows) => {
    const duplicates = checkDuplicateReportNumbers(rows);
    setDuplicateReportNumbers(duplicates);
    return duplicates;
  };

  const getLastReportNumber = () => {
    for (let i = reportRows.length - 1; i >= 0; i--) {
      const row = reportRows[i];
      if (!row.isNew && row.reportNumber && row.reportNumber !== "************" && row.reportNumber.trim() !== "") {
        return row.reportNumber;
      }
    }
    return "";
  };

  const handleAddNewRow = () => {
    if (!rfiData?.RFI_Numbering) {
      toast.error('❌ شماره RFI نامشخص است');
      return;
    }
    
    const newId = reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1;
    
    let lastRevNumber = '';
    let lastApprovedDays = '';
    let lastReportNumber = '';
    
    if (reportRows.length > 0) {
      const lastRow = reportRows[reportRows.length - 1];
      if (lastRow.revNumber === 'multipart') {
        lastRevNumber = 'multipart';
        lastApprovedDays = lastRow.approvedDays || '';
      } else {
        lastRevNumber = '';
      }
      lastReportNumber = lastRow.reportNumber || '';
    }
    
    const newRow = {
      id: newId,
      reportNumber: lastReportNumber,
      revNumber: lastRevNumber,
      status: "5",
      statusEnglish: "approved",
      corrections: "",
      receivedDate: convertToPersianDate(new Date()),
      approvedDays: lastApprovedDays,
      unitNumber: "",
      vendorName: rfiData?.VendorName || "",
      irn: "",
      srn: "",
      firstPrice: "80000000",
      rfiNumbering: rfiData?.RFI_Numbering || "",
      issueDate: new Date().toISOString().split("T")[0],
      isNew: true,
      needsUpdate: false,
      _loading: false,
      originalApprovedDays: undefined
    };
    
    const newRows = [...reportRows, newRow];
    setReportRows(newRows);
    setHasRowAddition(true);
    updateDuplicateStatus(newRows);
    
    toast.info('📝 سطر جدید اضافه شد. لطفاً شماره گزارش را ویرایش کنید');
  };

  const handleCopyRow = (id) => {
    const rowToCopy = reportRows.find(row => row.id === id);
    if (!rowToCopy) {
      toast.error('❌ ردیف مورد نظر یافت نشد');
      return;
    }
    if (!rfiData?.RFI_Numbering) {
      toast.error('❌ شماره RFI نامشخص است');
      return;
    }
    
    const newId = Math.max(...reportRows.map(r => r.id), 0) + 1;
    
    let newRevNumber = '';
    let newApprovedDays = '';
    
    if (rowToCopy.revNumber === 'multipart') {
      newRevNumber = 'multipart';
      newApprovedDays = rowToCopy.approvedDays || '';
    } else {
      newRevNumber = '';
    }
    
    const newRow = { 
      ...rowToCopy, 
      id: newId, 
      reportNumber: rowToCopy.reportNumber,
      revNumber: newRevNumber,
      approvedDays: newApprovedDays,
      isNew: true, 
      needsUpdate: false, 
      _loading: false, 
      _saved: false, 
      originalApprovedDays: undefined 
    };
    
    const newRows = [...reportRows, newRow];
    setReportRows(newRows);
    setHasRowAddition(true);
    updateDuplicateStatus(newRows);
    
    toast.info('📝 سطر کپی شد. لطفاً شماره گزارش را ویرایش کنید');
  };

  const handleDeleteRow = (id) => {
    const rowToDelete = reportRows.find((row) => row.id === id);
    const hasExistingReport = reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0;
    if (hasExistingReport) {
      setSelectedReportForDelete({ reportNumber: reportInfo.Report_No, rfiNumbering: reportInfo.RFI_Numbering || rfiData?.RFI_Numbering, rowId: id });
      setShowDeleteConfirm(true);
    } else {
      const newRows = reportRows.filter((row) => row.id !== id);
      setReportRows(newRows);
      if (reportRows.length === 1) setTimeout(() => onClose(), 100);
      updateDuplicateStatus(newRows);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedReportForDelete) return;
    deleteReport(selectedReportForDelete.reportNumber, {
      onSuccess: () => { setTimeout(() => onClose(), 300); setSelectedReportForDelete(null); setShowDeleteConfirm(false); },
      onError: (error) => { setSelectedReportForDelete(null); setShowDeleteConfirm(false); }
    });
  };

  const handleRowChange = (id, field, value) => {
    if (field === "revNumber") {
      setReportRows(prevRows => prevRows.map(row => row.id === id ? { ...row, revNumber: value } : row));
      const targetRow = reportRows.find(row => row.id === id);
      if (targetRow && targetRow.isNew) {
        if (value && value !== '') {
          setReportRows(prevRows => applyRevTypeLogicWithDays(id, value, prevRows));
        }
      } else if (targetRow && !targetRow.isNew) {
        setReportRows(prevRows => applyRevTypeLogicWithDays(id, value, prevRows));
      }
    } else {
      setReportRows(prevRows => {
        const updatedRows = prevRows.map((row) => {
          if (row.id === id) {
            if (field === "status") {
              const selectedOption = statusOptions.find((opt) => opt.value === value);
              const englishStatus = selectedOption?.textValue || value;
              return { ...row, [field]: value, statusEnglish: englishStatus, ...(englishStatus !== "Objection" && { corrections: "" }) };
            }
            if (field === "approvedDays") {
              if (value === "" || value === null || value === undefined) return { ...row, [field]: "" };
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue) && numValue >= 0) return { ...row, [field]: numValue };
              return row;
            }
            return { ...row, [field]: value };
          }
          return row;
        });
        
        if (field === "reportNumber") {
          setTimeout(() => {
            updateDuplicateStatus(updatedRows);
          }, 0);
        }
        
        return updatedRows;
      });
    }
  };

  const checkForChanges = () => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    const current = { reportRows: reportRows.map((row) => ({ ...row, receivedDate: row.receivedDate?.format?.() || row.receivedDate })) };
    if (initial.reportRows.length !== current.reportRows.length) return true;
    for (let i = 0; i < initial.reportRows.length; i++) {
      const initialRow = initial.reportRows[i];
      const currentRow = current.reportRows[i];
      const fields = ["reportNumber", "revNumber", "status", "corrections", "receivedDate", "approvedDays", "unitNumber", "vendorName", "irn", "srn", "firstPrice", "rfiNumbering"];
      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) return true;
      }
    }
    if (hasRowAddition) return true;
    return false;
  };

  useEffect(() => {
    if (initialDataRef.current) setHasChanges(checkForChanges());
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
    initialDataRef.current = { reportRows: reportRows.map((row) => ({ ...row, receivedDate: row.receivedDate?.format?.() || row.receivedDate, approvedDays: typeof row.approvedDays === "number" ? row.approvedDays.toString() : row.approvedDays, isNew: false, needsUpdate: false, originalApprovedDays: undefined })) };
    setHasRowAddition(false);
    setNewlyAddedRows([]);
    setRowsToUpdate([]);
    setHasChanges(false);
    setTimeout(() => onClose(), 750);
  };

  const validateForm = () => {
    const hasDuplicate = Object.keys(duplicateReportNumbers).length > 0;
    if (hasDuplicate) {
      toast.error("❌ شماره گزارش تکراری است. لطفاً شماره‌های تکراری را اصلاح کنید");
      return false;
    }
    
    if (reportRows.length === 0) { toast.error("❌ حداقل یک ردیف گزارش باید وجود داشته باشد"); return false; }
    for (const row of reportRows) {
      if (!row.reportNumber || !row.reportNumber.trim()) { toast.error("❌ شماره گزارش الزامی است"); return false; }
      if (!row.status) handleRowChange(row.id, "status", "5");
      if (row.statusEnglish === "Objection" && (!row.corrections || !row.corrections.trim())) { toast.error('❌ برای وضعیت "نیاز به اصلاحات"، شرح نظرات الزامی است'); return false; }
      if (row.approvedDays !== "" && row.approvedDays != null) {
        const daysValue = typeof row.approvedDays === "string" ? row.approvedDays.trim() : row.approvedDays.toString();
        if (daysValue !== "") {
          const days = parseInt(daysValue, 10);
          if (isNaN(days) || days < 0) { toast.error("❌ تعداد روز تأیید باید عدد مثبت باشد"); return false; }
        }
      }
    }
    return true;
  };

  const isSubmittingRef = useRef(false);

  const handleSubmitInternal = () => {
    if (isSubmittingRef.current) {
      console.log('⏳ در حال حاضر در حال ذخیره‌سازی هستیم، صرف نظر می‌شود');
      return;
    }
    
    if (!validateForm()) return;
    
    isSubmittingRef.current = true;
    
    const isValueChanged = (oldVal, newVal) => {
      const normalize = (val) => {
        if (val === null || val === undefined) return "";
        if (typeof val === "number") return val.toString();
        return String(val).trim();
      };
      return normalize(oldVal) !== normalize(newVal);
    };
    
    const newRows = [];
    const changedRows = [];
    
    for (const row of reportRows) {
      const initialRow = initialDataRef.current?.reportRows?.find(r => 
        r.id === row.id || r.reportNumber === row.reportNumber
      );
      
      const isNewRow = row.isNew === true;
      const isPlaceholderReport = row.reportNumber === "************";
      const hasNoReportNumber = !row.reportNumber || row.reportNumber.trim() === "";
      const wasPlaceholder = initialRow?.reportNumber === "************";
      const nowHasRealNumber = !isPlaceholderReport && row.reportNumber && row.reportNumber.trim() !== "";
      
      if (isNewRow || isPlaceholderReport || hasNoReportNumber || (wasPlaceholder && nowHasRealNumber)) {
        newRows.push(row);
        continue;
      }
      
      if (!initialRow) {
        newRows.push(row);
        continue;
      }
      
      const hasChanges = 
        isValueChanged(initialRow.reportNumber, row.reportNumber) ||
        isValueChanged(initialRow.revNumber, row.revNumber) ||
        isValueChanged(initialRow.status, row.status) ||
        isValueChanged(initialRow.corrections, row.corrections) ||
        !areValuesEqual(initialRow.receivedDate, row.receivedDate) ||
        isValueChanged(initialRow.approvedDays, row.approvedDays) ||
        isValueChanged(initialRow.unitNumber, row.unitNumber) ||
        isValueChanged(initialRow.vendorName, row.vendorName) ||
        isValueChanged(initialRow.irn, row.irn) ||
        isValueChanged(initialRow.srn, row.srn);
      
      if (hasChanges) {
        changedRows.push(row);
      }
    }
    
    const totalOperations = newRows.length + changedRows.length;
    
    if (totalOperations === 0) {
      toast('هیچ تغییری برای ذخیره وجود ندارد', { position: 'top-center', duration: 3000, icon: 'ℹ️' });
      isSubmittingRef.current = false;
      return;
    }
    
    let completedCount = 0;
    let hasError = false;
    
    const onComplete = () => {
      completedCount++;
      if (completedCount === totalOperations) {
        if (hasError) {
          toast.error('برخی از عملیات با خطا مواجه شدند');
        } else {
          setTimeout(() => handleSuccess(), 500);
        }
        isSubmittingRef.current = false;
      }
    };
    
    const onError = (error, rowId, method) => {
      console.error(`❌ ${method} سطر ${rowId} خطا:`, error);
      hasError = true;
      onComplete();
    };
    
    for (const row of newRows) {
      const reportData = prepareReportData(row);
      createReport(
        { reportData: reportData, rfiNumbering: rfiData?.RFI_Numbering || row.rfiNumbering },
        { onSuccess: () => onComplete(), onError: (error) => onError(error, row.id, 'POST') }
      );
    }
    
    for (const row of changedRows) {
      const reportData = prepareReportData(row);
      updateReport(
        { reportData: reportData, rfiNumbering: rfiData?.RFI_Numbering || row.rfiNumbering },
        { onSuccess: () => onComplete(), onError: (error) => onError(error, row.id, 'PUT') }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const duplicates = checkDuplicateReportNumbers(reportRows);
    if (Object.keys(duplicates).length > 0) {
      toast.error("❌ شماره گزارش تکراری است. لطفاً شماره‌های تکراری را اصلاح کنید");
      return;
    }
    
    let hasAnyChange = hasRowAddition;
    
    if (!hasAnyChange && initialDataRef.current) {
      for (const row of reportRows) {
        if (row.isNew) {
          hasAnyChange = true;
          break;
        }
        
        const initialRow = initialDataRef.current.reportRows?.find(r => 
          r.reportNumber === row.reportNumber || 
          (row.reportNumber !== "************" && r.reportNumber === "************")
        );
        
        if (initialRow) {
          if (
            initialRow.reportNumber !== row.reportNumber ||
            initialRow.revNumber !== row.revNumber ||
            initialRow.status !== row.status ||
            initialRow.corrections !== row.corrections ||
            !areValuesEqual(initialRow.receivedDate, row.receivedDate) ||
            initialRow.approvedDays !== row.approvedDays ||
            initialRow.unitNumber !== row.unitNumber ||
            initialRow.vendorName !== row.vendorName ||
            initialRow.irn !== row.irn ||
            initialRow.srn !== row.srn
          ) {
            hasAnyChange = true;
            break;
          }
        } else if (row.reportNumber && row.reportNumber !== "************") {
          hasAnyChange = true;
          break;
        }
      }
    }
    
    if (!hasAnyChange && initialDataRef.current) {
      for (const initialRow of initialDataRef.current.reportRows) {
        if (initialRow.reportNumber === "************") {
          const currentRow = reportRows.find(r => r.id === initialRow.id);
          if (currentRow && currentRow.reportNumber !== "************") {
            hasAnyChange = true;
            break;
          }
        }
      }
    }
    
    if (!hasAnyChange) {
      toast('هیچ تغییری برای ذخیره وجود ندارد', { position: 'top-center', duration: 3000, icon: 'ℹ️' });
      return;
    }
    
    if (hasChanges) {
      setShowSaveConfirm(true);
    } else {
      handleSubmitInternal();
    }
  };
  
  const handleCancelInternal = () => onClose();
  const handleCancel = () => { if (hasChanges) setShowCancelConfirm(true); else onClose(); };

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
          if (exactMatch) initialStatusValue = exactMatch;
          else {
            const caseInsensitiveMatch = Object.values(statusesData).find(
              status => status.toLowerCase() === englishStatus.toLowerCase()
            );
            if (caseInsensitiveMatch) initialStatusValue = caseInsensitiveMatch;
            else {
              const partialMatch = Object.values(statusesData).find(
                status => status.toLowerCase().includes(englishStatus.toLowerCase()) ||
                          englishStatus.toLowerCase().includes(status.toLowerCase())
              );
              initialStatusValue = partialMatch || Object.values(statusesData)[0];
            }
          }
        }
        
        let revNoValue = reportSource.RevNO || "";
        if (revNoValue === "Rev") revNoValue = "rev";
        if (revNoValue === "Multipart") revNoValue = "multipart";
        
        const initialRow = {
          id: 1,
          reportNumber: reportSource.Report_No || "",
          revNumber: revNoValue,
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
          originalApprovedDays: undefined
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
            originalApprovedDays: undefined
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
          originalApprovedDays: undefined
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
            originalApprovedDays: undefined
          }],
        };
      }
      setHasChanges(false);
      
      setTimeout(() => {
        updateDuplicateStatus(reportRows);
      }, 100);
    }
  }, [isOpen, rfiData, reportInfo, nextIRN, statusesData]);

  if (!isOpen) return null;
  const isLoading = isReportLoading || isUpdating || isCreating || statusesLoading;

  const isReportNumberDuplicate = (rowId) => duplicateReportNumbers[rowId] === true;

  const shouldShowOrangeBorder = (row) => {
    if (!row.isNew) return false;
    const isDuplicate = isReportNumberDuplicate(row.id);
    const lastReportNumber = getLastReportNumber();
    if (isDuplicate) return true;
    if (lastReportNumber === row.reportNumber && row.isNew && row.reportNumber && row.reportNumber !== "************") {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-blue-500 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {rfiData?.Report_No === "************" || !rfiData?.Report_No ? "📝 ثبت گزارش جدید" : "✏️ ویرایش گزارش"} - شماره {rfiData?.RFI_Numbering || "نامشخص"}
                </h3>
              </div>
            </div>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition duration-200" title="بستن" disabled={isLoading}>
            <FaTimes className="text-lg" />
          </button>
        </div>

        {error && error.response?.status !== 404 && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2"><FaExclamationTriangle /> خطا در دریافت اطلاعات: {error.message}</p>
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
              <button type="button" onClick={handleAddNewRow} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading}>
                <FaPlusCircle className="text-base" /> افزودن گزارش
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
              <div className="min-w-[1500px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
                      {/* <th className="p-3 text-right font-bold text-white text-xs min-w-[180px]">شماره گزارش *</th> */}
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[200px] w-[200px]">شماره گزارش *</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[90px]">نوع گزارش</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[130px]">وضعیت</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[350px]">نظرات <span className="text-yellow-300 text-xs">*</span></th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[120px]">تاریخ دریافت</th>
                      <th className="p-3 text-right font-bold text-white text-xs min-w-[160px]">نام وندور</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>تائید‌شده(روز)</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>شماره واحد</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>IRN</th>
                      <th className="p-3 text-right font-bold text-white text-xs" style={{ width: "8%" }}>SRN</th>
                      {reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 && <th className="p-3 text-right font-bold text-white text-xs" style={{ width: '6%' }}>عملیات</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row, index) => {
                      const showOrangeBorder = shouldShowOrangeBorder(row);
                      const isDuplicate = isReportNumberDuplicate(row.id);
                      return (
                        <tr key={row.id} className={`border-b border-gray-200 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
<td className="p-3 min-w-[200px] w-[200px]">
  <div className="relative">
    <input 
      type="text" 
      value={row.reportNumber} 
      onChange={(e) => handleRowChange(row.id, "reportNumber", e.target.value)} 
      className={`w-full px-3 py-2 text-gray-800 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        showOrangeBorder ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300' : 'border-gray-300'
      }`}
      placeholder="مثال: FAH-INS-APGT-0766" 
      disabled={isLoading || row._loading} 
      required 
    />
    {row._loading && <div className="absolute left-2 top-1/2 transform -translate-y-1/2"><FaSync className="animate-spin text-blue-500 text-xs" /></div>}
    {showOrangeBorder && (
      <div className="absolute left-0 -ml-5 top-1/2 transform -translate-y-1/2 text-orange-500 text-xs" title="نیاز به ویرایش شماره گزارش">
        ⚠️
      </div>
    )}
  </div>
</td>

                          <td className="p-3 min-w-[90px] text-gray-800">
                            <select value={row.revNumber || ""} onChange={(e) => handleRowChange(row.id, "revNumber", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isLoading || row._loading}>
                              <option value="">-</option>
                              <option value="rev">Rev</option>
                              <option value="multipart">Multipart</option>
                            </select>
                          </td>
                          <td className="p-3 min-w-[130px] text-gray-800">
                            <select value={row.status} onChange={(e) => handleRowChange(row.id, "status", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isLoading}>
                              <option value="">انتخاب وضعیت</option>
                              {statusOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                            </select>
                          </td>
                          <td className="p-3 min-w-[350px] align-middle text-gray-800">
                            <textarea value={row.corrections} onChange={(e) => handleRowChange(row.id, "corrections", e.target.value)} className="w-full px-3 py-2 text-xs border-gray-300 focus:ring-blue-500 border rounded-md focus:ring-2 focus:border-transparent resize-y overflow-auto" placeholder="شرح نظرات (اختیاری)" disabled={isLoading} rows="2" />
                          </td>
                          <td className="p-3 min-w-[120px] text-gray-800">
                            <DatePicker value={row.receivedDate} onChange={(date) => handleRowChange(row.id, "receivedDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={isLoading} />
                          </td>
                          <td className="p-3 min-w-[160px] text-gray-800">
                            <TableSearchableSelect value={row.vendorName} onChange={(value) => handleRowChange(row.id, "vendorName", value)} options={vendorOptions} placeholder={vendorsLoading ? "در حال دریافت..." : "انتخاب وندور"} disabled={vendorsLoading || isLoading} />
                          </td>
                          <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                            <input type="number" value={row.approvedDays !== undefined && row.approvedDays !== "" ? row.approvedDays : ""} onChange={(e) => { const value = e.target.value; if (value === "") handleRowChange(row.id, "approvedDays", ""); else { const numValue = parseInt(value, 10); if (!isNaN(numValue) && numValue >= 0) handleRowChange(row.id, "approvedDays", numValue); } }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="تعداد روز" min="0" disabled={isLoading} />
                          </td>
                          <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                            <input type="text" value={row.unitNumber} onChange={(e) => handleRowChange(row.id, "unitNumber", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="شماره واحد" disabled={isLoading} />
                          </td>
                          <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                            <input type="text" value={row.irn} onChange={(e) => handleRowChange(row.id, "irn", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="IRN" disabled={isLoading} />
                          </td>
                          <td className="p-3 text-gray-800" style={{ width: "8%" }}>
                            <input type="text" value={row.srn} onChange={(e) => handleRowChange(row.id, "srn", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="SRN" disabled={isLoading} />
                          </td>
                          {reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 && (
                            <td className="p-3" style={{ width: '6%' }}>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => handleCopyRow(row.id)} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-100 transition duration-200" title="کپی سطر" disabled={isLoading || row._loading}><FaCopy className="text-xs" /></button>
                                <button type="button" onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-100 transition duration-200" title="حذف سطر" disabled={isLoading || isDeleting}><FaTrash className="text-xs" /></button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4 mb-6">
              {reportRows.map((row, index) => {
                const showOrangeBorder = shouldShowOrangeBorder(row);
                const isDuplicate = isReportNumberDuplicate(row.id);
                return (
                  <div key={row.id} className={`bg-gray-50 rounded-lg border p-4 shadow-sm ${showOrangeBorder ? 'border-orange-400 bg-orange-50' : isDuplicate ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2"><FaFileAlt className="text-blue-500" /><span className="font-semibold">سطر #{index + 1}</span></div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleCopyRow(row.id)} className="text-blue-600 hover:text-blue-800 p-1" title="کپی" disabled={isLoading || row._loading}><FaCopy className="text-sm" /></button>
                        <button type="button" onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:text-red-800 p-1" title="حذف" disabled={isLoading || isDeleting}><FaTrash className="text-sm" /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-xs">
                   
                    <div>
  <span className="text-gray-600 block mb-1">شماره گزارش *</span>
  <div className="relative">
    <input 
      type="text" 
      value={row.reportNumber} 
      onChange={(e) => handleRowChange(row.id, "reportNumber", e.target.value)} 
      className={`w-full px-3 py-2 border rounded-md text-xs ${
        showOrangeBorder ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
      }`}
      placeholder="شماره گزارش" 
      disabled={isLoading || row._loading} 
      required 
    />
    {row._loading && <div className="absolute left-2 top-1/2 transform -translate-y-1/2"><FaSync className="animate-spin text-blue-500 text-xs" /></div>}
    {showOrangeBorder && (
      <div className="absolute -left-5 top-1/2 transform -translate-y-1/2 text-orange-500 text-sm" title="نیاز به ویرایش شماره گزارش">
        ⚠️
      </div>
    )}
  </div>
</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-gray-600 block mb-1">نوع گزارش</span><select value={row.revNumber || ""} onChange={(e) => handleRowChange(row.id, "revNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoading || row._loading}><option value="">-</option><option value="rev">Rev</option><option value="multipart">Multipart</option></select></div>
                        <div><span className="text-gray-600 block mb-1">وضعیت</span><select value={row.status} onChange={(e) => handleRowChange(row.id, "status", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoading}><option value="">انتخاب وضعیت</option>{statusOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></div>
                      </div>
                      <div><span className="text-gray-600 block mb-1">شرح نظرات</span><input type="text" value={row.corrections} onChange={(e) => handleRowChange(row.id, "corrections", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="شرح نظرات" disabled={isLoading} /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-gray-600 block mb-1">تاریخ دریافت</span><DatePicker value={row.receivedDate} onChange={(date) => handleRowChange(row.id, "receivedDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoading} /></div>
                        <div><span className="text-gray-600 block mb-1">نام وندور</span><TableSearchableSelect value={row.vendorName} onChange={(value) => handleRowChange(row.id, "vendorName", value)} options={vendorOptions} placeholder={vendorsLoading ? "در حال دریافت..." : "انتخاب وندور"} disabled={vendorsLoading || isLoading} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-gray-600 block mb-1">تعداد روز</span><input type="number" value={row.approvedDays !== undefined && row.approvedDays !== "" ? row.approvedDays : ""} onChange={(e) => { const value = e.target.value; if (value === "") handleRowChange(row.id, "approvedDays", ""); else { const numValue = parseInt(value, 10); if (!isNaN(numValue) && numValue >= 0) handleRowChange(row.id, "approvedDays", numValue); } }} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="تعداد روز" min="0" disabled={isLoading} /></div>
                        <div><span className="text-gray-600 block mb-1">شماره واحد</span><input type="text" value={row.unitNumber} onChange={(e) => handleRowChange(row.id, "unitNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="شماره واحد" disabled={isLoading} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-gray-600 block mb-1">IRN</span><input type="text" value={row.irn} onChange={(e) => handleRowChange(row.id, "irn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="IRN" disabled={isLoading} /></div>
                        <div><span className="text-gray-600 block mb-1">SRN</span><input type="text" value={row.srn} onChange={(e) => handleRowChange(row.id, "srn", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="SRN" disabled={isLoading} /></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <><FaSync className="animate-spin text-lg" /> در حال ذخیره...</> : (reportInfo && reportInfo.IDRE && reportInfo.IDRE > 0 ? <><FaCheckCircle className="text-lg" /> بروزرسانی گزارش</> : <><FaCheckCircle className="text-lg" /> ثبت گزارش جدید</>)}
              </button>
              <button type="button" onClick={handleCancel} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                <FaArrowRight className="text-lg transform rotate-180" /> انصراف
              </button>
            </div>
          </form>
        )}
      </div>

      <ConfirmationPopover isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} onConfirm={handleSubmitInternal} title="تغییرات ذخیره نشده" message="آیا از ذخیره‌سازی تغییرات ایجاد شده در گزارش اطمینان دارید؟" type="warning" confirmText="بله، ذخیره کن" cancelText="انصراف" />
      <ConfirmationPopover isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} onConfirm={handleCancelInternal} title="انصراف از تغییرات" message="تغییرات ایجاد شده در گزارش ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید انصراف دهید؟" type="info" confirmText="بله، انصراف بده" cancelText="بازگشت" />
      <DeleteConfirmationPopover isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedReportForDelete(null); }} onConfirm={handleConfirmDelete} reportNumber={selectedReportForDelete?.reportNumber || ""} rfiNumbering={selectedReportForDelete?.rfiNumbering || ""} title="حذف گزارش از سیستم" message="این عمل گزارش را به طور کامل از سیستم حذف می‌کند و قابل بازگشت نیست. آیا مطمئن هستید؟" confirmText={isDeleting ? "در حال حذف..." : "بله، حذف شود"} cancelText="انصراف" isLoading={isDeleting} />
    </div>
  );
};

export default AddReportModal;