// src/components/rfi/RFIReportTable.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  FaTable,
  FaSearch,
  FaSync,
  FaFileAlt,FaTrash ,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaListAlt,
  FaPlusCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFilter,
  FaTimes,
  FaArrowLeft,
  FaUserTie,
} from "react-icons/fa";

// Components
import StepHeader from "../common/StepHeader";
import SelectField from "../ui/SelectField";
import Button from "../ui/Button";
import AddReportModal from "../ui/AddReportModal/AddReportModal";
import { useNotificationInfo } from "../../hooks/useNotificationNumber";
import NotificationInfoModal from "../ui/NotificationInfoModal/NotificationInfoModal";
import { useLastIRN } from "../../hooks/useProjects";
import { FaHashtag, FaCalendarCheck } from "react-icons/fa";
import PaginationControls from "../ui/PaginationControls";

// Hooks
import { useProjects } from "../../hooks/useProjects";
import { useRFIReport } from "../../hooks/useRFIReport";
import DeleteNotificationPopover from "./DeleteNotificationPopover";
import { useDeleteNotification } from "../../hooks/useNotificationNumber";
import { useProjectTypes } from "../../hooks/useProjectTypes";

//helper
import {
  getPersianProjectType,
  getStatusColor,
  getPersianStatus,
} from "./../../utils/helpers";

// ========== کامپوننت ProjectTypeFilterDropdown ==========
const ProjectTypeFilterDropdown = ({
  isOpen,
  onClose,
  uniqueTypes,
  selectedTypes,
  onTypeChange,
  onSelectAll,
  onClearAll,
  areAllSelected,
  activeCount,
  buttonRef,
}) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 240;

      let rightPosition = viewportWidth - buttonRect.right;

      if (rightPosition < dropdownWidth) {
        rightPosition = Math.max(10, rightPosition);
      }

      setPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        right: rightPosition,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[140px] max-w-[200px]"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <div className="text-sm font-semibold text-gray-700">
            فیلتر نوع پروژه
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex justify-between items-center p-2 border-b">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {areAllSelected ? "لغو همه" : "انتخاب همه"}
          </button>
          <span className="text-xs text-gray-500">
            {activeCount} از {uniqueTypes.length}
          </span>
        </div>

        <div className="max-h-[200px] overflow-y-auto p-1">
          {uniqueTypes.length > 0 ? (
            uniqueTypes.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition duration-150"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes[type] || false}
                  onChange={() => onTypeChange(type)}
                  className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm text-gray-800 font-sm">
                    {getPersianProjectType(type)}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              داده‌ای برای فیلتر موجود نیست
            </div>
          )}
        </div>

        <div className="flex gap-1 p-0.5 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition duration-200 shadow-sm"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium transition duration-200"
            disabled={activeCount === 0}
          >
            حذف همه
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

// ========== کامپوننت StatusFilterDropdown ==========
const StatusFilterDropdown = ({
  isOpen,
  onClose,
  uniqueStatuses,
  selectedStatuses,
  onStatusChange,
  onSelectAll,
  onClearAll,
  areAllSelected,
  activeCount,
  buttonRef,
}) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 200;

      let rightPosition = viewportWidth - buttonRect.right;

      if (rightPosition < dropdownWidth) {
        rightPosition = Math.max(10, rightPosition);
      }

      setPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        right: rightPosition,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  const getStatusColorForFilter = (status) => {
    const statusStr = String(status).toLowerCase().trim();
    switch(statusStr) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancel':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[160px] max-w-[220px]"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <div className="text-sm font-semibold text-gray-700">
            فیلتر وضعیت
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex justify-between items-center p-2 border-b">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {areAllSelected ? "لغو همه" : "انتخاب همه"}
          </button>
          <span className="text-xs text-gray-500">
            {activeCount} از {uniqueStatuses.length}
          </span>
        </div>

        <div className="max-h-[200px] overflow-y-auto p-1">
          {uniqueStatuses.length > 0 ? (
            uniqueStatuses.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition duration-150"
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses[status] || false}
                  onChange={() => onStatusChange(status)}
                  className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorForFilter(status)}`}>
                    {getPersianStatus(status)}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              داده‌ای برای فیلتر موجود نیست
            </div>
          )}
        </div>

        <div className="flex gap-1 p-0.5 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition duration-200 shadow-sm"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium transition duration-200"
            disabled={activeCount === 0}
          >
            حذف همه
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

// ========== کامپوننت جدید InspectorFilterDropdown ==========
const InspectorFilterDropdown = ({
  isOpen,
  onClose,
  uniqueInspectors,
  selectedInspectors,
  onInspectorChange,
  onSelectAll,
  onClearAll,
  areAllSelected,
  activeCount,
  buttonRef,
}) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 220;

      let rightPosition = viewportWidth - buttonRect.right;

      if (rightPosition < dropdownWidth) {
        rightPosition = Math.max(10, rightPosition);
      }

      setPosition({
        top: buttonRect.bottom + window.scrollY + 5,
        right: rightPosition,
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[180px] max-w-[250px]"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <div className="text-sm font-semibold text-gray-700">
            فیلتر بازرس
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="text-sm" />
          </button>
        </div>

        <div className="flex justify-between items-center p-2 border-b">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {areAllSelected ? "لغو همه" : "انتخاب همه"}
          </button>
          <span className="text-xs text-gray-500">
            {activeCount} از {uniqueInspectors.length}
          </span>
        </div>

        <div className="max-h-[250px] overflow-y-auto p-1">
          {uniqueInspectors.length > 0 ? (
            uniqueInspectors.map((inspector) => (
              <label
                key={inspector}
                className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer transition duration-150"
              >
                <input
                  type="checkbox"
                  checked={selectedInspectors[inspector] || false}
                  onChange={() => onInspectorChange(inspector)}
                  className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1 flex items-center gap-1">
                  <FaUserTie className="text-gray-400 text-xs" />
                  <span className="text-sm text-gray-800 font-sm">
                    {inspector === "-" ? "بدون بازرس" : inspector}
                  </span>
                </div>
              </label>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              داده‌ای برای فیلتر موجود نیست
            </div>
          )}
        </div>

        <div className="flex gap-1 p-0.5 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium transition duration-200 shadow-sm"
          >
            اعمال فیلتر
          </button>
          <button
            onClick={onClearAll}
            className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium transition duration-200"
            disabled={activeCount === 0}
          >
            حذف همه
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

// ========== کامپوننت اصلی RFIReportTable ==========
const RFIReportTable = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState("");
  const [projectName, setProjectName] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isAutoFetch, setIsAutoFetch] = useState(false);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [selectedRFI, setSelectedRFI] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedRFINumber, setSelectedRFINumber] = useState("");
  const [selectedRFINumbering, setSelectedRFINumbering] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportRFI, setSelectedReportRFI] = useState(null);
  const [projectType, setProjectType] = useState("");
  const [showDeleteNotification, setShowDeleteNotification] = useState(false);
  const [selectedNotificationToDelete, setSelectedNotificationToDelete] = useState(null);
  const { mutate: deleteNotification, isLoading: isDeletingNotification } = useDeleteNotification();
  
  const handleDeleteNotification = (item) => {
    if (!item.RFI_Numbering || item.RFI_Numbering === "************") {
      console.error("شماره نوتیفیکیشن معتبر نیست");
      return;
    }

    setSelectedNotificationToDelete({
      rfiNumbering: item.RFI_Numbering,
      rfiNumber: item.RFI_Number,
      vendorName: item.VendorName
    });
    setShowDeleteNotification(true);
  };

  const confirmDeleteNotification = () => {
    if (!selectedNotificationToDelete) return;
    
    deleteNotification(selectedNotificationToDelete.rfiNumbering, {
      onSuccess: () => {
        setSelectedNotificationToDelete(null);
        setShowDeleteNotification(false);
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState({
    RFI_Number: false,
    Report_No: false,
    RFI_Numbering: false,
  });
  const [columnFilters, setColumnFilters] = useState({
    RFI_Number: "",
    Report_No: "",
    RFI_Numbering: "",
  });

  const [showProjectTypeFilter, setShowProjectTypeFilter] = useState(false);
  const [projectTypeFilters, setProjectTypeFilters] = useState({
    خارجی: false,
    "داخلی کالا": false,
    "داخلی کشتی": false,
    Foreign: false,
    "Domestic Goods": false,
    "Domestic Ship": false,
  });

  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [statusFilters, setStatusFilters] = useState({
    Done: false,
    Ongoing: false,
    Cancel: false,
    Cancelled: false,
  });
  const statusFilterButtonRef = useRef(null);
  const projectTypeFilterButtonRef = useRef(null);

  // ========== حالت‌های جدید برای فیلتر بازرس ==========
  const [showInspectorFilter, setShowInspectorFilter] = useState(false);
  const [inspectorFilters, setInspectorFilters] = useState({});
  const inspectorFilterButtonRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: lastIRNData, isLoading: irnLoading } = useLastIRN(
    projectName,
    projectType
  );

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    data: projectTypes,
    isLoading: projectTypesLoading,
    error: projectTypesError
  } = useProjectTypes();

  const [selectedProjectType, setSelectedProjectType] = useState("");
  
  const {
    data: rfiData,
    isLoading: rfiLoading,
    error: rfiError,
  } = useRFIReport(projectName, selectedProjectType, shouldFetch);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setShouldFetch(false);
    setIsAutoFetch(false);
    setSearchTerm("");
    setColumnFilters({
      RFI_Number: "",
      Report_No: "",
      RFI_Numbering: "",
    });
    clearAllProjectTypes();
    clearAllStatuses();
    clearAllInspectors(); // ریست فیلتر بازرس
    setCurrentPage(1);

    const selectedProjectObj = projects?.find(
      (project) => project.id === projectId
    );
    if (selectedProjectObj) {
      setProjectName(selectedProjectObj.name);
    } else {
      setProjectName("");
    }
  };

  const handleSearch = () => {
    if (projectName && selectedProjectType) {
      setShouldFetch(true);
      setIsAutoFetch(false);
      setSearchTerm("");
      setColumnFilters({
        RFI_Number: "",
        Report_No: "",
        RFI_Numbering: "",
      });
      clearAllProjectTypes();
      clearAllStatuses();
      clearAllInspectors(); // ریست فیلتر بازرس
      setCurrentPage(1);
      
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("project", encodeURIComponent(projectName));
      if (selectedProjectType) {
        searchParams.set("type", selectedProjectType);
      }
      window.history.replaceState(
        {},
        "",
        `${location.pathname}?${searchParams.toString()}`
      );
    }
  };

  const handleAddReport = (rfiItem) => {
    setSelectedRFI(rfiItem);
    setShowAddReportModal(true);
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectFromQuery = searchParams.get("project");
    const typeFromQuery = searchParams.get("type");

    if (projectFromQuery) {
      const decodedProjectName = decodeURIComponent(projectFromQuery);
      setProjectName(decodedProjectName);
      setShouldFetch(true);
      setIsAutoFetch(true);
      setCurrentPage(1);

      if (typeFromQuery) {
        setSelectedProjectType(typeFromQuery);
      }

      const foundProject = projects?.find(
        (project) => project.name === decodedProjectName
      );
      if (foundProject) {
        setSelectedProject(foundProject.id);
      }
    } else {
      setIsAutoFetch(false);
      setShouldFetch(false);
    }
  }, [location.search, projects]);

  useEffect(() => {
    if (rfiData && Object.keys(rfiData).length > 0) {
      const firstItem = Object.values(rfiData)[0];
      if (firstItem.Over_Domestic) {
        setProjectType(firstItem.Over_Domestic);
      }
    }
  }, [rfiData]);

  const stats = useMemo(() => {
    if (!rfiData || !shouldFetch) {
      return { total: 0, done: 0, Ongoing: 0 };
    }

    const dataArray = Object.values(rfiData);
    const total = dataArray.length;
    const done = dataArray.filter((item) => item.RFI_Status === "Done").length;
    const Ongoing = dataArray.filter(
      (item) => item.RFI_Status === "Ongoing"
    ).length;

    return { total, done, Ongoing };
  }, [rfiData, shouldFetch]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }

    setSortConfig({ key, direction });
  };

  const extractNumberFromString = (str) => {
    if (!str || str === "************") return 0;

    try {
      const cleanStr = str.replace(/[^\d]/g, "");
      if (cleanStr) {
        const num = parseInt(cleanStr, 10);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    } catch (error) {
      console.error("Error extracting number:", error);
      return 0;
    }
  };

  // تبدیل داده‌های دریافتی به آرایه برای نمایش در جدول
  const tableData = useMemo(() => {
    if (!rfiData || !shouldFetch) return [];

    const dataArray = Object.values(rfiData).map((item) => ({
      ...item,
      formattedInspectionDate: new Date(item.InspectionDate).toLocaleDateString(
        "fa-IR"
      ),
      rfiNumberNum: parseInt(item.RFI_Number) || 0,
      inspectorName: item.Inspector_Name || "-",
    }));

    return dataArray.sort((a, b) => {
      const numA = a.rfiNumberNum;
      const numB = b.rfiNumberNum;

      if (!isNaN(numA) && !isNaN(numB)) {
        return numB - numA;
      }

      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;

      return b.RFI_Number.localeCompare(a.RFI_Number);
    });
  }, [rfiData, shouldFetch]);

  const uniqueProjectTypes = useMemo(() => {
    if (!tableData.length) return [];

    const types = new Set();
    tableData.forEach((item) => {
      if (item.Over_Domestic && item.Over_Domestic.trim() !== "") {
        types.add(item.Over_Domestic.trim());
      }
    });

    return Array.from(types).sort();
  }, [tableData]);

  const uniqueStatuses = useMemo(() => {
    if (!tableData.length) return [];

    const statuses = new Set();
    tableData.forEach((item) => {
      if (item.RFI_Status && item.RFI_Status.trim() !== "") {
        statuses.add(item.RFI_Status.trim());
      }
    });

    return Array.from(statuses).sort((a, b) => {
      const order = { 'Done': 1, 'Ongoing': 2, 'Cancel': 3, 'Cancelled': 4 };
      return (order[a] || 99) - (order[b] || 99);
    });
  }, [tableData]);

  // ========== استخراج مقادیر منحصر به فرد برای بازرس ==========
  const uniqueInspectors = useMemo(() => {
    if (!tableData.length) return [];

    const inspectors = new Set();
    tableData.forEach((item) => {
      const inspector = item.Inspector_Name || "-";
      inspectors.add(inspector);
    });

    // مرتب‌سازی الفبایی
    return Array.from(inspectors).sort((a, b) => {
      if (a === "-") return 1;
      if (b === "-") return -1;
      return a.localeCompare(b, 'fa');
    });
  }, [tableData]);

  // ========== توابع مدیریت فیلتر بازرس ==========
  const handleInspectorFilterChange = (inspector) => {
    setInspectorFilters((prev) => ({
      ...prev,
      [inspector]: !prev[inspector],
    }));
  };

  const selectAllInspectors = () => {
    const allSelected = {};
    uniqueInspectors.forEach((inspector) => {
      allSelected[inspector] = true;
    });
    setInspectorFilters(allSelected);
  };

  const clearAllInspectors = () => {
    setInspectorFilters({});
  };

  const areAllInspectorsSelected = useMemo(() => {
    if (uniqueInspectors.length === 0) return false;
    return uniqueInspectors.every((inspector) => inspectorFilters[inspector]);
  }, [uniqueInspectors, inspectorFilters]);

  const activeInspectorCount = useMemo(() => {
    return uniqueInspectors.filter((inspector) => inspectorFilters[inspector]).length;
  }, [uniqueInspectors, inspectorFilters]);

  const handleProjectTypeFilterChange = (type) => {
    setProjectTypeFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const selectAllProjectTypes = () => {
    const allSelected = {};
    uniqueProjectTypes.forEach((type) => {
      allSelected[type] = true;
    });
    setProjectTypeFilters((prev) => ({
      ...prev,
      ...allSelected,
    }));
  };

  const clearAllProjectTypes = () => {
    const allCleared = {};
    Object.keys(projectTypeFilters).forEach((type) => {
      allCleared[type] = false;
    });
    setProjectTypeFilters(allCleared);
  };

  const areAllProjectTypesSelected = useMemo(() => {
    if (uniqueProjectTypes.length === 0) return false;
    return uniqueProjectTypes.every((type) => projectTypeFilters[type]);
  }, [uniqueProjectTypes, projectTypeFilters]);

  const activeProjectTypeCount = useMemo(() => {
    return uniqueProjectTypes.filter((type) => projectTypeFilters[type]).length;
  }, [uniqueProjectTypes, projectTypeFilters]);

  const handleStatusFilterChange = (status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const selectAllStatuses = () => {
    const allSelected = {};
    uniqueStatuses.forEach((status) => {
      allSelected[status] = true;
    });
    setStatusFilters((prev) => ({
      ...prev,
      ...allSelected,
    }));
  };

  const clearAllStatuses = () => {
    const allCleared = {};
    Object.keys(statusFilters).forEach((status) => {
      allCleared[status] = false;
    });
    setStatusFilters(allCleared);
  };

  const areAllStatusesSelected = useMemo(() => {
    if (uniqueStatuses.length === 0) return false;
    return uniqueStatuses.every((status) => statusFilters[status]);
  }, [uniqueStatuses, statusFilters]);

  const activeStatusCount = useMemo(() => {
    return uniqueStatuses.filter((status) => statusFilters[status]).length;
  }, [uniqueStatuses, statusFilters]);

  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toString()
      .replace(/[\u200C\u200B\s-]/g, "")
      .toLowerCase();
  };

  const checkMatch = (value, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") return true;

    const normalizedValue = normalizeText(value);
    const normalizedSearch = normalizeText(searchTerm);

    if (normalizedValue.includes(normalizedSearch)) return true;

    const numbersInValue = normalizedValue.match(/\d+/g) || [];
    return numbersInValue.some((num) => num.includes(normalizedSearch));
  };

  // اعمال فیلترها و سورتینگ
  const filteredAndSortedData = useMemo(() => {
    if (!tableData.length) return [];

    let filteredData = tableData;

    if (searchTerm.trim()) {
      filteredData = filteredData.filter((item) => {
        return (
          checkMatch(item.RFI_Number, searchTerm) ||
          checkMatch(item.Report_No, searchTerm) ||
          checkMatch(item.RFI_Numbering, searchTerm) ||
          checkMatch(item.ProjectTitle, searchTerm) ||
          checkMatch(item.Inspector_Name, searchTerm)
        );
      });
    }

    Object.keys(columnFilters).forEach((key) => {
      const filterValue = columnFilters[key];
      if (filterValue.trim()) {
        filteredData = filteredData.filter((item) =>
          checkMatch(item[key], filterValue)
        );
      }
    });

    const activeProjectTypeFilters = Object.keys(projectTypeFilters).filter(
      (type) => projectTypeFilters[type]
    );

    if (activeProjectTypeFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        if (!item.Over_Domestic) return false;
        return activeProjectTypeFilters.includes(item.Over_Domestic.trim());
      });
    }

    const activeStatusFilters = Object.keys(statusFilters).filter(
      (status) => statusFilters[status]
    );

    if (activeStatusFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        if (!item.RFI_Status) return false;
        return activeStatusFilters.includes(item.RFI_Status.trim());
      });
    }

    // ========== فیلتر بازرس ==========
    const activeInspectorFilters = Object.keys(inspectorFilters).filter(
      (inspector) => inspectorFilters[inspector]
    );

    if (activeInspectorFilters.length > 0) {
      filteredData = filteredData.filter((item) => {
        const inspector = item.Inspector_Name || "-";
        return activeInspectorFilters.includes(inspector);
      });
    }

    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "RFI_Number":
          aValue = parseInt(a.RFI_Number) || 0;
          bValue = parseInt(b.RFI_Number) || 0;
          break;

        case "RFI_Status":
          const getStatusPriority = (status) => {
            if (!status) return 99;
            const statusStr = String(status).toLowerCase().trim();
            if (statusStr === "done") return 1;
            if (statusStr === "ongoing") return 2;
            if (statusStr === "cancel" || statusStr === "cancelled") return 3;
            return 99;
          };
          aValue = getStatusPriority(a.RFI_Status);
          bValue = getStatusPriority(b.RFI_Status);
          break;

        case "InspectionDate":
          aValue = new Date(a.InspectionDate).getTime();
          bValue = new Date(b.InspectionDate).getTime();
          break;

        case "Inspector_Name":
          aValue = a.Inspector_Name || "";
          bValue = b.Inspector_Name || "";
          break;

        case "IRNNO":
          aValue = parseInt(a.IRNNO) || 0;
          bValue = parseInt(b.IRNNO) || 0;
          break;

        case "Duration":
          aValue = parseInt(a.Duration) || 0;
          bValue = parseInt(b.Duration) || 0;
          break;

        case "Report_No":
          aValue = extractNumberFromString(a.Report_No);
          bValue = extractNumberFromString(b.Report_No);
          if (aValue === 0 && bValue === 0) {
            aValue = a.Report_No || "";
            bValue = b.Report_No || "";
          }
          break;

        case "RFI_Numbering":
          aValue = extractNumberFromString(a.RFI_Numbering);
          bValue = extractNumberFromString(b.RFI_Numbering);
          if (aValue === 0 && bValue === 0) {
            aValue = a.RFI_Numbering || "";
            bValue = b.RFI_Numbering || "";
          }
          break;

        case "ProjectTitle":
          aValue = a.ProjectTitle || "";
          bValue = b.ProjectTitle || "";
          break;

        case "Over_Domestic":
          const projectTypeOrder = {
            "داخلی کالا": 1,
            "داخلی کشتی": 2,
            خارجی: 3,
            "Domestic Goods": 1,
            "Domestic Ship": 2,
            Foreign: 3,
          };
          const typeA = a.Over_Domestic || "";
          const typeB = b.Over_Domestic || "";
          aValue = projectTypeOrder[typeA] || projectTypeOrder[typeA.toLowerCase()] || 99;
          bValue = projectTypeOrder[typeB] || projectTypeOrder[typeB.toLowerCase()] || 99;
          break;

        default:
          aValue = a[sortConfig.key] || "";
          bValue = b[sortConfig.key] || "";
          break;
      }

      let comparison = 0;

      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue), "fa-IR");
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [tableData, searchTerm, columnFilters, projectTypeFilters, statusFilters, inspectorFilters, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedData.length / itemsPerPage);
  }, [filteredAndSortedData.length, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  useEffect(() => {
    const hasColumnFilter = Object.values(columnFilters).some(
      (filter) => filter.trim() !== ""
    );
    if (hasColumnFilter) {
      setCurrentPage(1);
    }
  }, [columnFilters]);

  useEffect(() => {
    if (activeProjectTypeCount > 0) {
      setCurrentPage(1);
    }
  }, [activeProjectTypeCount]);

  useEffect(() => {
    if (activeStatusCount > 0) {
      setCurrentPage(1);
    }
  }, [activeStatusCount]);

  // ========== اضافه کردن useEffect برای فیلتر بازرس ==========
  useEffect(() => {
    if (activeInspectorCount > 0) {
      setCurrentPage(1);
    }
  }, [activeInspectorCount]);

  const handleOpenNotificationModal = (item) => {
    if (item.RFI_Numbering && item.RFI_Numbering !== "************") {
      setSelectedRFINumbering(item.RFI_Numbering);
      setShowNotificationModal(true);
    } else {
      console.error("شماره RFI_Numbering معتبر نیست");
    }
  };

// src/components/rfi/RFIReportTable.jsx - خط حدود 265

const handleOpenReportModal = (item) => {
  // حتی اگر Report_No === "************" باشه، باز هم item رو ست می‌کنیم
  // تا AddReportModal بدون reportInfo باز بشه
  setSelectedReportRFI(item);
  setShowReportModal(true);
  
  // نیازی به چک کردن hasExistingReport نیست، 
  // AddReportModal خودش تشخیص میده که reportInfo داریم یا نه
};

  const handleColumnFilterChange = (columnKey, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: value,
    }));
  };

  const toggleColumnFilter = (columnKey) => {
    setShowColumnFilters((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const clearColumnFilter = (columnKey) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnKey]: "",
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setColumnFilters({
      RFI_Number: "",
      Report_No: "",
      RFI_Numbering: "",
    });
    clearAllProjectTypes();
    clearAllStatuses();
    clearAllInspectors(); // اضافه کردن ریست فیلتر بازرس
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (columnFilters.RFI_Number.trim()) count++;
    if (columnFilters.Report_No.trim()) count++;
    if (columnFilters.RFI_Numbering.trim()) count++;
    if (activeProjectTypeCount > 0) count++;
    if (activeStatusCount > 0) count++;
    if (activeInspectorCount > 0) count++; // اضافه کردن فیلتر بازرس
    return count;
  }, [searchTerm, columnFilters, activeProjectTypeCount, activeStatusCount, activeInspectorCount]);

  const showEmptyState =
    shouldFetch && !rfiLoading && !rfiError && tableData.length === 0;
  const showInitialState = !shouldFetch && !rfiLoading && !isAutoFetch;
  const showAutoFetchLoading = isAutoFetch && rfiLoading;
  const showManualLoading = !isAutoFetch && rfiLoading;
  const showResults = shouldFetch && tableData.length > 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <StepHeader
          title="گزارش پروژه‌ها"
          description="مشاهده گزارش‌ها بر اساس پروژه انتخابی"
          icon={FaTable}
        />

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-3 lg:p-4">
          {isAutoFetch && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsAutoFetch(false);
                      setShouldFetch(false);
                      setProjectName("");
                      setSelectedProject("");
                      setSearchTerm("");
                      setColumnFilters({
                        RFI_Number: "",
                        Report_No: "",
                        RFI_Numbering: "",
                      });
                      clearAllProjectTypes();
                      clearAllStatuses();
                      clearAllInspectors();
                      setCurrentPage(1);
                    }}
                    className="hover:bg-blue-700 p-1.5 rounded-full transition duration-200"
                    title="خروج از حالت خودکار و انتخاب پروژه جدید"
                  >
                    <FaArrowLeft className="text-xl rotate-180" />
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      پروژه: {projectName}
                    </h3>
                  </div>
                </div>
                {rfiLoading && (
                  <FaSync className="animate-spin text-white text-xl" />
                )}
              </div>
            </div>
          )}

          {!isAutoFetch && (
            <div className="mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
                <div className="lg:col-span-4">
                  <SelectField
                    label="انتخاب پروژه *"
                    value={selectedProject}
                    onChange={handleProjectChange}
                    options={projects || []}
                    placeholder={
                      projectsLoading
                        ? "در حال دریافت لیست پروژه‌ها..."
                        : projectsError
                        ? "خطا در دریافت پروژه‌ها"
                        : "انتخاب پروژه"
                    }
                    disabled={projectsLoading || !!projectsError}
                    className="py-2 w-full"
                  />
                </div>

                <div className="lg:col-span-4">
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                      نوع پروژه *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedProjectType}
                        onChange={(e) => setSelectedProjectType(e.target.value)}
                        className="w-full py-2 pl-3 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none"
                        disabled={projectTypesLoading}
                        required
                      >
                        <option value="" disabled>
                          {projectTypesLoading ? "در حال دریافت..." : "انتخاب نوع پروژه"}
                        </option>
                        {projectTypes?.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <Button
                    onClick={handleSearch}
                    variant="primary"
                    icon="search"
                    disabled={!projectName || !selectedProjectType || rfiLoading}
                    className="w-full py-2 h-[40px]"
                  >
                    {rfiLoading ? (
                      <span className="flex items-center justify-center">
                        <FaSync className="animate-spin ml-2" />
                        در حال جستجو...
                      </span>
                    ) : (
                      "جستجو"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showResults && (
            <div className="mb-4">
              <div className="relative">
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FaSearch className="text-sm" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجوی سریع در RFI، شماره گزارش، نوتیفیکیشن، بازرس..."
                  className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          )}

          {showResults && (
            <div className="mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 text-white shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:gap-2">
                    <div className="flex items-center gap-0 sm:gap-1">
                      <FaCalendarCheck className="text-base flex-shrink-0" />
                      <span className="text-xs font-medium flex-shrink-0">
                        آخرین‌IRN:
                      </span>
                      <span className="text-base font-bold flex-shrink-0">
                        {irnLoading ? (
                          <FaSync className="animate-spin inline text-xs" />
                        ) : (
                          lastIRNData?.irnno || 0
                        )}
                      </span>
                    </div>

                    {lastIRNData?.rfi_numer && (
                      <div className="text-white text-sm font-semibold whitespace-nowrap sm:whitespace-normal break-words">
                        {`(RFI:${lastIRNData.rfi_numer})`}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 text-white shadow">
                  <div className="flex items-center gap-2">
                    <FaListAlt className="text-base" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">کل گزارش‌ها</span>
                      <span className="text-base font-bold">{stats.total}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2 text-white shadow">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-base" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">انجام شده</span>
                      <span className="text-base font-bold">{stats.done}</span>
                      {stats.total > 0 && (
                        <span className="text-green-200 text-[10px]">
                          ({Math.round((stats.done / stats.total) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2 text-white shadow">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-base" />
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">در حال انجام</span>
                      <span className="text-base font-bold">
                        {stats.Ongoing}
                      </span>
                      {stats.total > 0 && (
                        <span className="text-amber-200 text-[10px]">
                          ({Math.round((stats.Ongoing / stats.total) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rfiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm flex items-center">
                <svg
                  className="w-4 h-4 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                خطا در دریافت داده‌ها: {rfiError.message}
              </p>
            </div>
          )}

          {/* Desktop Table با اسکرول افقی */}
          {showResults && (
            <>
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table className="w-full text-sm" style={{ minWidth: "1300px" }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                      <FilterableSortHeader
                        title="شماره‌پروژه"
                        sortKey="RFI_Number"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        filterValue={columnFilters.RFI_Number}
                        onFilterChange={(value) =>
                          handleColumnFilterChange("RFI_Number", value)
                        }
                        showFilter={showColumnFilters.RFI_Number}
                        onToggleFilter={() => toggleColumnFilter("RFI_Number")}
                        onClearFilter={() => clearColumnFilter("RFI_Number")}
                        placeholder="فیلتر عددی"
                      />

                      <th className="p-3 font-semibold text-white text-xs min-w-20 relative">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="truncate text-center">وضعیت</span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                ref={statusFilterButtonRef}
                                onClick={() => setShowStatusFilter(!showStatusFilter)}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  activeStatusCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title={
                                  activeStatusCount > 0
                                    ? "فیلتر وضعیت فعال - کلیک برای تغییر"
                                    : "افزودن فیلتر وضعیت"
                                }
                              >
                                <FaFilter
                                  className={`text-xs ${
                                    activeStatusCount > 0 ? "text-yellow-300" : "text-white"
                                  }`}
                                />
                              </button>

                              <button
                                onClick={() => handleSort("RFI_Status")}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  sortConfig.key === "RFI_Status" ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title="مرتب‌سازی وضعیت"
                              >
                                <SortIcon columnKey="RFI_Status" sortConfig={sortConfig} />
                              </button>
                            </div>
                          </div>

                          {activeStatusCount > 0 && !showStatusFilter && (
                            <div className="w-full flex justify-center">
                              <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-full text-center">
                                {activeStatusCount} انتخاب
                                <button
                                  onClick={clearAllStatuses}
                                  className="mr-1 text-yellow-200 hover:text-white"
                                  title="حذف همه انتخاب‌ها"
                                >
                                  <FaTimes className="text-[8px]" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </th>

                      <SortHeader
                        title="تاریخ بازرسی"
                        sortKey="InspectionDate"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />

                      {/* ستون بازرس با فیلتر چک‌باکس */}
                      <th className="p-3 font-semibold text-white text-xs min-w-20 relative">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="truncate text-center">بازرس</span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                ref={inspectorFilterButtonRef}
                                onClick={() => setShowInspectorFilter(!showInspectorFilter)}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  activeInspectorCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title={
                                  activeInspectorCount > 0
                                    ? "فیلتر بازرس فعال - کلیک برای تغییر"
                                    : "افزودن فیلتر بازرس"
                                }
                              >
                                <FaFilter
                                  className={`text-xs ${
                                    activeInspectorCount > 0 ? "text-yellow-300" : "text-white"
                                  }`}
                                />
                              </button>

                              <button
                                onClick={() => handleSort("Inspector_Name")}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  sortConfig.key === "Inspector_Name" ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title="مرتب‌سازی بازرس"
                              >
                                <SortIcon columnKey="Inspector_Name" sortConfig={sortConfig} />
                              </button>
                            </div>
                          </div>

                          {activeInspectorCount > 0 && !showInspectorFilter && (
                            <div className="w-full flex justify-center">
                              <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-full text-center">
                                {activeInspectorCount} انتخاب
                                <button
                                  onClick={clearAllInspectors}
                                  className="mr-1 text-yellow-200 hover:text-white"
                                  title="حذف همه انتخاب‌ها"
                                >
                                  <FaTimes className="text-[8px]" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </th>

                      <SortHeader
                        title="IRN"
                        sortKey="IRNNO"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />

                      <SortHeader
                        title="مدت"
                        sortKey="Duration"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />

                      <FilterableSortHeader
                        title="شماره گزارش"
                        sortKey="Report_No"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        filterValue={columnFilters.Report_No}
                        onFilterChange={(value) =>
                          handleColumnFilterChange("Report_No", value)
                        }
                        showFilter={showColumnFilters.Report_No}
                        onToggleFilter={() => toggleColumnFilter("Report_No")}
                        onClearFilter={() => clearColumnFilter("Report_No")}
                        placeholder="مثل: FAH-INS-PCH-0480"
                      />

                      <FilterableSortHeader
                        title="شماره نوتیفیکشن"
                        sortKey="RFI_Numbering"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        filterValue={columnFilters.RFI_Numbering}
                        onFilterChange={(value) =>
                          handleColumnFilterChange("RFI_Numbering", value)
                        }
                        showFilter={showColumnFilters.RFI_Numbering}
                        onToggleFilter={() => toggleColumnFilter("RFI_Numbering")}
                        onClearFilter={() => clearColumnFilter("RFI_Numbering")}
                        placeholder="مثل: FAH-INS-PCH-0480"
                      />

                      <th className="p-3 font-semibold text-white text-xs min-w-20 relative">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="truncate text-center">نوع پروژه</span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                ref={projectTypeFilterButtonRef}
                                onClick={() => setShowProjectTypeFilter(!showProjectTypeFilter)}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  activeProjectTypeCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title={
                                  activeProjectTypeCount > 0
                                    ? "فیلتر فعال - کلیک برای تغییر"
                                    : "افزودن فیلتر"
                                }
                              >
                                <FaFilter
                                  className={`text-xs ${
                                    activeProjectTypeCount > 0 ? "text-yellow-300" : "text-white"
                                  }`}
                                />
                              </button>

                              <button
                                onClick={() => handleSort("Over_Domestic")}
                                className={`p-1 rounded transition-colors duration-200 flex items-center ${
                                  sortConfig.key === "Over_Domestic" ? "bg-blue-700" : "hover:bg-blue-700"
                                }`}
                                title="مرتب‌سازی نوع پروژه"
                              >
                                <SortIcon columnKey="Over_Domestic" sortConfig={sortConfig} />
                              </button>
                            </div>
                          </div>

                          {activeProjectTypeCount > 0 && !showProjectTypeFilter && (
                            <div className="w-full flex justify-center">
                              <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-full text-center">
                                {activeProjectTypeCount} انتخاب
                                <button
                                  onClick={clearAllProjectTypes}
                                  className="mr-1 text-yellow-200 hover:text-white"
                                  title="حذف همه انتخاب‌ها"
                                >
                                  <FaTimes className="text-[8px]" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </th>

                      <th className="p-3 font-semibold text-white text-xs text-center min-w-[70px]">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData?.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-200 transition duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50`}
                      >
                        <td className="p-3 font-semibold text-gray-800 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <span>{item.RFI_Number}</span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                item.RFI_Status
                              )}`}
                            >
                              {getPersianStatus(item.RFI_Status)}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-gray-700 text-center">
                          {item.formattedInspectionDate}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FaUserTie className="text-gray-400 text-xs flex-shrink-0" />
                            <span className={`text-gray-700 ${item.Inspector_Name === "-" ? "text-gray-400" : "font-medium"}`}>
                              {item.Inspector_Name}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center">
                            {item.IRNNO ? (
                              <span className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 px-2 py-1 rounded text-xs font-medium border border-purple-200">
                                {item.IRNNO}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center">
                            {item.Duration ? (
                              <>
                                <span className="font-semibold text-gray-800">
                                  {item.Duration} روز
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 font-mono text-gray-900 text-xs text-center">
                          <div className="flex justify-center">
                            {item.Report_No === "************" ||
                            !item.Report_No ? (
                              <button
                                onClick={() => handleOpenReportModal(item)}
                                className="text-gray-600 hover:text-blue-800 hover:underline transition duration-200 font-mono tracking-wider"
                                title="مدیریت گزارش"
                              >
                                ************
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReportModal(item)}
                                className="text-blue-600 hover:text-blue-800 hover:underline transition duration-200 font-medium"
                                title="مشاهده و ویرایش گزارش"
                              >
                                {item.Report_No}
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="p-3 font-mono text-gray-900 text-xs text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleOpenNotificationModal(item)}
                              className={`text-blue-600 hover:text-blue-800 hover:underline transition duration-200 font-medium ${
                                !item.RFI_Numbering ||
                                item.RFI_Numbering === "************"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title={
                                !item.RFI_Numbering ||
                                item.RFI_Numbering === "************"
                                  ? "شماره RFI_Numbering معتبر نیست"
                                  : "مشاهده اطلاعات نوتیفیکیشن"
                              }
                            >
                              {item.NotificationNo && item.NotificationNo !== "************" 
                                ? `\u200E${item.NotificationNo}`
                                : item.NotificationNo
                              }
                            </button>
                          </div>
                        </td>

                        <td className="p-3 text-gray-700 text-center">
                          <div className="flex justify-center">
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium inline-block">
                              {getPersianProjectType(item.Over_Domestic)}
                            </span>
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDeleteNotification(item)}
                              disabled={
                                !item.RFI_Numbering ||
                                item.RFI_Numbering === "************" ||
                                isDeletingNotification
                              }
                              className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={
                                !item.RFI_Numbering || item.RFI_Numbering === "************"
                                  ? " "
                                  : "حذف سطر"
                              }
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {activeFiltersCount > 0 && (
                  <div className="bg-blue-50 border-t border-blue-200 p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700 font-semibold">
                          نتایج فیلتر شده:
                        </span>
                        <span className="text-blue-600">
                          {filteredAndSortedData.length} از {tableData.length}{" "}
                          مورد
                        </span>
                        {searchTerm && (
                          <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                            جستجو: {searchTerm}
                          </span>
                        )}
                        {activeProjectTypeCount > 0 && (
                          <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-xs">
                            نوع پروژه: {activeProjectTypeCount} مورد
                          </span>
                        )}
                        {activeStatusCount > 0 && (
                          <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-xs">
                            وضعیت: {activeStatusCount} مورد
                          </span>
                        )}
                        {activeInspectorCount > 0 && (
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs">
                            بازرس: {activeInspectorCount} مورد
                          </span>
                        )}
                      </div>
                      <button
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1"
                      >
                        <FaTimes className="text-xs" />
                        حذف همه فیلترها
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {totalPages > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedData.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </>
          )}

          {/* Mobile View */}
          {showResults && (
            <div className="md:hidden space-y-3">
              {paginatedData.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-semibold text-gray-800">
                          شماره RFI: {item.RFI_Number}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          item.RFI_Status
                        )}`}
                      >
                        {getPersianStatus(item.RFI_Status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600 font-medium">
                          تاریخ بازرسی:
                        </span>
                        <p className="text-gray-800">
                          {item.formattedInspectionDate}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">
                          بازرس:
                        </span>
                        <p className="text-gray-800 flex items-center gap-1">
                          <FaUserTie className="text-gray-400 text-xs" />
                          <span className={item.Inspector_Name === "-" ? "text-gray-400" : ""}>
                            {item.Inspector_Name}
                          </span>
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">IRN:</span>
                        <p className="text-gray-800 font-semibold">
                          {item.IRNNO ? (
                            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-medium">
                              {item.IRNNO}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">
                          مدت بازرسی:
                        </span>
                        <p className="text-gray-800 font-semibold">
                          {item.Duration ? (
                            <span className="text-blue-600">
                              {item.Duration} روز
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">
                          شماره گزارش:
                        </span>
                        {item.Report_No === "********" ? (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-gray-400">********</span>
                            <button
                              onClick={() => handleAddReport(item)}
                              className="text-green-600 hover:text-green-800 transition duration-200 text-xs flex items-center gap-1"
                            >
                              <FaPlusCircle className="text-xs" />
                              <span>ثبت گزارش</span>
                            </button>
                          </div>
                        ) : (
                          <p className="text-gray-800 font-mono text-xs">
                            {item.Report_No}
                          </p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-gray-600 font-medium">
                          RFI Numbering:
                        </span>
                        <p className="text-gray-800 font-mono text-xs">
                          {item.RFI_Numbering}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">
                          نام پروژه:
                        </span>
                        <p className="text-gray-800">{item.ProjectTitle}</p>
                      </div>

                      <div>
                        <span className="text-gray-600 font-medium">
                          نوع پروژه:
                        </span>
                        <p className="text-gray-800">
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-medium">
                            {getPersianProjectType(item.Over_Domestic)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {totalPages > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedData.length}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </div>
          )}

          {showResults && (
            <div className="mt-3 text-xs text-gray-600 bg-blue-50 rounded-lg p-2 border border-blue-200">
              <span className="font-semibold text-blue-800">تعداد گزارش: </span>
              <span className="font-bold text-blue-600">
                {filteredAndSortedData.length} مورد
              </span>
              <span className="mr-2 text-blue-700">
                برای پروژه: {projectName}
              </span>
              {activeFiltersCount > 0 && (
                <span className="text-blue-600 text-xs bg-blue-100 px-1.5 py-0.5 rounded mr-2">
                  {activeFiltersCount} فیلتر فعال
                </span>
              )}
              {isAutoFetch && (
                <span className="text-blue-600 text-xs bg-blue-100 px-1.5 py-0.5 rounded mr-2">
                  بارگذاری خودکار
                </span>
              )}
            </div>
          )}

          {showEmptyState && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaFileAlt className="text-3xl mx-auto mb-2 text-gray-400" />
              <p className="text-base font-semibold">گزارش یافت نشد</p>
              <p className="text-xs text-gray-400 mt-1">
                برای پروژه{" "}
                <span className="font-semibold text-gray-600">
                  {projectName}
                </span>{" "}
                هیچ گزارشی موجود نیست.
              </p>
            </div>
          )}

          {showInitialState && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSearch className="text-3xl mx-auto mb-2 text-indigo-400" />
              <p className="text-base font-semibold">انتخاب پروژه</p>
              <p className="text-xs text-gray-400 mt-1">
                لطفاً یک پروژه از لیست انتخاب کنید و دکمه جستجو را بزنید.
              </p>
            </div>
          )}

          {showAutoFetchLoading && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSync className="text-3xl mx-auto mb-2 text-blue-400 animate-spin" />
              <p className="text-xs text-gray-400 mt-1">
                گزارش برای پروژه{" "}
                <span className="font-semibold text-gray-600">
                  {projectName}
                </span>{" "}
                در حال بارگذاری است.
              </p>
            </div>
          )}

          {showManualLoading && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSync className="text-3xl mx-auto mb-2 text-indigo-400 animate-spin" />
              <p className="text-lg font-semibold">در حال جستجو...</p>
              <p className="text-xs text-gray-400 mt-1">
                در حال دریافت گزارش‌های برای پروژه{" "}
                <span className="font-semibold text-gray-600">
                  {projectName}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      <AddReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReportRFI(null);
        }}
        rfiData={selectedReportRFI}
        nextIRN={lastIRNData?.next_irnno?.toString() || ""}
      />

      <NotificationInfoModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notificationData={selectedNotification}
        rfiNumber={selectedRFINumbering}
      />

      <DeleteNotificationPopover
        isOpen={showDeleteNotification}
        onClose={() => {
          setShowDeleteNotification(false);
          setSelectedNotificationToDelete(null);
        }}
        onConfirm={confirmDeleteNotification}
        rfiNumbering={selectedNotificationToDelete?.rfiNumbering || ''}
        title="حذف سطر"
        message={`آیا مطمئن هستید که می‌خواهید اطلاعات ${selectedNotificationToDelete?.rfiNumbering} را حذف کنید؟ این عمل تمام اطلاعات مرتبط با این سطر را پاک می‌کند.`}
        confirmText={isDeletingNotification ? "در حال حذف..." : "بله، حذف شود"}
        cancelText="انصراف"
        isLoading={isDeletingNotification}
      />

      <ProjectTypeFilterDropdown
        isOpen={showProjectTypeFilter}
        onClose={() => setShowProjectTypeFilter(false)}
        uniqueTypes={uniqueProjectTypes}
        selectedTypes={projectTypeFilters}
        onTypeChange={handleProjectTypeFilterChange}
        onSelectAll={
          areAllProjectTypesSelected ? clearAllProjectTypes : selectAllProjectTypes
        }
        onClearAll={clearAllProjectTypes}
        areAllSelected={areAllProjectTypesSelected}
        activeCount={activeProjectTypeCount}
        buttonRef={projectTypeFilterButtonRef}
      />

      <StatusFilterDropdown
        isOpen={showStatusFilter}
        onClose={() => setShowStatusFilter(false)}
        uniqueStatuses={uniqueStatuses}
        selectedStatuses={statusFilters}
        onStatusChange={handleStatusFilterChange}
        onSelectAll={
          areAllStatusesSelected ? clearAllStatuses : selectAllStatuses
        }
        onClearAll={clearAllStatuses}
        areAllSelected={areAllStatusesSelected}
        activeCount={activeStatusCount}
        buttonRef={statusFilterButtonRef}
      />

      {/* Dropdown فیلتر بازرس */}
      <InspectorFilterDropdown
        isOpen={showInspectorFilter}
        onClose={() => setShowInspectorFilter(false)}
        uniqueInspectors={uniqueInspectors}
        selectedInspectors={inspectorFilters}
        onInspectorChange={handleInspectorFilterChange}
        onSelectAll={
          areAllInspectorsSelected ? clearAllInspectors : selectAllInspectors
        }
        onClearAll={clearAllInspectors}
        areAllSelected={areAllInspectorsSelected}
        activeCount={activeInspectorCount}
        buttonRef={inspectorFilterButtonRef}
      />
    </div>
  );
};

export default RFIReportTable;

// ========== کامپوننت‌های کمکی ==========

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) {
    return (
      <div className="flex flex-col items-center">
        <FaSortUp className="text-gray-300 hover:text-white text-xs -mb-1" />
        <FaSortDown className="text-gray-300 hover:text-white text-xs -mt-1" />
      </div>
    );
  }

  return sortConfig.direction === "asc" ? (
    <FaSortUp className="text-yellow-300 text-xs" />
  ) : (
    <FaSortDown className="text-yellow-300 text-xs" />
  );
};

const FilterableSortHeader = ({
  title,
  sortKey,
  sortConfig,
  onSort,
  filterValue,
  onFilterChange,
  showFilter,
  onToggleFilter,
  onClearFilter,
  placeholder = "فیلتر...",
}) => {
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const headerRef = useRef(null);
  const popoverRef = useRef(null);

  const isActive = sortConfig.key === sortKey;
  const hasFilter = filterValue && filterValue.trim() !== "";

  const calculatePopoverPosition = () => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2 - 100,
        width: 200,
      };
    }
    return { top: 0, left: 0, width: 200 };
  };

  useEffect(() => {
    if (showFilter && headerRef.current) {
      const position = calculatePopoverPosition();
      setPopoverPosition(position);
    }
  }, [showFilter]);

  return (
    <th
      ref={headerRef}
      className="p-3 font-semibold text-white text-xs min-w-20 relative"
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <span className="truncate text-center">{title}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={onToggleFilter}
              className={`p-1 rounded transition-colors duration-200 flex items-center ${
                hasFilter ? "bg-blue-700" : "hover:bg-blue-700"
              }`}
              title={
                hasFilter ? "فیلتر فعال - کلیک برای تغییر" : "افزودن فیلتر"
              }
            >
              <FaFilter
                className={`text-xs ${
                  hasFilter ? "text-yellow-300" : "text-white"
                }`}
              />
            </button>

            <button
              onClick={() => onSort(sortKey)}
              className={`p-1 rounded transition-colors duration-200 flex items-center ${
                isActive ? "bg-blue-700" : "hover:bg-blue-700"
              }`}
              title={`مرتب‌سازی ${title}`}
            >
              <SortIcon columnKey={sortKey} sortConfig={sortConfig} />
            </button>
          </div>
        </div>

        {hasFilter && !showFilter && (
          <div className="w-full flex justify-center">
            <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full truncate max-w-full text-center">
              {filterValue.length > 8
                ? `${filterValue.substring(0, 8)}...`
                : filterValue}
              <button
                onClick={onClearFilter}
                className="mr-1 text-yellow-200 hover:text-white"
                title="حذف فیلتر"
              >
                <FaTimes className="text-[8px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showFilter && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggleFilter} />
          <div
            ref={popoverRef}
            className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-300 p-2"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: `${popoverPosition.width}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-gray-700 mb-1 text-center">
                فیلتر {title}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={filterValue}
                  onChange={(e) => onFilterChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pr-8 pl-2 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 text-center"
                  autoFocus
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <FaSearch className="text-xs text-gray-400" />
                </div>
                {hasFilter && (
                  <button
                    onClick={onClearFilter}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="حذف فیلتر"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                )}
              </div>
              <div className="flex justify-between gap-1">
                <button
                  onClick={onToggleFilter}
                  className="flex-1 text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition duration-200"
                >
                  بستن
                </button>
                {hasFilter && (
                  <button
                    onClick={onClearFilter}
                    className="flex-1 text-xs py-1 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition duration-200"
                  >
                    حذف فیلتر
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </th>
  );
};

const SortHeader = ({ title, sortKey, sortConfig, onSort }) => {
  const isActive = sortConfig.key === sortKey;

  return (
    <th className="p-3 font-semibold text-white text-xs min-w-20">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1">
          <span className="truncate text-center">{title}</span>
          <button
            onClick={() => onSort(sortKey)}
            className={`p-1 rounded transition-colors duration-200 flex items-center ${
              isActive ? "bg-blue-700" : "hover:bg-blue-700"
            }`}
            title={`مرتب‌سازی ${title}`}
          >
            <SortIcon columnKey={sortKey} sortConfig={sortConfig} />
          </button>
        </div>
      </div>
    </th>
  );
};