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
  useUpdateNotificationInfoRow,useDeleteNotificationDate ,useDeleteInspectionDate,useAddInspectionDate
} from "../../../hooks/useNotificationNumber";
import { toast } from "react-hot-toast";

import {
  getNotificationStatusInPersian,
  transformNotificationStatuses,
  getEnglishNotificationStatus,
  getNotificationStatusCode,
  toNumber,
  parseApproveManday,
  extractNumber,
  formatWithCommas,
} from "../../../utils/helpers";
import RowSaveConfirmationPopover from "./RowSaveConfirmationPopover";
import NotificationRowSaveConfirmationPopover from "./NotificationRowSaveConfirmationPopover";
import DeleteConfirmationPopover from "./DeleteConfirmationPopover";
// import { useDeleteInspectionDate } from "../../hooks/useNotificationNumber";

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

const NotificationInfoModal = ({ isOpen, onClose, rfiNumber }) => {
 
  // استفاده از هوک‌های یکپارچه

  const {
    data: notificationData,
    isLoading,
    error,
  } = useNotificationInfo(rfiNumber);
  const { data: statusesData, isLoading: statusesLoading } =
    useNotificationStatuses();
  const { mutate: updateNotification, isLoading: isUpdating } =
    useUpdateNotification();
  const { mutate: updateNotificationRow, isLoading: isUpdatingRow } =
    useUpdateNotificationRow();
  const { mutate: updateNotificationInfoRow, isLoading: isUpdatingInfoRow } =
    useUpdateNotificationInfoRow();
    // در بخش هوک‌های کامپوننت
const { mutate: deleteNotificationDate, isLoading: isDeletingNotificationDate } = useDeleteNotificationDate();

  // حالت‌های پاپ‌آپ
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRowSaveConfirm, setShowRowSaveConfirm] = useState(false);
  const [selectedRowForSave, setSelectedRowForSave] = useState(null);
  const [rowToSaveData, setRowToSaveData] = useState(null);
    // اضافه کردن stateهای جدید برای حذف
 
  // حالت‌های جدید برای ذخیره ردیف نوتیفیکیشن
  const [showNotificationRowSaveConfirm, setShowNotificationRowSaveConfirm] =
    useState(false);
  const [selectedNotificationRowForSave, setSelectedNotificationRowForSave] =
    useState(null);
  const [notificationRowToSaveData, setNotificationRowToSaveData] =
    useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);
    
    // استفاده از هوک حذف
    const { mutate: deleteInspectionDate, isLoading: isDeleting } = useDeleteInspectionDate();
    const { mutate: addInspectionDate, isLoading: isAddingInspectionDate } = useAddInspectionDate();

// دو تابع جدید اضافه کن (بعد از handleDeleteRow):




// تابع برای افزودن تاریخ بازرسی جدید (با مقادیر آخرین سطر)
const handleAddNewRow = () => {
  // console.log('➕ Adding new inspection date row with same values as last row');

  // آخرین سطر رو پیدا کن (بر اساس id یا ایندکس)
  const lastRow = rfiDatesRows.length > 0 
    ? rfiDatesRows[rfiDatesRows.length - 1] 
    : null;
  
  const newId = Math.max(...rfiDatesRows.map(r => r.id), 0) + 1;
  
  // تاریخ جدید: اگر آخرین سطر وجود داشت، از تاریخ اون استفاده کن وگرنه تاریخ امروز
  let newDate;
  if (lastRow && lastRow.inspectionDate) {
    // کپی کردن تاریخ (ایجاد یک شیء جدید)
    if (lastRow.inspectionDate instanceof DateObject) {
      newDate = new DateObject(lastRow.inspectionDate);
    } else {
      newDate = convertToPersianDate(lastRow.inspectionDate);
    }
  } else {
    newDate = new DateObject({
      date: new Date(),
      calendar: persian,
      locale: persian_fa,
    });
  }
  
  setRfiDatesRows(prevRows => [
    ...prevRows,
    {
      id: newId,
      inspectionDate: newDate,
      approveManday: lastRow?.approveManday || "-", // مقدار آخرین سطر
      inspectorName: lastRow?.inspectorName || "", // مقدار آخرین سطر
      fee: lastRow?.fee || "", // مقدار آخرین سطر
      isNew: true,
      isPersisted: false
    }
  ]);
  
  setHasChanges(true);
};

// تابع برای کپی سطر (با مقادیر سطر انتخاب شده)
const handleCopyRow = (rowId) => {
  // console.log('📋 Preparing to copy row ID:', rowId);

  const rowToCopy = rfiDatesRows.find((r) => r.id === rowId);
  if (!rowToCopy) {
    toast.error("❌ ردیف مورد نظر یافت نشد");
    return;
  }

  const newId = Math.max(...rfiDatesRows.map(r => r.id), 0) + 1;
  
  // کپی کردن تاریخ (ایجاد یک شیء جدید)
  let newDate;
  if (rowToCopy.inspectionDate instanceof DateObject) {
    newDate = new DateObject(rowToCopy.inspectionDate);
  } else {
    newDate = convertToPersianDate(rowToCopy.inspectionDate);
  }
  
  setRfiDatesRows(prevRows => [
    ...prevRows,
    {
      id: newId,
      inspectionDate: newDate, // تاریخ از سطر مبدا
      approveManday: rowToCopy.approveManday, // مقدار از سطر مبدا
      inspectorName: rowToCopy.inspectorName, // مقدار از سطر مبدا
      fee: rowToCopy.fee, // مقدار از سطر مبدا
      isNew: true,
      isPersisted: false
    }
  ]);
  
  setHasChanges(true);
};





    // تابع handleDeleteRow - اضافه کردن بعد از handleSaveRow
const handleDeleteRow = (rowId) => {
  // console.log('🗑️ Preparing to delete row ID:', rowId);

  const row = rfiDatesRows.find((r) => r.id === rowId);
  if (!row) {
    toast.error("❌ ردیف مورد نظر یافت نشد");
    return;
  }

  // دریافت تاریخ بازرسی به فرمت مورد نیاز API
  const inspectionDate = row.inspectionDate?.format?.() || row.inspectionDate;
  const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;

  console.log('📋 Row to delete:', { 
    rowId, 
    inspectionDate, 
    rfiNumbering,
    row 
  });

  setSelectedRowForDelete({
    rowId,
    inspectionDate,
    rfiNumbering,
    rawData: row
  });

  setShowDeleteConfirm(true);
};
// تابع handleConfirmDelete - اضافه کردن بعد از handleConfirmRowSave
const handleConfirmDelete = () => {
  if (!selectedRowForDelete) return;

  // console.log('🚀 Confirming delete with data:', selectedRowForDelete);

  deleteInspectionDate(
    {
      rfiNumbering: selectedRowForDelete.rfiNumbering,
      inspectionDate: selectedRowForDelete.inspectionDate
    },
    {
      onSuccess: () => {
        // حذف ردیف از state محلی
        setRfiDatesRows(prevRows => 
          prevRows.filter(row => row.id !== selectedRowForDelete.rowId)
        );
        
        // بستن پاپ‌آپ
        setShowDeleteConfirm(false);
        setSelectedRowForDelete(null);
        
        // به‌روزرسانی initialDataRef
        if (initialDataRef.current) {
          initialDataRef.current = {
            ...initialDataRef.current,
            rfiDatesRows: rfiDatesRows
              .filter(row => row.id !== selectedRowForDelete.rowId)
              .map(row => ({
                ...row,
                inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
              })),
          };
        }
        
        // بررسی تغییرات
        setHasChanges(checkForChanges());
      },
      onError: (error) => {
        console.error('❌ Delete failed:', error);
        // در صورت خطا، پاپ‌آپ را ببند اما ردیف را حذف نکن
        setShowDeleteConfirm(false);
        setSelectedRowForDelete(null);
      }
    }
  );
};
  // تابع handleSaveNotificationRow:
// src/components/ui/NotificationInfoModal/NotificationInfoModal.jsx
// تابع handleSaveNotificationRow - خطوط 139-174

const handleSaveNotificationRow = (rowId) => {
  // console.log('💾 Preparing to save notification row ID:', rowId);

  const row = notificationRows.find((r) => r.id === rowId);
  if (!row) {
    toast.error("❌ ردیف مورد نظر یافت نشد");
    return;
  }

  // console.log('📦 Found notification row:', row);

  // **تغییر مهم: دریافت RFI_Numbering به جای rfiNumber ساده**
  const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
  console.log('🔤 Using RFI_Numbering for API call:', rfiNumbering);

  // آماده‌سازی داده‌ها
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
  };

  setSelectedNotificationRowForSave(rowId);
  setNotificationRowToSaveData(rowData);
  setShowNotificationRowSaveConfirm(true);
};

// تابع handleConfirmNotificationRowSave - خطوط 176-255
const handleConfirmNotificationRowSave = () => {
  if (!selectedNotificationRowForSave || !notificationRowToSaveData) return;

  // **تغییر مهم: استفاده از RFI_Numbering به جای rfiNumber ساده**
  const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
  // console.log('🚀 Confirming save with RFI_Numbering:', rfiNumbering);

  const rowPayload = {
    rfiNumber: rfiNumbering, // اینجا RFI_Numbering ارسال می‌شود
    rowData: notificationRowToSaveData,
  };

  // console.log('📤 Payload for API:', rowPayload);

  updateNotificationInfoRow(rowPayload, {
// در تابع handleConfirmNotificationRowSave - بعد از ذخیره موفق:
onSuccess: (data) => {
  // بستن پاپ‌آپ
  setShowNotificationRowSaveConfirm(false);

  // ذخیره rowId برای فیدبک UI
  const savedRowId = selectedNotificationRowForSave;
  setSelectedNotificationRowForSave(null);
  setNotificationRowToSaveData(null);

  // **مهم: کل initialDataRef.current را با stateهای فعلی همگام کن**
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

  // فیدبک فوری UI - سطر را highlight کن
  setNotificationRows((prevRows) =>
    prevRows.map((row) => {
      if (row.id === savedRowId) {
        return {
          ...row,
          _saved: true,
          _savedAt: new Date().toISOString(),
        };
      }
      return row;
    })
  );

  // **فوراً وضعیت hasChanges را به false تنظیم کن**
  setHasChanges(false);

  // نمایش toast موفقیت
  toast.success("تغییرات نوتیفیکیشن با موفقیت ذخیره شد", {
    position: "top-center",
    duration: 2000,
    icon: "✅",
    style: {
      background: "#10b981",
      color: "white",
      borderRadius: "8px",
      padding: "12px",
      fontSize: "14px",
    },
  });

  // پس از 3 ثانیه highlight را بردار
  setTimeout(() => {
    setNotificationRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        _saved: false,
      }))
    );
  }, 3000);
},

    onError: (error) => {
      console.error("❌ Notification row save failed:", error);

      toast.error(
        `❌ خطا در ذخیره نوتیفیکیشن: ${
          error.response?.data?.message || "لطفا مجدد تلاش کنید"
        }`,
        {
          position: "top-center",
          duration: 3000,
          icon: "❌",
          style: {
            background: "#ef4444",
            color: "white",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
          },
        }
      );

      setShowNotificationRowSaveConfirm(false);
    },



    

  });
};

  // ردِ تغییرات
  const initialDataRef = useRef(null);
  const [hasChanges, setHasChanges] = useState(false);

  // حالت‌های جدول نوتیفیکیشن
  const [notificationRows, setNotificationRows] = useState([]);
  const [rfiDatesRows, setRfiDatesRows] = useState([]);
  const [showDeleteNotificationConfirm, setShowDeleteNotificationConfirm] = useState(false);
const [notificationRowToDelete, setNotificationRowToDelete] = useState(null);

  // تبدیل داده‌های API به options برای select
  const statusOptions = useMemo(() => {
    return transformNotificationStatuses(statusesData);
  }, [statusesData]);

  // نوع بازرس
  const inspectorTypeOptions = [
    { value: "فریلنسر", label: "فریلنسر" },
    { value: "بازرس داخلی", label: "بازرس داخلی" },
  ];

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
      const date = new Date(dateString);
      return new DateObject({
        date: date,
        calendar: persian,
        locale: persian_fa,
      });
    } catch (err) {
      console.error("Error converting date:", err);
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa,
      });
    }
  };

  // تابع مقایسه دو مقدار
  // const areValuesEqual = (val1, val2) => {
  //   if (val1 instanceof DateObject && val2 instanceof DateObject) {
  //     return val1.format() === val2.format();
  //   }
  //   return val1 === val2;
  // };
  // تابع مقایسه دو مقدار - اصلاح نهایی
const areValuesEqual = (val1, val2) => {
  if (val1 instanceof DateObject && val2 instanceof DateObject) {
    return val1.format() === val2.format();
  }

  // تبدیل هر دو به رشته
  const str1 = String(val1 || '');
  const str2 = String(val2 || '');

  // اگر هر دو خالی هستند
  if (str1 === '' && str2 === '') return true;

  // استخراج اعداد از رشته
  const extractNumbers = (str) => {
    return str
      .replace(/[٬،,\.\s]/g, '')
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .match(/\d+/g);
  };

  const nums1 = extractNumbers(str1);
  const nums2 = extractNumbers(str2);

  // اگر اعداد متفاوتی پیدا شد
  if (nums1 && nums2 && nums1.length === 1 && nums2.length === 1) {
    return parseInt(nums1[0]) === parseInt(nums2[0]);
  }

  // در غیر این صورت مقایسه رشته‌ای
  return str1 === str2;
};

  // بررسی تغییرات
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

    // مقایسه ردیف‌های نوتیفیکیشن
    if (initial.notificationRows.length !== current.notificationRows.length) {
      return true;
    }

    for (let i = 0; i < initial.notificationRows.length; i++) {
      const initialRow = initial.notificationRows[i];
      const currentRow = current.notificationRows[i];

      const fields = [
        "notificationNumber",
        "status",
        "statusCode",
        "statusEnglish",
        "inspectorType",
        "description",
        "receivedDate",
        "location",
        "inspectionDate",
        "vendorName",
        "duration",
        "inspectorName",
        "remark",
        "folderNumber",
        "material",
        "goodsDescription",
        "qty3rdPartyInspector",
        "approvedDuration",
        "projectType",
        "rfiStatus",
      ];

      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) {
          return true;
        }
      }
    }

    // مقایسه ردیف‌های تاریخ‌های بازرسی
    if (initial.rfiDatesRows.length !== current.rfiDatesRows.length) {
      return true;
    }

    for (let i = 0; i < initial.rfiDatesRows.length; i++) {
      const initialRow = initial.rfiDatesRows[i];
      const currentRow = current.rfiDatesRows[i];

      const fields = [
        "inspectionDate",
        "approveManday",
        "inspectorName",
        "fee",
      ];

      for (const field of fields) {
        if (!areValuesEqual(initialRow[field], currentRow[field])) {
          return true;
        }
      }
    }

    return false;
  };

  // ریست فرم وقتی مدال باز می‌شود
  useEffect(() => {
    if (isOpen) {
      let initialNotificationRows = [];
      let initialRfiDatesRows = [];

      if (notificationData) {
        const { timeTable, rfiDates } = notificationData;

        // پر کردن جدول نوتیفیکیشن
        if (timeTable) {
          // تبدیل وضعیت انگلیسی به کد عددی
          const englishStatus = timeTable.RFI_Status || "";
          let statusCode = "3"; // پیش‌فرض: در حال انجام
          let persianStatus = "در حال انجام";

          if (englishStatus === "Done") {
            statusCode = "2";
            persianStatus = "انجام شده";
          } else if (englishStatus === "Cancel") {
            statusCode = "1";
            persianStatus = "لغو شده";
          } else if (englishStatus === "Ongoing") {
            statusCode = "3";
            persianStatus = "در حال انجام";
          }

          // اگر statusesData موجود بود، دقیق‌تر جستجو کن
          if (statusesData) {
            const entry = Object.entries(statusesData).find(
              ([code, text]) => text === englishStatus
            );
            if (entry) {
              statusCode = entry[0];
              persianStatus = getNotificationStatusInPersian(
                entry[0],
                entry[1]
              );
            }
          }

          initialNotificationRows = [
            {
              id: 1,
              notificationNumber: timeTable.NotificationNo  || "",
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
              // remark: timeTable.Remark || '',
              folderNumber: timeTable.FolderNo || "",
              material: timeTable.Material || "",
              remark: timeTable.Remark || "",
              // goodsDescription: timeTable.Goods_Description || '',
              qty3rdPartyInspector: timeTable.QTY_3rdpartinspector || "0",
              approvedDuration: timeTable.approved_Duration || "0",
              projectType: timeTable.Over_Domestic || "",
              rfiStatus: englishStatus,
            },
          ];
        } else {
          // اگر داده‌ای نبود، ردیف خالی ایجاد کن
          initialNotificationRows = [
            {
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
            },
          ];
        }

        // پر کردن جدول صورت وضعیت بازرس
        if (rfiDates && rfiDates.length > 0) {
          initialRfiDatesRows = rfiDates.map((item, index) => ({
            id: index + 1,
            inspectionDate: convertToPersianDate(item.RFI_Date),
            approveManday:
              item.ApproveManday != null && item.ApproveManday !== ""
                ? Number(item.ApproveManday)
                : "-",
            inspectorName: item.Inspector_Name || "",
            fee: item.InspectorPrice
              ? `${item.InspectorPrice.toLocaleString("fa-IR")}`
              : "",
            idrd: item.IDRD || 0,
          }));
        } else {
          initialRfiDatesRows = [
            {
              id: 1,
              inspectionDate: convertToPersianDate(new Date()),
              approveManday: "-",
              inspectorName: "",
              fee: "",
            },
          ];
        }
      } else {
        // اگر notificationData null بود، ردیف‌های پیش‌فرض ایجاد کن
        initialNotificationRows = [
          {
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
          },
        ];

        initialRfiDatesRows = [
          {
            id: 1,
            inspectionDate: convertToPersianDate(new Date()),
            approveManday: "-",
            inspectorName: "",
            fee: "",
          },
        ];
      }

      // ذخیره داده‌های اولیه
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

  // بررسی تغییرات هنگام تغییر داده‌ها
  useEffect(() => {
    if (initialDataRef.current) {
      const changed = checkForChanges();
      setHasChanges(changed);
    }
  }, [notificationRows, rfiDatesRows]);

  // ========== مدیریت ردیف‌های جدول نوتیفیکیشن ==========
  const handleAddNotificationRow = () => {
    const newId =
      notificationRows.length > 0
        ? Math.max(...notificationRows.map((r) => r.id)) + 1
        : 1;
    setNotificationRows([
      ...notificationRows,
      {
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
      },
    ]);
  };

// تابع جدید برای حذف ردیف نوتیفیکیشن - بدون شرط تعداد ردیف
// تابع برای حذف ردیف نوتیفیکیشن
const handleDeleteNotificationRow = (rowId) => {
  const rowToDelete = notificationRows.find((row) => row.id === rowId);
  if (rowToDelete) {
    setNotificationRowToDelete({
      rowId,
      notificationNumber: rowToDelete.notificationNumber,
      // اطلاعات اضافی برای API
      rfiNumbering: notificationData?.timeTable?.RFI_Numbering || rfiNumber,
      date_: "1404/05/09", // مقدار ثابت فعلی
    });
    setShowDeleteNotificationConfirm(true);
  }
};

// تابع تأیید حذف - با استفاده از هوک
const confirmDeleteNotificationRow = () => {
  if (!notificationRowToDelete) return;
  
  // استفاده از هوک برای فراخوانی API
  deleteNotificationDate({
    rfiNumbering: notificationRowToDelete.rfiNumbering,
    date_: notificationRowToDelete.date_,
  }, {
    onSuccess: () => {
      // حذف از state
      setNotificationRows((prevRows) => {
        const newRows = prevRows.filter((row) => row.id !== notificationRowToDelete.rowId);
        
        // اگر همه ردیف‌ها حذف شدند، یک ردیف خالی اضافه کن
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
      
      // بستن پاپ‌آپ
      setShowDeleteNotificationConfirm(false);
      setNotificationRowToDelete(null);
    },
    onError: (error) => {
      // در صورت خطا در API، بستن پاپ‌آپ
      setShowDeleteNotificationConfirm(false);
      setNotificationRowToDelete(null);
      
      // خطا توسط هوک نمایش داده می‌شود (toast)
      // حذف از UI را انجام نده چون API خطا داده
    }
  });
};

  const handleCopyNotificationRow = (id) => {
    const rowToCopy = notificationRows.find((row) => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...notificationRows.map((r) => r.id)) + 1;
      setNotificationRows([
        ...notificationRows,
        {
          ...rowToCopy,
          id: newId,
          notificationNumber: "",
        },
      ]);
    }
  };

  const handleNotificationRowChange = (id, field, value) => {
    setNotificationRows(
      notificationRows.map((row) => {
        if (row.id === id) {
          // اگر فیلد status باشد
          if (field === "status") {
            // پیدا کردن کد و متن انگلیسی متناظر
            const selectedOption = statusOptions.find(
              (opt) => opt.label === value
            );
            if (selectedOption) {
              return {
                ...row,
                status: value,
                statusCode: selectedOption.value,
                statusEnglish: selectedOption.textValue,
                rfiStatus: selectedOption.textValue,
              };
            }

            // اگر گزینه پیدا نشد، سعی کن کد رو پیدا کنی
            const code = getNotificationStatusCode(statusesData, value);
            const englishStatus = getEnglishNotificationStatus(
              statusesData,
              code
            );

            return {
              ...row,
              status: value,
              statusCode: code,
              statusEnglish: englishStatus,
              rfiStatus: englishStatus,
            };
          }

          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // ========== مدیریت ردیف‌های جدول صورت وضعیت بازرس ==========
  const handleAddRfiDatesRow = () => {
    const newId =
      rfiDatesRows.length > 0
        ? Math.max(...rfiDatesRows.map((r) => r.id)) + 1
        : 1;
    setRfiDatesRows([
      ...rfiDatesRows,
      {
        id: newId,
        inspectionDate: convertToPersianDate(new Date()),
        approveManday: "-",
        inspectorName: "",
        fee: "",
      },
    ]);
  };

  const handleDeleteRfiDatesRow = (id) => {
    if (rfiDatesRows.length > 1) {
      setRfiDatesRows(rfiDatesRows.filter((row) => row.id !== id));
    }
  };

  const handleCopyRfiDatesRow = (id) => {
    const rowToCopy = rfiDatesRows.find((row) => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...rfiDatesRows.map((r) => r.id)) + 1;
      setRfiDatesRows([
        ...rfiDatesRows,
        {
          ...rowToCopy,
          id: newId,
        },
      ]);
    }
  };

  const handleRfiDatesRowChange = (id, field, value) => {
    setRfiDatesRows(
      rfiDatesRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  // تابع بررسی اعتبار فرم
  const validateForm = () => {
    if (notificationRows.length === 0) {
      toast.error("❌ حداقل یک ردیف در جدول نوتیفیکیشن باید وجود داشته باشد");
      return false;
    }

    // بررسی ردیف‌های نوتیفیکیشن
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

    // بررسی ردیف‌های صورت وضعیت
    for (const row of rfiDatesRows) {
      if (!row.inspectorName.trim() && row.fee.trim()) {
        toast.error("❌ برای ردیف‌های دارای دستمزد، نام بازرس الزامی است");
        return false;
      }
    }

    return true;
  };

  // هندلر اصلی ذخیره
  const handleSubmitInternal = () => {
    if (!validateForm()) {
      return;
    }

    // فیلتر ردیف‌های خالی
    const validNotificationRows = notificationRows.filter(
      (row) =>
        row.notificationNumber.trim() !== "" || row.vendorName.trim() !== ""
    );

    const validRfiDatesRows = rfiDatesRows.filter(
      (row) => row.inspectorName.trim() !== "" || row.fee.trim() !== ""
    );

    if (validNotificationRows.length === 0) {
      toast.error("❌ هیچ داده‌ای برای ذخیره در جدول نوتیفیکیشن وجود ندارد");
      return;
    }

    updateNotification(
      {
        timeTableRows: validNotificationRows,
        rfiDatesRows: validRfiDatesRows,
        statusesData: statusesData,
      },
      {
        onSuccess: () => {
          toast.success("✅ اطلاعات با موفقیت ذخیره شد");
          // بروزرسانی داده‌های اولیه
          initialDataRef.current = {
            notificationRows: notificationRows.map((row) => ({
              ...row,
              receivedDate: row.receivedDate?.format?.() || row.receivedDate,
              inspectionDate:
                row.inspectionDate?.format?.() || row.inspectionDate,
            })),
            rfiDatesRows: rfiDatesRows.map((row) => ({
              ...row,
              inspectionDate:
                row.inspectionDate?.format?.() || row.inspectionDate,
            })),
          };
          setHasChanges(false);
          onClose();
        },
        onError: (error) => {
          const errorMessage =
            error.response?.data?.message || error.message || "خطای ناشناخته";
          toast.error(`❌ خطا در ذخیره اطلاعات: ${errorMessage}`);
        },
      }
    );
  };

  // تابع بررسی و نمایش مقدار ApproveManday
  const displayApproveManday = (value) => {
    // اگر مقدار null یا undefined یا خالی باشد
    if (value == null || value === "" || value === undefined) {
      return "-";
    }

    // اگر عدد یا رشته عددی باشد
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      return numValue;
    }

    // در غیر این صورت خط تیره
    return "-";
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

 
  // تابع handleSaveRow:
// تابع handleSaveRow - با منطق جدید
const handleSaveRow = (rowId) => {
  // console.log('💾 Preparing to save row ID:', rowId);

  const row = rfiDatesRows.find((r) => r.id === rowId);
  if (!row) {
    toast.error("❌ ردیف مورد نظر یافت نشد");
    return;
  }

  const rfiNumbering = notificationData?.timeTable?.RFI_Numbering || rfiNumber;
  const approveManday = parseApproveManday(row.approveManday);
  const fee = extractNumber(row.fee);
  
  // اگر سطر جدید است (isNew = true) و هنوز ذخیره نشده
  if (row.isNew && !row.isPersisted) {
    // برای سطر جدید، API افزودن رو کال کن
    const inspectionDateData = {
      RFI_Numbering: rfiNumbering,
      RFI_Date: row.inspectionDate, // تاریخ از سطر جاری
      ApproveManday: approveManday === 0 ? "0" : approveManday.toString(),
      Inspector_Name: row.inspectorName || "",
      InspectorPrice: fee || "0"
    };
    
    // console.log('📦 New row - calling ADD API:', inspectionDateData);
    
    addInspectionDate(inspectionDateData, {
      onSuccess: (data) => {
        // بعد از موفقیت، سطر رو به persisted تبدیل کن
        setRfiDatesRows(prevRows => 
          prevRows.map(r => {
            if (r.id === rowId) {
              return {
                ...r,
                isNew: false,
                isPersisted: true,
                _saved: true,
                _savedAt: new Date().toISOString()
              };
            }
            return r;
          })
        );
        
        // آپدیت initialDataRef
        if (initialDataRef.current) {
          initialDataRef.current = {
            ...initialDataRef.current,
            rfiDatesRows: [
              ...initialDataRef.current.rfiDatesRows,
              {
                ...row,
                isNew: false,
                isPersisted: true,
                inspectionDate: row.inspectionDate?.format?.() || row.inspectionDate,
                approveManday: row.approveManday,
                inspectorName: row.inspectorName || "",
                fee: row.fee || "",
              }
            ]
          };
        }
        
        // toast.success("تاریخ بازرسی جدید با موفقیت اضافه شد", {
        //   position: "top-center",
        //   duration: 2000,
        //   icon: "✅",
        // });
        
        setHasChanges(checkForChanges());
        
        // پس از 3 ثانیه highlight را بردار
        setTimeout(() => {
          setRfiDatesRows(prevRows =>
            prevRows.map(r => ({
              ...r,
              _saved: false
            }))
          );
        }, 3000);
      },
      onError: (error) => {
        console.error('❌ Add new row failed:', error);
        toast.error(`❌ خطا در افزودن: ${error.response?.data?.message || "لطفا مجدد تلاش کنید"}`);
      }
    });
  } else {
    // برای سطرهای موجود، API آپدیت رو کال کن (مثل قبل)
    const idrd = toNumber(row.idrd, 0);
    
    setSelectedRowForSave(rowId);
    setRowToSaveData({
      approveManday,
      fee,
      idrd,
      rawData: row,
      rfiNumbering: rfiNumbering,
    });
    
    setShowRowSaveConfirm(true);
  }
};

  // تابع handleConfirmRowSave:

// تابع handleConfirmRowSave را اینگونه اصلاح کنید:

// تابع handleConfirmRowSave را اینگونه اصلاح کنید:
const handleConfirmRowSave = () => {
  if (!selectedRowForSave || !rowToSaveData) return;

  const rowPayload = {
    rfiNumber: rowToSaveData.rfiNumbering,
    rowData: {
      approveManday: rowToSaveData.approveManday,
      idrd: rowToSaveData.idrd,
      fee: rowToSaveData.fee,
    },
  };

  updateNotificationRow(rowPayload, {
    onSuccess: (data) => {
      // 1. بستن پاپ‌آپ
      setShowRowSaveConfirm(false);

      // 2. ذخیره rowId برای فیدبک UI
      const savedRowId = selectedRowForSave;
      
      // 3. آپدیت سطر - اگر isNew بوده، حالا isPersisted میشه
      setRfiDatesRows((prevRows) =>
        prevRows.map((row) => {
          if (row.id === savedRowId) {
            return {
              ...row,
              _saved: true,
              _savedAt: new Date().toISOString(),
              isNew: false, // دیگه جدید نیست
              isPersisted: true // الان تو دیتابیس هست
            };
          }
          return row;
        })
      );
      
      setSelectedRowForSave(null);
      setRowToSaveData(null);

      // 4. آپدیت initialDataRef
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

      // 5. **فوراً وضعیت hasChanges را به false تنظیم کن**
      setHasChanges(false);

      // 6. نمایش toast موفقیت
      toast.success("تغییرات با موفقیت ذخیره شد", {
        position: "top-center",
        duration: 2000,
        icon: "✅",
      });

      // 7. پس از 3 ثانیه highlight را بردار
      setTimeout(() => {
        setRfiDatesRows((prevRows) =>
          prevRows.map((row) => ({
            ...row,
            _saved: false,
          }))
        );
      }, 3000);
    },
    onError: (error) => {
      console.error("❌ Row save failed:", error);
      toast.error(`❌ خطا در ذخیره: ${error.response?.data?.message || "لطفا مجدد تلاش کنید"}`);
      setShowRowSaveConfirm(false);
    },
  });
};

  const getDateTimestamp = (date) => {
    // console.log("🔍 getDateTimestamp input:", date);

    if (!date) return 0;

    try {
      // اگر DateObject از react-multi-date-picker هست
      if (date && typeof date === "object") {
        // روش ۱: استفاده مستقیم از properties (بهتر)
        if (date.year && date.month && date.day) {
          // console.log("📅 Direct properties:", date.year, date.month, date.day);

          // تبدیل اعداد فارسی به انگلیسی اگر لازم است
          const persianToEnglish = (num) => {
            if (typeof num === "string") {
              return num
                .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
                .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
            }
            return num;
          };

          const year = parseInt(persianToEnglish(date.year.toString()));
          const month = parseInt(persianToEnglish(date.month.toString()));
          const day = parseInt(persianToEnglish(date.day.toString()));

          // console.log("🔢 Converted to numbers:", year, month, day);

          // ساخت عدد قابل مقایسه
          const sortableNumber = year * 10000 + month * 100 + day;
          // console.log("🧮 Sortable number:", sortableNumber);

          return sortableNumber;
        }

        // روش ۲: استفاده از format method
        if (typeof date.format === "function") {
          try {
            // فرمت بدون جداکننده
            const formatted = date.format("YYYYMMDD");
            // console.log("📅 Formatted (YYYYMMDD):", formatted);

            // تبدیل اعداد فارسی به انگلیسی
            const englishNumbers = formatted
              .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
              .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));

            // console.log("🔢 English numbers:", englishNumbers);

            return parseInt(englishNumbers) || 0;
          } catch (formatError) {
            console.error("❌ Format error:", formatError);
          }
        }
      }

      return 0;
    } catch (error) {
      console.error("❌ Error in getDateTimestamp:", error);
      return 0;
    }
  };

  const sortedRfiDatesRows = useMemo(() => {
    return [...rfiDatesRows].sort((a, b) => {
      const timestampA = getDateTimestamp(a.inspectionDate);
      const timestampB = getDateTimestamp(b.inspectionDate);
      // console.log("timestampA",timestampA)
      // console.log("timestampB",timestampB)

      // برای نزولی: بزرگ‌ترین (جدیدترین) اول
      // return timestampB - timestampA;

      // اگر می‌خواهید صعودی (قدیمی‌ترین اول):
      return timestampA - timestampB;
    });
  }, [rfiDatesRows]);

  if (!isOpen) return null;

  const isLoadingAll = isLoading || statusesLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaHashtag className="text-gray-700 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  اطلاعات نوتیفیکیشن شماره {notificationData?.timeTable?.NotificationNo}
                </h3>
                {isLoadingAll && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaSync className="animate-spin" />
                    در حال دریافت اطلاعات...
                  </p>
                )}
              </div>
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

        {/* نمایش خطا */}
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              خطا در دریافت اطلاعات: {error.message}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* بخش اول: اطلاعات نوتیفیکیشن */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
                <h4 className="text-base font-bold text-gray-800">
                  اطلاعات نوتیفیکیشن
                </h4>
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  {notificationRows.length} مورد
                </span>
              </div>
            </div>

            {/* Desktop Table - نوتیفیکیشن */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
                    <th className="p-3 text-right font-bold text-white text-xs min-w-40">
                      شماره نوتیفیکشن
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">
                      وضعیت
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">
                      بازرس
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-48">
                      توضیحات
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">
                      تاریخ دریافت
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">
                      لوکیشن
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">
                      تاریخ بازرسی
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-32">
                      نام وندور
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-20">
                      مدت
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-28">
                      نام بازرس
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-32">
                      Remark
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">
                      شماره فولدر
                    </th>
                    <th className="p-3 text-right font-bold text-white text-xs min-w-24">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {notificationRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      {/* شماره نوتیفیکشن */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.notificationNumber}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "notificationNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شماره نوتیفیکشن"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* وضعیت */}
                      <td className="p-3 text-gray-800">
                        <select
                          value={row.status}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "status",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={
                            isLoadingAll || isUpdating || statusesLoading
                          }
                        >
                          {statusesLoading ? (
                            <option value="">
                              در حال دریافت لیست وضعیت‌ها...
                            </option>
                          ) : (
                            <>
                              <option value="">انتخاب وضعیت</option>
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </td>

                      {/* نوع بازرس */}
                      <td className="p-3 text-gray-800">
                        <select
                          value={row.inspectorType}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectorType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoadingAll || isUpdating}
                        >
                          {inspectorTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* توضیحات */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.goodsDescription || ""}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "goodsDescription",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="توضیحات"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* تاریخ دریافت */}
                      <td className="p-3 text-gray-800">
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) =>
                            handleNotificationRowChange(
                              row.id,
                              "receivedDate",
                              date
                            )
                          }
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* لوکیشن */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "location",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شهر"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* تاریخ بازرسی */}
                      <td className="p-3 text-gray-800">
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectionDate",
                              date
                            )
                          }
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* نام وندور */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "vendorName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="نام وندور"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* مدت */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.duration}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "duration",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="مدت"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* نام بازرس */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.inspectorName}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectorName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="نام بازرس"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* Remark */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.remark}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "remark",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="توضیحات تکمیلی"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      {/* شماره فولدر */}
                      <td className="p-3 text-gray-800">
                        <input
                          type="text"
                          value={row.folderNumber}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "folderNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شماره فولدر"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveNotificationRow(row.id)}
                            disabled={isUpdatingInfoRow || isLoadingAll}
                            className={`px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                              row._saved ? "bg-green-600" : ""
                            }`}
                            title="ذخیره این سطر"
                          >
                            {row._saved ? (
                              <>
                                <FaCheck className="text-xs" />
                                ذخیره شد
                              </>
                            ) : (
                              <>
                                <FaSave className="text-xs" />
                                ذخیره
                              </>
                            )}
                          </button>
                          {/* <button
                type="button"
                onClick={() => handleDeleteNotificationRow(row.id)}
                // disabled={notificationRows.length <= 1 || isUpdatingInfoRow || isLoadingAll}
                disabled={isUpdatingInfoRow || isLoadingAll}
                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="حذف این سطر"
              >
                <FaTrash className="text-xs" />
                حذف
              </button> */}
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
                <div
                  key={row.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-gray-700" />
                      <span className="font-semibold">سطر #{index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyNotificationRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="کپی"
                        disabled={isLoadingAll || isUpdating}
                      >
                        <FaCopy className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotificationRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="حذف"
                        disabled={isUpdatingInfoRow || isLoadingAll}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          شماره نوتیفیکشن
                        </span>
                        <input
                          type="text"
                          value={row.notificationNumber}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "notificationNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">وضعیت</span>
                        <select
                          value={row.status}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "status",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={
                            isLoadingAll || isUpdating || statusesLoading
                          }
                        >
                          {statusesLoading ? (
                            <option value="">در حال دریافت...</option>
                          ) : (
                            <>
                              <option value="">انتخاب وضعیت</option>
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.label}>
                                  {option.label}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          نوع بازرس
                        </span>
                        <select
                          value={row.inspectorType}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectorType",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoadingAll || isUpdating}
                        >
                          {inspectorTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          نام وندور
                        </span>
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "vendorName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام وندور"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">توضیحات</span>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) =>
                          handleNotificationRowChange(
                            row.id,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="توضیحات"
                        disabled={isLoadingAll || isUpdating}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          تاریخ دریافت
                        </span>
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) =>
                            handleNotificationRowChange(
                              row.id,
                              "receivedDate",
                              date
                            )
                          }
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          تاریخ بازرسی
                        </span>
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectionDate",
                              date
                            )
                          }
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">لوکیشن</span>
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "location",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شهر"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">مدت</span>
                        <input
                          type="text"
                          value={row.duration}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "duration",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="مدت"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          نام بازرس
                        </span>
                        <input
                          type="text"
                          value={row.inspectorName}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "inspectorName",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام بازرس"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          شماره فولدر
                        </span>
                        <input
                          type="text"
                          value={row.folderNumber}
                          onChange={(e) =>
                            handleNotificationRowChange(
                              row.id,
                              "folderNumber",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="123"
                          disabled={isLoadingAll || isUpdating}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">Remark</span>
                      <input
                        type="text"
                        value={row.remark}
                        onChange={(e) =>
                          handleNotificationRowChange(
                            row.id,
                            "remark",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="توضیحات تکمیلی"
                        disabled={isLoadingAll || isUpdating}
                      />
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleSaveNotificationRow(row.id)}
                        disabled={isUpdatingInfoRow || isLoadingAll}
                        className={`w-full py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          row._saved ? "bg-green-600" : ""
                        }`}
                      >
                        {row._saved ? (
                          <>
                            <FaCheck className="text-xs" />
                            تغییرات ذخیره شد
                          </>
                        ) : (
                          <>
                            <FaSave className="text-xs" />
                            ذخیره تغییرات این سطر
                          </>
                        )}
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
      <h4 className="text-base font-bold text-gray-800">
        اطلاعات تاریخ‌های بازرس
      </h4>
      <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
        {rfiDatesRows.length} مورد
      </span>
    </div>
    <button
      type="button"
      onClick={handleAddNewRow}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isAddingInspectionDate || isLoadingAll}
    >
      {isAddingInspectionDate ? (
        <FaSync className="animate-spin text-base" />
      ) : (
        <FaPlusCircle className="text-base" />
      )}
      {isAddingInspectionDate ? 'در حال افزودن...' : 'افزودن تاریخ جدید'}
    </button>
  </div>

            {/* Desktop Table - صورت وضعیت بازرس */}
        {/* Desktop Table - صورت وضعیت بازرس */}
<div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
        <th className="p-3 text-right font-bold text-white text-xs min-w-36">
          شروع تاریخ بازرسی
        </th>
        <th className="p-3 text-right font-bold text-white text-xs min-w-32">
          تعداد روز تائید شده
        </th>
        <th className="p-3 text-right font-bold text-white text-xs min-w-48">
          بازرس اول
        </th>
        <th className="p-3 text-right font-bold text-white text-xs min-w-40">
          دستمزد
        </th>
        <th className="p-3 text-right font-bold text-white text-xs min-w-28">
          عملیات
        </th>
      </tr>
    </thead>
    <tbody>
      {sortedRfiDatesRows.map((row, index) => (
        <tr
          key={row.id}
          className={`border-b border-gray-200 transition duration-150 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:bg-blue-50`}
        >
          {/* تاریخ بازرسی - فقط خواندنی */}
          <td className="p-2 text-gray-800 min-w-36">
            <DatePicker
              value={row.inspectionDate}
              onChange={(date) =>
                handleRfiDatesRowChange(
                  row.id,
                  "inspectionDate",
                  date
                )
              }
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              disabled={true}
              readOnly={true}
            />
          </td>

          {/* ستون جدید: تعداد روز تائید شده - قابل ویرایش */}
          <td className="p-2 text-gray-800 min-w-32">
            <input
              type="text"
              value={displayApproveManday(row.approveManday)}
              onChange={(e) => {
                const newValue = e.target.value.trim();

                if (newValue === "" || newValue === "-") {
                  handleRfiDatesRowChange(
                    row.id,
                    "approveManday",
                    "-"
                  );
                } else {
                  const numValue = parseInt(newValue, 10);
                  if (!isNaN(numValue)) {
                    handleRfiDatesRowChange(
                      row.id,
                      "approveManday",
                      numValue
                    );
                  } else {
                    handleRfiDatesRowChange(
                      row.id,
                      "approveManday",
                      row.approveManday
                    );
                  }
                }
              }}
              onFocus={(e) => {
                if (e.target.value === "-") {
                  e.target.value = "";
                }
              }}
              onBlur={(e) => {
                const currentValue = e.target.value.trim();
                if (currentValue === "") {
                  e.target.value = "-";
                  handleRfiDatesRowChange(
                    row.id,
                    "approveManday",
                    "-"
                  );
                }
              }}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-200 focus:border-transparent text-center"
              placeholder="-"
              disabled={isLoadingAll || isUpdating}
            />
          </td>

          {/* بازرس اول - فقط خواندنی */}
          <td className="p-2 text-gray-800 min-w-48">
            <input
              type="text"
              value={row.inspectorName}
              readOnly={true}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
              placeholder="نام بازرس"
            />
          </td>

          {/* دستمزد - قابل ویرایش */}
          <td className="p-2 text-gray-800 min-w-40">
            <div className="relative">
              <input
                type="text"
                value={row.fee}
                onChange={(e) =>
                  handleRfiDatesRowChange(
                    row.id,
                    "fee",
                    e.target.value
                  )
                }
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-200 focus:border-transparent pl-6"
                placeholder="مبلغ"
                disabled={isLoadingAll || isUpdating}
              />
              <FaMoneyBillWave className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
            </div>
          </td>

          {/* ستون عملیات */}
          <td className="p-2 min-w-28">
            <div className="flex justify-center gap-1">
            <button
                  type="button"
                  onClick={() => handleCopyRow(row.id)}
                  className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-100 transition duration-200"
                  title="کپی سطر"
                  disabled={isAddingInspectionDate || isLoadingAll}
                >
                  {isAddingInspectionDate ? (
                    <FaSync className="animate-spin text-xs" />
                  ) : (
                    <FaCopy className="text-xs" />
                  )}
                </button>
              {/* دکمه ذخیره */}
              <button
                type="button"
                onClick={() => handleSaveRow(row.id)}
                disabled={isUpdatingRow}
                className="px-2 py-1.5 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="ذخیره این سطر"
              >
                <FaSave className="text-xs" />
                ذخیره
              </button>
              
              {/* دکمه حذف */}
              <button
                type="button"
                onClick={() => handleDeleteRow(row.id)}
                disabled={isDeleting}
                className="px-2 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="حذف این سطر"
              >
                <FaTrash className="text-xs" />
                حذف
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

            {/* Mobile View - صورت وضعیت بازرس */}
            {/* Mobile View - صورت وضعیت بازرس */}
<div className="md:hidden space-y-4">
<div className="flex justify-end">
      <button
        type="button"
        onClick={handleAddNewRow}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isAddingInspectionDate || isLoadingAll}
      >
        {isAddingInspectionDate ? (
          <FaSync className="animate-spin text-base" />
        ) : (
          <FaPlusCircle className="text-base" />
        )}
        {isAddingInspectionDate ? 'در حال افزودن...' : 'افزودن تاریخ جدید'}
      </button>
    </div>
  {rfiDatesRows.map((row, index) => (
    <div
      key={row.id}
      className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-700" />
          <span className="font-semibold">سطر #{index + 1}</span>
        </div>
        <div className="flex gap-1">
        <button
              type="button"
              onClick={() => handleCopyRow(row.id)}
              className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50 transition duration-200"
              title="کپی"
              disabled={isAddingInspectionDate || isLoadingAll}
            >
              <FaCopy className="text-sm" />
            </button>
          
          {/* دکمه حذف در موبایل ویو */}
          <button
            type="button"
            onClick={() => handleDeleteRow(row.id)}
            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition duration-200"
            title="حذف"
            disabled={isDeleting || isLoadingAll || isUpdating}
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-gray-600 block mb-1">
              تاریخ بازرسی
            </span>
            <DatePicker
              value={row.inspectionDate}
              onChange={(date) =>
                handleRfiDatesRowChange(
                  row.id,
                  "inspectionDate",
                  date
                )
              }
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50 cursor-not-allowed"
              disabled={true}
              readOnly={true}
            />
          </div>

          <div>
            <span className="text-gray-600 block mb-1">
              تعداد روز تائید شده
            </span>
            <input
              type="text"
              value={displayApproveManday(row.approveManday)}
              onChange={(e) => {
                const newValue = e.target.value.trim();

                if (newValue === "" || newValue === "-") {
                  handleRfiDatesRowChange(
                    row.id,
                    "approveManday",
                    "-"
                  );
                } else {
                  const numValue = parseInt(newValue, 10);
                  if (!isNaN(numValue)) {
                    handleRfiDatesRowChange(
                      row.id,
                      "approveManday",
                      numValue
                    );
                  } else {
                    handleRfiDatesRowChange(
                      row.id,
                      "approveManday",
                      row.approveManday
                    );
                  }
                }
              }}
              onFocus={(e) => {
                if (e.target.value === "-") {
                  e.target.value = "";
                }
              }}
              onBlur={(e) => {
                const currentValue = e.target.value.trim();
                if (currentValue === "") {
                  e.target.value = "-";
                  handleRfiDatesRowChange(
                    row.id,
                    "approveManday",
                    "-"
                  );
                }
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-center"
              placeholder="-"
              disabled={isLoadingAll || isUpdating}
            />
          </div>
        </div>

        <div>
          <span className="text-gray-600 block mb-1">
            بازرس اول
          </span>
          <input
            type="text"
            value={row.inspectorName}
            readOnly={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs bg-gray-50 cursor-not-allowed"
            placeholder="نام بازرس"
          />
        </div>

        <div>
          <span className="text-gray-600 block mb-1">دستمزد</span>
          <div className="relative">
            <input
              type="text"
              value={row.fee}
              onChange={(e) =>
                handleRfiDatesRowChange(
                  row.id,
                  "fee",
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs pl-8"
              placeholder="مبلغ"
              disabled={isLoadingAll || isUpdating}
            />
            <FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        </div>

        {/* دکمه‌های عملیات در موبایل */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSaveRow(row.id)}
              disabled={isUpdatingRow}
              className="py-2 text-xs bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title="ذخیره این سطر"
            >
              <FaSave className="text-xs" />
              ذخیره
            </button>
            
            <button
              type="button"
              onClick={() => handleDeleteRow(row.id)}
              disabled={isDeleting}
              className="py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              title="حذف این سطر"
            >
              <FaTrash className="text-xs" />
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
          
          </div>

          {/* دکمه‌های ثبت و انصراف */}
          {/* <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoadingAll || isUpdating}
              // disabled={true}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <FaSync className="animate-spin text-lg" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-lg" />
                  ذخیره اطلاعات
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes className="text-lg" />
              انصراف
            </button>
          </div> */}
        </form>
      </div>

      {/* پاپ‌آپ تأیید ذخیره */}
      <ConfirmationPopover
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSubmitInternal}
        title="تغییرات ذخیره نشده"
        message="آیا از ذخیره‌سازی تغییرات ایجاد شده اطمینان دارید؟"
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
        message="تغییرات ایجاد شده ذخیره نشده‌اند. آیا مطمئن هستید که می‌خواهید انصراف دهید؟"
        type="info"
        confirmText="بله، انصراف بده"
        cancelText="بازگشت"
      />
      <RowSaveConfirmationPopover
        isOpen={showRowSaveConfirm}
        onClose={() => {
          setShowRowSaveConfirm(false);
          setSelectedRowForSave(null);
          setRowToSaveData(null);
        }}
        onConfirm={handleConfirmRowSave}
        rowData={rowToSaveData}
        isLoading={isUpdatingRow}
      />
      <NotificationRowSaveConfirmationPopover
        isOpen={showNotificationRowSaveConfirm}
        onClose={() => {
          setShowNotificationRowSaveConfirm(false);
          setSelectedNotificationRowForSave(null);
          setNotificationRowToSaveData(null);
        }}
        onConfirm={handleConfirmNotificationRowSave}
        rowData={notificationRowToSaveData}
        isLoading={isUpdatingInfoRow}
      />
{/* پاپ‌آپ تأیید حذف سطر نوتیفیکیشن */}

<DeleteConfirmationPopover
  isOpen={showDeleteConfirm}
  onClose={() => {
    setShowDeleteConfirm(false);
    setSelectedRowForDelete(null);
  }}
  onConfirm={handleConfirmDelete}
  title="حذف تاریخ بازرسی"
  message={`آیا مطمئن هستید که می‌خواهید تاریخ ${selectedRowForDelete?.inspectionDate} را حذف کنید؟ این عمل قابل بازگشت نیست.`}
  confirmText={isDeleting ? "در حال حذف..." : "بله، حذف شود"}
  cancelText="انصراف"
  isLoading={isDeleting}
  type="danger"
/>
    </div>
  );
};

export default NotificationInfoModal;
