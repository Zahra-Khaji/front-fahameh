// src/components/ui/NotificationInfoModal/NotificationInfoModal.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FaTimes,
  FaHashtag,
  FaCheckCircle,
  FaUserTie,
  FaComment,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSave,
  FaBuilding,
  FaClock,
  FaUser,
  FaFolder,
  FaPlusCircle,
  FaCopy,
  FaTrash,
  FaMoneyBillWave,
  FaSync,
  FaExclamationTriangle,
  FaEdit,
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
  useNotificationInfo,
  useUpdateNotification,
  useNotificationStatuses,
  useUpdateNotificationRow,
  useUpdateNotificationInfoRow,
  useDeleteNotificationDate,
  useDeleteInspectionDate,
  useAddInspectionDate
} from "../../../hooks/useNotificationNumber";
import { useInspectors } from "../../../hooks/useInspectors";
import { useVendors } from "../../../hooks/useVendors";
import { toast } from "react-hot-toast";

import {
  getNotificationStatusInPersian,
  transformNotificationStatuses,
  getEnglishNotificationStatus,
  getNotificationStatusCode,
  toNumber,
  parseApproveManday,
  extractNumber,
} from "../../../utils/helpers";
import RowSaveConfirmationPopover from "./RowSaveConfirmationPopover";
import NotificationRowSaveConfirmationPopover from "./NotificationRowSaveConfirmationPopover";
import DeleteConfirmationPopover from "./DeleteConfirmationPopover";
import TableSearchableSelect from "../TableSearchableSelect";

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

const NotificationInfoModal = ({ isOpen, onClose, rfiNumber }) => {
  const {
    data: notificationData,
    isLoading,
    error,
  } = useNotificationInfo(rfiNumber);
  const { data: statusesData, isLoading: statusesLoading } = useNotificationStatuses();
  const { mutate: updateNotification, isLoading: isUpdating } = useUpdateNotification();
  const { mutate: updateNotificationRow, isLoading: isUpdatingRow } = useUpdateNotificationRow();
  const { mutate: updateNotificationInfoRow, isLoading: isUpdatingInfoRow } = useUpdateNotificationInfoRow();
  const { mutate: deleteNotificationDate, isLoading: isDeletingNotificationDate } = useDeleteNotificationDate();

  const {
    data: inspectors,
    isLoading: inspectorsLoading,
    error: inspectorsError
  } = useInspectors();

  const {
    data: vendors,
    isLoading: vendorsLoading,
    error: vendorsError
  } = useVendors(false);

  const vendorOptions = useMemo(() => {
    return vendors?.map((vendor) => ({
      label: vendor.name,
      value: vendor.name,
    })) || [];
  }, [vendors]);

  const inspectorSearchOptions = useMemo(() => {
    return inspectors?.map((inspector) => ({
      value: inspector.name,
      label: inspector.name,
    })) || [];
  }, [inspectors]);

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRowSaveConfirm, setShowRowSaveConfirm] = useState(false);
  const [selectedRowForSave, setSelectedRowForSave] = useState(null);
  const [rowToSaveData, setRowToSaveData] = useState(null);
  const [showNotificationRowSaveConfirm, setShowNotificationRowSaveConfirm] = useState(false);
  const [selectedNotificationRowForSave, setSelectedNotificationRowForSave] = useState(null);
  const [notificationRowToSaveData, setNotificationRowToSaveData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

  const { mutate: deleteInspectionDate, isLoading: isDeleting } = useDeleteInspectionDate();
  const { mutate: addInspectionDate, isLoading: isAddingInspectionDate } = useAddInspectionDate();

  const initialDataRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [notificationRows, setNotificationRows] = useState([]);
  const [rfiDatesRows, setRfiDatesRows] = useState([]);
  const [showDeleteNotificationConfirm, setShowDeleteNotificationConfirm] = useState(false);
  const [notificationRowToDelete, setNotificationRowToDelete] = useState(null);

  const statusOptions = useMemo(() => transformNotificationStatuses(statusesData), [statusesData]);
  const inspectorTypeOptions = [
    { value: "فریلنسر", label: "فریلنسر" },
    { value: "بازرس داخلی", label: "بازرس داخلی" },
  ];

  const convertToPersianDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return new DateObject({ date: today, calendar: persian, locale: persian_fa });
    }
    try {
      const date = new Date(dateString);
      return new DateObject({ date: date, calendar: persian, locale: persian_fa });
    } catch (err) {
      const today = new Date();
      return new DateObject({ date: today, calendar: persian, locale: persian_fa });
    }
  };

  const areValuesEqual = (val1, val2) => {
    if (val1 instanceof DateObject && val2 instanceof DateObject) {
      return val1.format() === val2.format();
    }
    const str1 = String(val1 || '');
    const str2 = String(val2 || '');
    if (str1 === '' && str2 === '') return true;
    const extractNumbers = (str) => {
      return str
        .replace(/[٬،,\.\s]/g, '')
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
        .match(/\d+/g);
    };
    const nums1 = extractNumbers(str1);
    const nums2 = extractNumbers(str2);
    if (nums1 && nums2 && nums1.length === 1 && nums2.length === 1) {
      return parseInt(nums1[0]) === parseInt(nums2[0]);
    }
    return str1 === str2;
  };

  const checkForChanges = () => {
    if (!initialDataRef.current) return false;
    const initial = initialDataRef.current;
    const current = {
      notificationRows: notificationRows.map((row) => ({
        ...row,
        receivedDate: row.receivedDate?.format?.() || row.receivedDate,
        inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
      })),
      rfiDatesRows: rfiDatesRows.map((row) => ({
        ...row,
        inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
      })),
    };
    if (initial.notificationRows.length !== current.notificationRows.length) return true;
    for (let i = 0; i < initial.notificationRows.length; i++) {
      const initialRow = initial.notificationRows[i];
      const currentRow = current.notificationRows[i];
      const fields = [
        "notificationNumber", "status", "statusCode", "statusEnglish", "inspectorType",
        "description", "receivedDate", "location", "inspectionDate", "vendorName",
        "duration", "inspectorName", "remark", "folderNumber", "material",
        "goodsDescription", "qty3rdPartyInspector", "approvedDuration", "projectType", "rfiStatus",
      ];
      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) return true;
      }
    }
    if (initial.rfiDatesRows.length !== current.rfiDatesRows.length) return true;
    for (let i = 0; i < initial.rfiDatesRows.length; i++) {
      const initialRow = initial.rfiDatesRows[i];
      const currentRow = current.rfiDatesRows[i];
      const fields = ["inspectionDate", "approveManday", "inspectorName", "fee"];
      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) return true;
      }
    }
    return false;
  };

  const handleAddNewRow = () => {
    const lastRow = rfiDatesRows.length > 0 ? rfiDatesRows[rfiDatesRows.length - 1] : null;
    const newId = Math.max(...rfiDatesRows.map(r => r.id), 0) + 1;
    let newDate;
    if (lastRow && lastRow.inspectionDate) {
      if (lastRow.inspectionDate instanceof DateObject) {
        newDate = new DateObject(lastRow.inspectionDate);
      } else {
        newDate = convertToPersianDate(lastRow.inspectionDate);
      }
    } else {
      newDate = new DateObject({ date: new Date(), calendar: persian, locale: persian_fa });
    }
    setRfiDatesRows(prevRows => [...prevRows, {
      id: newId,
      inspectionDate: newDate,
      approveManday: lastRow?.approveManday || "-",
      inspectorName: lastRow?.inspectorName || "",
      fee: lastRow?.fee || "",
      isNew: true,
      isPersisted: false
    }]);
    setHasChanges(true);
  };

  const handleCopyRow = (rowId) => {
    const rowToCopy = rfiDatesRows.find((r) => r.id === rowId);
    if (!rowToCopy) {
      toast.error("❌ ردیف مورد نظر یافت نشد");
      return;
    }
    const newId = Math.max(...rfiDatesRows.map(r => r.id), 0) + 1;
    let newDate;
    if (rowToCopy.inspectionDate instanceof DateObject) {
      newDate = new DateObject(rowToCopy.inspectionDate);
    } else {
      newDate = convertToPersianDate(rowToCopy.inspectionDate);
    }
    setRfiDatesRows(prevRows => [...prevRows, {
      id: newId,
      inspectionDate: newDate,
      approveManday: rowToCopy.approveManday,
      inspectorName: rowToCopy.inspectorName,
      fee: rowToCopy.fee,
      isNew: true,
      isPersisted: false
    }]);
    setHasChanges(true);
  };

  const handleDeleteRow = (rowId) => {
    const row = rfiDatesRows.find((r) => r.id === rowId);
    if (!row) {
      toast.error("❌ ردیف مورد نظر یافت نشد");
      return;
    }
    const inspectionDate = row.inspectionDate?.format?.() || row.inspectionDate;
    const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
    setSelectedRowForDelete({ rowId, inspectionDate, rfiNumbering, rawData: row });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedRowForDelete) return;
    deleteInspectionDate({
      rfiNumbering: selectedRowForDelete.rfiNumbering,
      inspectionDate: selectedRowForDelete.inspectionDate
    }, {
      onSuccess: () => {
        setRfiDatesRows(prevRows => prevRows.filter(row => row.id !== selectedRowForDelete.rowId));
        setShowDeleteConfirm(false);
        setSelectedRowForDelete(null);
        if (initialDataRef.current) {
          initialDataRef.current = {
            ...initialDataRef.current,
            rfiDatesRows: rfiDatesRows.filter(row => row.id !== selectedRowForDelete.rowId).map(row => ({
              ...row,
              inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
            })),
          };
        }
        setHasChanges(checkForChanges());
      },
      onError: (error) => {
        console.error('❌ Delete failed:', error);
        setShowDeleteConfirm(false);
        setSelectedRowForDelete(null);
      }
    });
  };

  const handleSaveNotificationRow = (rowId) => {
    const row = notificationRows.find((r) => r.id === rowId);
    if (!row) {
      toast.error("❌ ردیف مورد نظر یافت نشد");
      return;
    }
    const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
    const rowData = {
      notificationNumber: row.notificationNumber,
      rfiStatus: row.rfiStatus || row.statusEnglish || "Ongoing",
      inspectorType: row.inspectorType || "فریلنسر",
      goodsDescription: row.goodsDescription || row.description || "",
      receivedDate: row.receivedDate,
      location: row.location || "",
      inspectionDate: row.inspectionDate,
      vendorName: row.vendorName || "",
      approvedDuration: row.approvedDuration || "0",
      inspectorName: row.inspectorName || "",
      remark: row.remark || "",
      folderNumber: row.folderNumber || "",
      duration: row.duration || "0",
    };
    setSelectedNotificationRowForSave(rowId);
    setNotificationRowToSaveData(rowData);
    setShowNotificationRowSaveConfirm(true);
  };

  const handleConfirmNotificationRowSave = () => {
    if (!selectedNotificationRowForSave || !notificationRowToSaveData) return;
    const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
    const rowPayload = { rfiNumber: rfiNumbering, rowData: notificationRowToSaveData };
    updateNotificationInfoRow(rowPayload, {
      onSuccess: (data) => {
        setShowNotificationRowSaveConfirm(false);
        const savedRowId = selectedNotificationRowForSave;
        setSelectedNotificationRowForSave(null);
        setNotificationRowToSaveData(null);
        if (initialDataRef.current) {
          initialDataRef.current = {
            notificationRows: notificationRows.map((row) => ({
              ...row,
              receivedDate: row.receivedDate?.format?.() || row.receivedDate,
              inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
            })),
            rfiDatesRows: rfiDatesRows.map((row) => ({
              ...row,
              inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
            })),
          };
        }
        setNotificationRows((prevRows) =>
          prevRows.map((row) => row.id === savedRowId ? { ...row, _saved: true, _savedAt: new Date().toISOString() } : row)
        );
        setHasChanges(false);
        toast.success("تغییرات نوتیفیکیشن با موفقیت ذخیره شد");
        setTimeout(() => {
          setNotificationRows((prevRows) => prevRows.map((row) => ({ ...row, _saved: false })));
        }, 3000);
      },
      onError: (error) => {
        console.error("❌ Notification row save failed:", error);
        toast.error(`❌ خطا در ذخیره نوتیفیکیشن: ${error.response?.data?.message || "لطفا مجدد تلاش کنید"}`);
        setShowNotificationRowSaveConfirm(false);
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      let initialNotificationRows = [];
      let initialRfiDatesRows = [];
      if (notificationData) {
        const { timeTable, rfiDates } = notificationData;
        if (timeTable) {
          const englishStatus = timeTable.RFI_Status || "";
          let statusCode = "3";
          let persianStatus = "در حال انجام";
          if (englishStatus === "Done") { statusCode = "2"; persianStatus = "انجام شده"; }
          else if (englishStatus === "Cancel") { statusCode = "1"; persianStatus = "لغو شده"; }
          else if (englishStatus === "Ongoing") { statusCode = "3"; persianStatus = "در حال انجام"; }
          if (statusesData) {
            const entry = Object.entries(statusesData).find(([code, text]) => text === englishStatus);
            if (entry) {
              statusCode = entry[0];
              persianStatus = getNotificationStatusInPersian(entry[0], entry[1]);
            }
          }
          initialNotificationRows = [{
            id: 1,
            notificationNumber: timeTable?.NotificationNo ? `\u200E${timeTable.NotificationNo}` : "",
            status: persianStatus,
            statusCode: statusCode,
            statusEnglish: englishStatus,
            inspectorType: timeTable.Inspector_Type || "فریلنسر",
            goodsDescription: timeTable.Goods_Description || "",
            description: timeTable.Remark || "",
            receivedDate: convertToPersianDate(timeTable.RFI_Recived_Date),
            location: timeTable.InspectionLocation || "",
            inspectionDate: convertToPersianDate(timeTable.InspectionDate),
            vendorName: timeTable.VendorName || "",
            duration: timeTable.Inspection_Duration || "",
            inspectorName: timeTable.Inspector_Name || "",
            folderNumber: timeTable.FolderNo || "",
            material: timeTable.Material || "",
            remark: timeTable.Remark || "",
            qty3rdPartyInspector: timeTable.QTY_3rdpartinspector || "0",
            approvedDuration: timeTable.approved_Duration || "0",
            projectType: timeTable.Over_Domestic || "",
            rfiStatus: englishStatus,
          }];
        } else {
          initialNotificationRows = [{
            id: 1,
            notificationNumber: rfiNumber || "",
            status: "در حال انجام",
            statusCode: "3",
            statusEnglish: "Ongoing",
            inspectorType: "فریلنسر",
            description: "",
            receivedDate: convertToPersianDate(new Date()),
            location: "",
            inspectionDate: convertToPersianDate(new Date()),
            vendorName: "",
            duration: "",
            inspectorName: "",
            remark: "",
            folderNumber: "",
            material: "",
            goodsDescription: "",
            qty3rdPartyInspector: "0",
            approvedDuration: "0",
            projectType: "",
            rfiStatus: "Ongoing",
          }];
        }
        if (rfiDates && rfiDates.length > 0) {
          initialRfiDatesRows = rfiDates.map((item, index) => ({
            id: index + 1,
            inspectionDate: convertToPersianDate(item.RFI_Date),
            approveManday: item.ApproveManday != null && item.ApproveManday !== "" ? Number(item.ApproveManday) : "-",
            inspectorName: item.Inspector_Name || "",
            fee: item.InspectorPrice ? `${item.InspectorPrice.toLocaleString("fa-IR")}` : "",
            idrd: item.IDRD || 0,
          }));
        } else {
          initialRfiDatesRows = [{ id: 1, inspectionDate: convertToPersianDate(new Date()), approveManday: "-", inspectorName: "", fee: "" }];
        }
      } else {
        initialNotificationRows = [{
          id: 1,
          notificationNumber: rfiNumber || "",
          status: "در حال انجام",
          statusCode: "3",
          statusEnglish: "Ongoing",
          inspectorType: "فریلنسر",
          description: "",
          receivedDate: convertToPersianDate(new Date()),
          location: "",
          inspectionDate: convertToPersianDate(new Date()),
          vendorName: "",
          duration: "",
          inspectorName: "",
          remark: "",
          folderNumber: "",
          material: "",
          goodsDescription: "",
          qty3rdPartyInspector: "0",
          approvedDuration: "0",
          projectType: "",
          rfiStatus: "Ongoing",
        }];
        initialRfiDatesRows = [{ id: 1, inspectionDate: convertToPersianDate(new Date()), approveManday: "-", inspectorName: "", fee: "" }];
      }
      setNotificationRows(initialNotificationRows);
      setRfiDatesRows(initialRfiDatesRows);
      initialDataRef.current = {
        notificationRows: initialNotificationRows.map((row) => ({
          ...row,
          receivedDate: row.receivedDate?.format?.() || row.receivedDate,
          inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
        })),
        rfiDatesRows: initialRfiDatesRows.map((row) => ({
          ...row,
          inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
        })),
      };
      setHasChanges(false);
    }
  }, [isOpen, notificationData, rfiNumber, statusesData]);

  useEffect(() => {
    if (initialDataRef.current) setHasChanges(checkForChanges());
  }, [notificationRows, rfiDatesRows]);

  const handleAddNotificationRow = () => {
    const newId = notificationRows.length > 0 ? Math.max(...notificationRows.map((r) => r.id)) + 1 : 1;
    setNotificationRows([...notificationRows, {
      id: newId,
      notificationNumber: "",
      status: "در حال انجام",
      statusCode: "3",
      statusEnglish: "Ongoing",
      inspectorType: "فریلنسر",
      description: "",
      receivedDate: convertToPersianDate(new Date()),
      location: "",
      inspectionDate: convertToPersianDate(new Date()),
      vendorName: notificationRows[0]?.vendorName || "",
      duration: "",
      inspectorName: "",
      remark: "",
      folderNumber: "",
      material: "",
      goodsDescription: "",
      qty3rdPartyInspector: "0",
      approvedDuration: "0",
      projectType: "",
      rfiStatus: "Ongoing",
    }]);
  };

  const handleDeleteNotificationRow = (rowId) => {
    const rowToDelete = notificationRows.find((row) => row.id === rowId);
    if (rowToDelete) {
      setNotificationRowToDelete({
        rowId,
        notificationNumber: rowToDelete.notificationNumber,
        rfiNumbering: notificationData?.timeTable?.RFI_Numbering || rfiNumber,
        date_: "1404/05/09",
      });
      setShowDeleteNotificationConfirm(true);
    }
  };

  const confirmDeleteNotificationRow = () => {
    if (!notificationRowToDelete) return;
    deleteNotificationDate({
      rfiNumbering: notificationRowToDelete.rfiNumbering,
      date_: notificationRowToDelete.date_,
    }, {
      onSuccess: () => {
        setNotificationRows((prevRows) => {
          const newRows = prevRows.filter((row) => row.id !== notificationRowToDelete.rowId);
          if (newRows.length === 0) {
            return [{
              id: 1,
              notificationNumber: "",
              status: "در حال انجام",
              statusCode: "3",
              statusEnglish: "Ongoing",
              inspectorType: "فریلنسر",
              description: "",
              receivedDate: convertToPersianDate(new Date()),
              location: "",
              inspectionDate: convertToPersianDate(new Date()),
              vendorName: "",
              duration: "",
              inspectorName: "",
              remark: "",
              folderNumber: "",
              material: "",
              goodsDescription: "",
              qty3rdPartyInspector: "0",
              approvedDuration: "0",
              projectType: "",
              rfiStatus: "Ongoing",
            }];
          }
          return newRows;
        });
        setShowDeleteNotificationConfirm(false);
        setNotificationRowToDelete(null);
      },
      onError: (error) => {
        setShowDeleteNotificationConfirm(false);
        setNotificationRowToDelete(null);
      }
    });
  };

  const handleCopyNotificationRow = (id) => {
    const rowToCopy = notificationRows.find((row) => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...notificationRows.map((r) => r.id)) + 1;
      setNotificationRows([...notificationRows, { ...rowToCopy, id: newId, notificationNumber: "" }]);
    }
  };

  const handleNotificationRowChange = (id, field, value) => {
    setNotificationRows(notificationRows.map((row) => {
      if (row.id === id) {
        if (field === "status") {
          const selectedOption = statusOptions.find((opt) => opt.label === value);
          if (selectedOption) {
            return {
              ...row,
              status: value,
              statusCode: selectedOption.value,
              statusEnglish: selectedOption.textValue,
              rfiStatus: selectedOption.textValue,
            };
          }
          const code = getNotificationStatusCode(statusesData, value);
          const englishStatus = getEnglishNotificationStatus(statusesData, code);
          return { ...row, status: value, statusCode: code, statusEnglish: englishStatus, rfiStatus: englishStatus };
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handleRfiDatesRowChange = (id, field, value) => {
    setRfiDatesRows(rfiDatesRows.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const validateForm = () => {
    if (notificationRows.length === 0) {
      toast.error("❌ حداقل یک ردیف در جدول نوتیفیکیشن باید وجود داشته باشد");
      return false;
    }
    for (const row of notificationRows) {
      if (!row.notificationNumber.trim()) {
        toast.error("❌ شماره نوتیفیکیشن الزامی است");
        return false;
      }
      if (!row.vendorName.trim()) {
        toast.error("❌ نام وندور الزامی است");
        return false;
      }
    }
    for (const row of rfiDatesRows) {
      if (!row.inspectorName.trim() && row.fee.trim()) {
        toast.error("❌ برای ردیف‌های دارای دستمزد، نام بازرس الزامی است");
        return false;
      }
    }
    return true;
  };

  const handleSubmitInternal = () => {
    if (!validateForm()) return;
    const validNotificationRows = notificationRows.filter(row => row.notificationNumber.trim() !== "" || row.vendorName.trim() !== "");
    const validRfiDatesRows = rfiDatesRows.filter(row => row.inspectorName.trim() !== "" || row.fee.trim() !== "");
    if (validNotificationRows.length === 0) {
      toast.error("❌ هیچ داده‌ای برای ذخیره در جدول نوتیفیکیشن وجود ندارد");
      return;
    }
    updateNotification({
      timeTableRows: validNotificationRows,
      rfiDatesRows: validRfiDatesRows,
      statusesData: statusesData,
    }, {
      onSuccess: () => {
        toast.success("✅ اطلاعات با موفقیت ذخیره شد");
        initialDataRef.current = {
          notificationRows: notificationRows.map((row) => ({
            ...row,
            receivedDate: row.receivedDate?.format?.() || row.receivedDate,
            inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
          })),
          rfiDatesRows: rfiDatesRows.map((row) => ({
            ...row,
            inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
          })),
        };
        setHasChanges(false);
        onClose();
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.message || error.message || "خطای ناشناخته";
        toast.error(`❌ خطا در ذخیره اطلاعات: ${errorMessage}`);
      },
    });
  };

  const displayApproveManday = (value) => {
    if (value == null || value === "" || value === undefined) return "-";
    const numValue = Number(value);
    if (!isNaN(numValue)) return numValue;
    return "-";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasChanges) setShowSaveConfirm(true);
    else handleSubmitInternal();
  };

  const handleCancelInternal = () => onClose();
  const handleCancel = () => {
    if (hasChanges) setShowCancelConfirm(true);
    else onClose();
  };

  const handleSaveRow = (rowId) => {
    const row = rfiDatesRows.find((r) => r.id === rowId);
    if (!row) {
      toast.error("❌ ردیف مورد نظر یافت نشد");
      return;
    }
    const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
    const approveManday = parseApproveManday(row.approveManday);
    const fee = extractNumber(row.fee);
    if (row.isNew && !row.isPersisted) {
      const inspectionDateData = {
        RFI_Numbering: rfiNumbering,
        RFI_Date: row.inspectionDate,
        ApproveManday: approveManday === 0 ? "0" : approveManday.toString(),
        Inspector_Name: row.inspectorName || "",
        InspectorPrice: fee || "0"
      };
      addInspectionDate(inspectionDateData, {
        onSuccess: (data) => {
          setRfiDatesRows(prevRows =>
            prevRows.map(r => r.id === rowId ? { ...r, isNew: false, isPersisted: true, _saved: true, _savedAt: new Date().toISOString() } : r)
          );
          if (initialDataRef.current) {
            initialDataRef.current = {
              ...initialDataRef.current,
              rfiDatesRows: [...initialDataRef.current.rfiDatesRows, {
                ...row,
                isNew: false,
                isPersisted: true,
                inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
                approveManday: row.approveManday,
                inspectorName: row.inspectorName || "",
                fee: row.fee || "",
              }]
            };
          }
          setHasChanges(checkForChanges());
          setTimeout(() => setRfiDatesRows(prevRows => prevRows.map(r => ({ ...r, _saved: false }))), 3000);
        },
        onError: (error) => {
          console.error('❌ Add new row failed:', error);
          toast.error(`❌ خطا در افزودن: ${error.response?.data?.message || "لطفا مجدد تلاش کنید"}`);
        }
      });
    } else {
      const idrd = toNumber(row.idrd, 0);
      setSelectedRowForSave(rowId);
      setRowToSaveData({ approveManday, fee, idrd, rawData: row, rfiNumbering });
      setShowRowSaveConfirm(true);
    }
  };

  const handleConfirmRowSave = () => {
    if (!selectedRowForSave || !rowToSaveData) return;
    const rowPayload = {
      rfiNumber: rowToSaveData.rfiNumbering,
      rowData: {
        approveManday: rowToSaveData.approveManday,
        idrd: rowToSaveData.idrd,
        fee: rowToSaveData.fee,
        inspectorName: rowToSaveData.rawData.inspectorName,
        inspectionDate: rowToSaveData.rawData.inspectionDate,
      },
    };
    updateNotificationRow(rowPayload, {
      onSuccess: (data) => {
        setShowRowSaveConfirm(false);
        const savedRowId = selectedRowForSave;
        setRfiDatesRows((prevRows) =>
          prevRows.map((row) => row.id === savedRowId ? { ...row, _saved: true, _savedAt: new Date().toISOString(), isNew: false, isPersisted: true } : row)
        );
        setSelectedRowForSave(null);
        setRowToSaveData(null);
        if (initialDataRef.current) {
          initialDataRef.current = {
            notificationRows: notificationRows.map((row) => ({
              ...row,
              receivedDate: row.receivedDate?.format?.() || row.receivedDate,
              inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
            })),
            rfiDatesRows: rfiDatesRows.map((row) => {
              if (row.id === savedRowId) {
                return {
                  ...row,
                  isNew: false,
                  isPersisted: true,
                  inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
                  fee: row.fee ? extractNumber(row.fee) : row.fee,
                };
              }
              return {
                ...row,
                inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
                fee: row.fee ? extractNumber(row.fee) : row.fee,
              };
            }),
          };
        }
        setHasChanges(false);
        toast.success("تغییرات با موفقیت ذخیره شد");
        setTimeout(() => setRfiDatesRows((prevRows) => prevRows.map((row) => ({ ...row, _saved: false }))), 3000);
      },
      onError: (error) => {
        console.error("❌ Row save failed:", error);
        toast.error(`❌ خطا در ذخیره: ${error.response?.data?.message || "لطفا مجدد تلاش کنید"}`);
        setShowRowSaveConfirm(false);
      },
    });
  };

  const getDateTimestamp = (date) => {
    if (!date) return 0;
    try {
      if (date && typeof date === "object") {
        if (date.year && date.month && date.day) {
          const persianToEnglish = (num) => {
            if (typeof num === "string") {
              return num.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
            }
            return num;
          };
          const year = parseInt(persianToEnglish(date.year.toString()));
          const month = parseInt(persianToEnglish(date.month.toString()));
          const day = parseInt(persianToEnglish(date.day.toString()));
          return year * 10000 + month * 100 + day;
        }
        if (typeof date.format === "function") {
          const formatted = date.format("YYYYMMDD");
          const englishNumbers = formatted.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
          return parseInt(englishNumbers) || 0;
        }
      }
      return 0;
    } catch (error) {
      return 0;
    }
  };

  const sortedRfiDatesRows = useMemo(() => {
    return [...rfiDatesRows].sort((a, b) => getDateTimestamp(a.inspectionDate) - getDateTimestamp(b.inspectionDate));
  }, [rfiDatesRows]);

  if (!isOpen) return null;
  const isLoadingAll = isLoading || statusesLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaHashtag className="text-gray-700 text-xl" />
              <h3 className="text-lg font-bold text-gray-800">
                اطلاعات نوتیفیکیشن شماره{' '}
                <span>
                  {notificationData?.timeTable?.NotificationNo
                    ? `\u200E${notificationData.timeTable.NotificationNo}`
                    : ''
                  }
                </span>
              </h3>
              {isLoadingAll && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <FaSync className="animate-spin" />
                  در حال دریافت اطلاعات...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            title="بستن"
            disabled={isUpdating}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              خطا در دریافت اطلاعات: {error.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* بخش اول: اطلاعات نوتیفیکیشن */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">اطلاعات نوتیفیکیشن</h4>
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">{notificationRows.length} مورد</span>
              </div>
            </div>

            {/* Desktop Table - نوتیفیکیشن */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
                    <th className="p-3 text-right font-bold text-white text-xs min-w-40">شماره نوتیفیکشن</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">وضعیت</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">نوع بازرس</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-48">توضیحات</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">تاریخ دریافت</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">لوکیشن</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">تاریخ بازرسی</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-32">نام وندور</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-20">مدت</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">نام بازرس</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-32">Remark</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">شماره فولدر</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationRows.map((row, index) => (
                    <tr key={row.id} className={`border-b border-gray-200 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.notificationNumber} onChange={(e) => handleNotificationRowChange(row.id, "notificationNumber", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="شماره نوتیفیکشن" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <select value={row.status} onChange={(e) => handleNotificationRowChange(row.id, "status", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" disabled={isLoadingAll || isUpdating || statusesLoading}>
                          {statusesLoading ? (<option value="">در حال دریافت لیست وضعیت‌ها...</option>) : (<><option value="">انتخاب وضعیت</option>{statusOptions.map((option) => (<option key={option.value} value={option.label}>{option.label}</option>))}</>)}
                        </select>
                      </td>
                      <td className="p-3 text-gray-800">
                        <select value={row.inspectorType} onChange={(e) => handleNotificationRowChange(row.id, "inspectorType", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" disabled={isLoadingAll || isUpdating}>
                          {inspectorTypeOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                        </select>
                      </td>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.goodsDescription || ""} onChange={(e) => handleNotificationRowChange(row.id, "goodsDescription", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="توضیحات" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <DatePicker value={row.receivedDate} onChange={(date) => handleNotificationRowChange(row.id, "receivedDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.location} onChange={(e) => handleNotificationRowChange(row.id, "location", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="شهر" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <DatePicker value={row.inspectionDate} onChange={(date) => handleNotificationRowChange(row.id, "inspectionDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <TableSearchableSelect value={row.vendorName} onChange={(value) => handleNotificationRowChange(row.id, "vendorName", value)} options={vendorOptions} placeholder={vendorsLoading ? "در حال دریافت..." : "انتخاب وندور"} disabled={vendorsLoading || isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.duration} onChange={(e) => handleNotificationRowChange(row.id, "duration", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="مدت" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <TableSearchableSelect value={row.inspectorName} onChange={(value) => handleNotificationRowChange(row.id, "inspectorName", value)} options={inspectorSearchOptions} placeholder={inspectorsLoading ? "در حال دریافت..." : "انتخاب بازرس"} disabled={inspectorsLoading || isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.remark} onChange={(e) => handleNotificationRowChange(row.id, "remark", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="توضیحات تکمیلی" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3 text-gray-800">
                        <input type="text" value={row.folderNumber} onChange={(e) => handleNotificationRowChange(row.id, "folderNumber", e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent" placeholder="شماره فولدر" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <button type="button" onClick={() => handleSaveNotificationRow(row.id)} disabled={isUpdatingInfoRow || isLoadingAll} className={`px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${row._saved ? "bg-green-600" : ""}`} title="ذخیره این سطر">
                            {row._saved ? <><FaCheck className="text-xs" />ذخیره شد</> : <><FaSave className="text-xs" />ذخیره</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - نوتیفیکیشن */}
            <div className="md:hidden space-y-4 mb-6">
              {notificationRows.map((row, index) => (
                <div key={row.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2"><FaHashtag className="text-gray-700" /><span className="font-semibold">سطر #{index + 1}</span></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleCopyNotificationRow(row.id)} className="text-gray-700 hover:text-gray-900 p-1" title="کپی" disabled={isLoadingAll || isUpdating}><FaCopy className="text-sm" /></button>
                      <button type="button" onClick={() => handleDeleteNotificationRow(row.id)} className="text-gray-700 hover:text-gray-900 p-1" title="حذف" disabled={isUpdatingInfoRow || isLoadingAll}><FaTrash className="text-sm" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-600 block mb-1">شماره نوتیفیکشن</span><input type="text" value={row.notificationNumber} onChange={(e) => handleNotificationRowChange(row.id, "notificationNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="شماره" disabled={isLoadingAll || isUpdating} /></div>
                      <div><span className="text-gray-600 block mb-1">وضعیت</span><select value={row.status} onChange={(e) => handleNotificationRowChange(row.id, "status", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoadingAll || isUpdating || statusesLoading}>
                        {statusesLoading ? (<option value="">در حال دریافت...</option>) : (<><option value="">انتخاب وضعیت</option>{statusOptions.map((option) => (<option key={option.value} value={option.label}>{option.label}</option>))}</>)}
                      </select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-600 block mb-1">نوع بازرس</span><select value={row.inspectorType} onChange={(e) => handleNotificationRowChange(row.id, "inspectorType", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoadingAll || isUpdating}>
                        {inspectorTypeOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                      </select></div>
                      <div><span className="text-gray-600 block mb-1">نام وندور</span><TableSearchableSelect value={row.vendorName} onChange={(value) => handleNotificationRowChange(row.id, "vendorName", value)} options={vendorOptions} placeholder={vendorsLoading ? "در حال دریافت..." : "انتخاب وندور"} disabled={vendorsLoading || isLoadingAll || isUpdating} /></div>
                    </div>
                    <div><span className="text-gray-600 block mb-1">توضیحات</span><input type="text" value={row.description} onChange={(e) => handleNotificationRowChange(row.id, "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="توضیحات" disabled={isLoadingAll || isUpdating} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-600 block mb-1">تاریخ دریافت</span><DatePicker value={row.receivedDate} onChange={(date) => handleNotificationRowChange(row.id, "receivedDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoadingAll || isUpdating} /></div>
                      <div><span className="text-gray-600 block mb-1">تاریخ بازرسی</span><DatePicker value={row.inspectionDate} onChange={(date) => handleNotificationRowChange(row.id, "inspectionDate", date)} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" disabled={isLoadingAll || isUpdating} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><span className="text-gray-600 block mb-1">لوکیشن</span><input type="text" value={row.location} onChange={(e) => handleNotificationRowChange(row.id, "location", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="شهر" disabled={isLoadingAll || isUpdating} /></div>
                      <div><span className="text-gray-600 block mb-1">مدت</span><input type="text" value={row.duration} onChange={(e) => handleNotificationRowChange(row.id, "duration", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="مدت" disabled={isLoadingAll || isUpdating} /></div>
                    </div>
                    <div><span className="text-gray-600 block mb-1">نام بازرس</span><TableSearchableSelect value={row.inspectorName} onChange={(value) => handleNotificationRowChange(row.id, "inspectorName", value)} options={inspectorSearchOptions} placeholder={inspectorsLoading ? "در حال دریافت..." : "انتخاب بازرس"} disabled={inspectorsLoading || isLoadingAll || isUpdating} /></div>
                    <div><span className="text-gray-600 block mb-1">شماره فولدر</span><input type="text" value={row.folderNumber} onChange={(e) => handleNotificationRowChange(row.id, "folderNumber", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="123" disabled={isLoadingAll || isUpdating} /></div>
                    <div><span className="text-gray-600 block mb-1">Remark</span><input type="text" value={row.remark} onChange={(e) => handleNotificationRowChange(row.id, "remark", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs" placeholder="توضیحات تکمیلی" disabled={isLoadingAll || isUpdating} /></div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button type="button" onClick={() => handleSaveNotificationRow(row.id)} disabled={isUpdatingInfoRow || isLoadingAll} className={`w-full py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${row._saved ? "bg-green-600" : ""}`}>
                        {row._saved ? <><FaCheck className="text-xs" />تغییرات ذخیره شد</> : <><FaSave className="text-xs" />ذخیره تغییرات این سطر</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* بخش دوم: اطلاعات صورت وضعیت بازرس */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">اطلاعات تاریخ‌های بازرس</h4>
                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{rfiDatesRows.length} مورد</span>
              </div>
              <button type="button" onClick={handleAddNewRow} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAddingInspectionDate || isLoadingAll}>
                {isAddingInspectionDate ? (<FaSync className="animate-spin text-base" />) : (<FaPlusCircle className="text-base" />)}
                {isAddingInspectionDate ? 'در حال افزودن...' : 'افزودن تاریخ جدید'}
              </button>
            </div>

            {/* Desktop Table - صورت وضعیت بازرس */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
                    <th className="p-3 text-right font-bold text-white text-xs min-w-36">شروع تاریخ بازرسی</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-32">تعداد روز تائید شده</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-48">بازرس اول</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-40">دستمزد</th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRfiDatesRows.map((row, index) => (
                    <tr key={row.id} className={`border-b border-gray-200 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}>
                      <td className="p-2 text-gray-800 min-w-36">
                        <DatePicker value={row.inspectionDate} onChange={(date) => handleRfiDatesRowChange(row.id, "inspectionDate", date ? date.format("YYYY-MM-DD") : "")} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      </td>
                      <td className="p-2 text-gray-800 min-w-32">
                        <input type="text" value={displayApproveManday(row.approveManday)} onChange={(e) => { const newValue = e.target.value.trim(); if (newValue === "" || newValue === "-") { handleRfiDatesRowChange(row.id, "approveManday", "-"); } else { const numValue = parseInt(newValue, 10); if (!isNaN(numValue)) { handleRfiDatesRowChange(row.id, "approveManday", numValue); } else { handleRfiDatesRowChange(row.id, "approveManday", row.approveManday); } } }} onFocus={(e) => { if (e.target.value === "-") { e.target.value = ""; } }} onBlur={(e) => { const currentValue = e.target.value.trim(); if (currentValue === "") { e.target.value = "-"; handleRfiDatesRowChange(row.id, "approveManday", "-"); } }} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-200 focus:border-transparent text-center" placeholder="-" disabled={isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-2 text-gray-800 min-w-48">
                        <TableSearchableSelect value={row.inspectorName} onChange={(value) => handleRfiDatesRowChange(row.id, "inspectorName", value)} options={inspectorSearchOptions} placeholder={inspectorsLoading ? "در حال دریافت..." : "انتخاب بازرس"} disabled={inspectorsLoading || isLoadingAll || isUpdating} />
                      </td>
                      <td className="p-2 text-gray-800 min-w-40">
                        <div className="relative"><input type="text" value={row.fee} onChange={(e) => handleRfiDatesRowChange(row.id, "fee", e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-200 focus:border-transparent pl-6" placeholder="مبلغ" disabled={isLoadingAll || isUpdating} /><FaMoneyBillWave className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /></div>
                      </td>
                      <td className="p-2 min-w-28">
                        <div className="flex justify-center gap-1">
                          <button type="button" onClick={() => handleCopyRow(row.id)} className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-100 transition duration-200" title="کپی سطر" disabled={isAddingInspectionDate || isLoadingAll}>{isAddingInspectionDate ? <FaSync className="animate-spin text-xs" /> : <FaCopy className="text-xs" />}</button>
                          <button type="button" onClick={() => handleSaveRow(row.id)} disabled={isUpdatingRow} className={`px-2 py-1.5 text-xs rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${row.isNew && !row.isPersisted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`} title={row.isNew && !row.isPersisted ? "ذخیره سطر جدید" : "ذخیره تغییرات"}><FaSave className="text-xs" />{row.isNew && !row.isPersisted ? "ثبت" : "ذخیره"}</button>
                          <button type="button" onClick={() => handleDeleteRow(row.id)} disabled={isDeleting} className="px-2 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap" title="حذف این سطر"><FaTrash className="text-xs" />حذف</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - صورت وضعیت بازرس */}
            <div className="md:hidden space-y-4">
              <div className="flex justify-end">
                <button type="button" onClick={handleAddNewRow} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isAddingInspectionDate || isLoadingAll}>
                  {isAddingInspectionDate ? (<FaSync className="animate-spin text-base" />) : (<FaPlusCircle className="text-base" />)}
                  {isAddingInspectionDate ? 'در حال افزودن...' : 'افزودن تاریخ جدید'}
                </button>
              </div>
              {rfiDatesRows.map((row, index) => (
                <div key={row.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2"><FaCalendarAlt className="text-gray-700" /><span className="font-semibold">سطر #{index + 1}{row.isNew && !row.isPersisted && (<span className="mr-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">جدید</span>)}</span></div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleCopyRow(row.id)} className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50 transition duration-200" title="کپی" disabled={isAddingInspectionDate || isLoadingAll}><FaCopy className="text-sm" /></button>
                      <button type="button" onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition duration-200" title="حذف" disabled={isDeleting || isLoadingAll || isUpdating}><FaTrash className="text-sm" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div><span className="text-gray-600 block mb-1">شروع تاریخ بازرسی</span><DatePicker value={row.inspectionDate} onChange={(date) => handleRfiDatesRowChange(row.id, "inspectionDate", date ? date.format("YYYY-MM-DD") : "")} calendar={persian} locale={persian_fa} format="YYYY/MM/DD" inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500" /></div>
                    <div><span className="text-gray-600 block mb-1">تعداد روز تائید شده</span><input type="text" value={displayApproveManday(row.approveManday)} onChange={(e) => { const newValue = e.target.value.trim(); if (newValue === "" || newValue === "-") { handleRfiDatesRowChange(row.id, "approveManday", "-"); } else { const numValue = parseInt(newValue, 10); if (!isNaN(numValue)) { handleRfiDatesRowChange(row.id, "approveManday", numValue); } else { handleRfiDatesRowChange(row.id, "approveManday", row.approveManday); } } }} onFocus={(e) => { if (e.target.value === "-") { e.target.value = ""; } }} onBlur={(e) => { const currentValue = e.target.value.trim(); if (currentValue === "") { e.target.value = "-"; handleRfiDatesRowChange(row.id, "approveManday", "-"); } }} className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-center" placeholder="-" disabled={isLoadingAll || isUpdating} /></div>
                    <div><span className="text-gray-600 block mb-1">بازرس اول</span><TableSearchableSelect value={row.inspectorName} onChange={(value) => handleRfiDatesRowChange(row.id, "inspectorName", value)} options={inspectorSearchOptions} placeholder={inspectorsLoading ? "در حال دریافت..." : "انتخاب بازرس"} disabled={inspectorsLoading || isLoadingAll || isUpdating} /></div>
                    <div><span className="text-gray-600 block mb-1">دستمزد</span><div className="relative"><input type="text" value={row.fee} onChange={(e) => handleRfiDatesRowChange(row.id, "fee", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs pl-8" placeholder="مبلغ" disabled={isLoadingAll || isUpdating} /><FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" /></div></div>
                    <div className="mt-3 pt-3 border-t border-gray-200"><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => handleSaveRow(row.id)} disabled={isUpdatingRow} className={`py-2 text-xs rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${row.isNew && !row.isPersisted ? "bg-green-600 hover:bg-green-700 text-white" : "bg-green-500 hover:bg-green-600 text-white"}`} title={row.isNew && !row.isPersisted ? "ثبت سطر جدید" : "ذخیره تغییرات"}><FaSave className="text-xs" />{row.isNew && !row.isPersisted ? "ثبت" : "ذخیره"}</button><button type="button" onClick={() => handleDeleteRow(row.id)} disabled={isDeleting} className="py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" title="حذف این سطر"><FaTrash className="text-xs" />حذف</button></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      <ConfirmationPopover isOpen={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} onConfirm={handleSubmitInternal} title="تغییرات ذخیره نشده" message="آیا از ذخیره‌سازی تغییرات ایجاد شده اطمینان دارید؟" type="warning" confirmText="بله، ذخیره کن" cancelText="انصراف" />
      <ConfirmationPopover isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)} onConfirm={handleCancelInternal} title="انصراف از تغییرات" message="تغییرات ایجاد شده ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید انصراف دهید؟" type="info" confirmText="بله، انصراف بده" cancelText="بازگشت" />
      <RowSaveConfirmationPopover isOpen={showRowSaveConfirm} onClose={() => { setShowRowSaveConfirm(false); setSelectedRowForSave(null); setRowToSaveData(null); }} onConfirm={handleConfirmRowSave} rowData={rowToSaveData} isLoading={isUpdatingRow} />
      <NotificationRowSaveConfirmationPopover isOpen={showNotificationRowSaveConfirm} onClose={() => { setShowNotificationRowSaveConfirm(false); setSelectedNotificationRowForSave(null); setNotificationRowToSaveData(null); }} onConfirm={handleConfirmNotificationRowSave} rowData={notificationRowToSaveData} isLoading={isUpdatingInfoRow} />
      <DeleteConfirmationPopover isOpen={showDeleteConfirm} onClose={() => { setShowDeleteConfirm(false); setSelectedRowForDelete(null); }} onConfirm={handleConfirmDelete} title="حذف تاریخ بازرسی" message={`آیا مطمئن هستید که می‌خواهید تاریخ ${selectedRowForDelete?.inspectionDate} را حذف کنید؟ این عمل قابل بازگشت نیست.`} confirmText={isDeleting ? "در حال حذف..." : "بله، حذف شود"} cancelText="انصراف" isLoading={isDeleting} type="danger" />
    </div>
  );
};

export default NotificationInfoModal;