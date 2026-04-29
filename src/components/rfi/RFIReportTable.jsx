import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
import {
  FaTable, FaSearch, FaSync, FaFileAlt, FaTrash, FaArrowRight,
  FaCheckCircle, FaClock, FaListAlt, FaPlusCircle, FaSort, FaSortUp, FaSortDown,
  FaFilter, FaTimes, FaArrowLeft, FaUserTie,FaCalendarCheck 
} from "react-icons/fa";

import StepHeader from "../common/StepHeader";
import Button from "../ui/Button";
import AddReportModal from "../ui/AddReportModal/AddReportModal";
import NotificationInfoModal from "../ui/NotificationInfoModal/NotificationInfoModal";
import { useLastIRN } from "../../hooks/useProjects";
import PaginationControls from "../ui/PaginationControls";
import SearchableSelect from "../ui/SearchableSelect";
import { useProjects } from "../../hooks/useProjects";
import { useRFIReport } from "../../hooks/useRFIReport";
import DeleteNotificationPopover from "./DeleteNotificationPopover";
import { useDeleteNotification } from "../../hooks/useNotificationNumber";
import { useProjectTypes } from "../../hooks/useProjectTypes";
import { getPersianProjectType, getStatusColor, getPersianStatus } from "./../../utils/helpers";

// ========== کامپوننت ProjectTypeFilterDropdown ==========
const ProjectTypeFilterDropdown = ({ isOpen, onClose, uniqueTypes, selectedTypes, onTypeChange, onSelectAll, onClearAll, areAllSelected, activeCount, buttonRef }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 240;
      let rightPosition = viewportWidth - buttonRect.right;
      if (rightPosition < dropdownWidth) rightPosition = Math.max(10, rightPosition);
      setPosition({ top: buttonRect.bottom + window.scrollY + 5, right: rightPosition });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[140px] max-w-[200px]" style={{ top: `${position.top}px`, right: `${position.right}px` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-2 border-b bg-gray-50"><div className="text-sm font-semibold text-gray-700">فیلتر نوع پروژه</div><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-sm" /></button></div>
        <div className="flex justify-between items-center p-2 border-b"><button onClick={onSelectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{areAllSelected ? "لغو همه" : "انتخاب همه"}</button><span className="text-xs text-gray-500">{activeCount} از {uniqueTypes.length}</span></div>
        <div className="max-h-[200px] overflow-y-auto p-1">{uniqueTypes.length > 0 ? uniqueTypes.map((type) => (<label key={type} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={selectedTypes[type] || false} onChange={() => onTypeChange(type)} className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500" /><div className="flex-1"><span className="text-sm text-gray-800 font-sm">{getPersianProjectType(type)}</span></div></label>)) : <div className="text-center py-4 text-gray-500">داده‌ای برای فیلتر موجود نیست</div>}</div>
        <div className="flex gap-1 p-0.5 border-t bg-gray-50"><button onClick={onClose} className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">اعمال فیلتر</button><button onClick={onClearAll} className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium" disabled={activeCount === 0}>حذف همه</button></div>
      </div>
    </>,
    document.body
  );
};

// ========== کامپوننت StatusFilterDropdown ==========
const StatusFilterDropdown = ({ isOpen, onClose, uniqueStatuses, selectedStatuses, onStatusChange, onSelectAll, onClearAll, areAllSelected, activeCount, buttonRef }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 200;
      let rightPosition = viewportWidth - buttonRect.right;
      if (rightPosition < dropdownWidth) rightPosition = Math.max(10, rightPosition);
      setPosition({ top: buttonRect.bottom + window.scrollY + 5, right: rightPosition });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  const getStatusColorForFilter = (status) => {
    const statusStr = String(status).toLowerCase().trim();
    switch(statusStr) {
      case 'done': case 'انجام شده': return 'bg-green-100 text-green-800 border-green-200';
      case 'ongoing': case 'در حال انجام': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancel': case 'cancelled': case 'لغو شده': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[160px] max-w-[220px]" style={{ top: `${position.top}px`, right: `${position.right}px` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-2 border-b bg-gray-50"><div className="text-sm font-semibold text-gray-700">فیلتر وضعیت</div><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-sm" /></button></div>
        <div className="flex justify-between items-center p-2 border-b"><button onClick={onSelectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{areAllSelected ? "لغو همه" : "انتخاب همه"}</button><span className="text-xs text-gray-500">{activeCount} از {uniqueStatuses.length}</span></div>
        <div className="max-h-[200px] overflow-y-auto p-1">{uniqueStatuses.length > 0 ? uniqueStatuses.map((status) => (<label key={status} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={selectedStatuses[status] || false} onChange={() => onStatusChange(status)} className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500" /><div className="flex-1"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColorForFilter(status)}`}>{getPersianStatus(status)}</span></div></label>)) : <div className="text-center py-4 text-gray-500">داده‌ای برای فیلتر موجود نیست</div>}</div>
        <div className="flex gap-1 p-0.5 border-t bg-gray-50"><button onClick={onClose} className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">اعمال فیلتر</button><button onClick={onClearAll} className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium" disabled={activeCount === 0}>حذف همه</button></div>
      </div>
    </>,
    document.body
  );
};

// ========== کامپوننت InspectorFilterDropdown ==========
const InspectorFilterDropdown = ({ isOpen, onClose, uniqueInspectors, selectedInspectors, onInspectorChange, onSelectAll, onClearAll, areAllSelected, activeCount, buttonRef }) => {
  const [position, setPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 220;
      let rightPosition = viewportWidth - buttonRect.right;
      if (rightPosition < dropdownWidth) rightPosition = Math.max(10, rightPosition);
      setPosition({ top: buttonRect.bottom + window.scrollY + 5, right: rightPosition });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen || !buttonRef.current) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-300 min-w-[180px] max-w-[250px]" style={{ top: `${position.top}px`, right: `${position.right}px` }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-2 border-b bg-gray-50"><div className="text-sm font-semibold text-gray-700">فیلتر بازرس</div><button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes className="text-sm" /></button></div>
        <div className="flex justify-between items-center p-2 border-b"><button onClick={onSelectAll} className="text-xs text-blue-600 hover:text-blue-800 font-medium">{areAllSelected ? "لغو همه" : "انتخاب همه"}</button><span className="text-xs text-gray-500">{activeCount} از {uniqueInspectors.length}</span></div>
        <div className="max-h-[250px] overflow-y-auto p-1">{uniqueInspectors.length > 0 ? uniqueInspectors.map((inspector) => (<label key={inspector} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer"><input type="checkbox" checked={selectedInspectors[inspector] || false} onChange={() => onInspectorChange(inspector)} className="h-3 w-3 text-blue-600 rounded focus:ring-blue-500" /><div className="flex-1 flex items-center gap-1"><FaUserTie className="text-gray-400 text-xs" /><span className="text-sm text-gray-800 font-sm">{inspector === "-" ? "بدون بازرس" : inspector}</span></div></label>)) : <div className="text-center py-4 text-gray-500">داده‌ای برای فیلتر موجود نیست</div>}</div>
        <div className="flex gap-1 p-0.5 border-t bg-gray-50"><button onClick={onClose} className="flex-1 p-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-medium">اعمال فیلتر</button><button onClick={onClearAll} className="flex-1 p-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded-md font-medium" disabled={activeCount === 0}>حذف همه</button></div>
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
    if (!item.RFI_Numbering || item.RFI_Numbering === "************") return;
    setSelectedNotificationToDelete({ rfiNumbering: item.RFI_Numbering, rfiNumber: item.RFI_Number, vendorName: item.VendorName });
    setShowDeleteNotification(true);
  };

  const confirmDeleteNotification = () => {
    if (!selectedNotificationToDelete) return;
    deleteNotification(selectedNotificationToDelete.rfiNumbering, { onSuccess: () => { setSelectedNotificationToDelete(null); setShowDeleteNotification(false); } });
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [showColumnFilters, setShowColumnFilters] = useState({ RFI_Number: false, Report_No: false, RFI_Numbering: false });
  const [columnFilters, setColumnFilters] = useState({ RFI_Number: "", Report_No: "", RFI_Numbering: "" });
  const [showProjectTypeFilter, setShowProjectTypeFilter] = useState(false);
  const [projectTypeFilters, setProjectTypeFilters] = useState({ خارجی: false, "داخلی کالا": false, "داخلی کشتی": false, Foreign: false, "Domestic Goods": false, "Domestic Ship": false });
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [statusFilters, setStatusFilters] = useState({ Done: false, Ongoing: false, Cancel: false, Cancelled: false, "در حال انجام": false, "انجام شده": false, "لغو شده": false });
  const statusFilterButtonRef = useRef(null);
  const projectTypeFilterButtonRef = useRef(null);
  const [showInspectorFilter, setShowInspectorFilter] = useState(false);
  const [inspectorFilters, setInspectorFilters] = useState({});
  const inspectorFilterButtonRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: lastIRNData, isLoading: irnLoading } = useLastIRN(projectName, projectType);
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects(false);
  const { data: projectTypes, isLoading: projectTypesLoading, error: projectTypesError } = useProjectTypes();
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const { data: rfiData, isLoading: rfiLoading, error: rfiError } = useRFIReport(projectName, selectedProjectType, shouldFetch);

  const projectOptions = useMemo(() => projects?.map(p => ({ value: p.id, label: p.name, ...p })) || [], [projects]);

  const handleProjectChange = (projectId) => {
    setSelectedProject(projectId);
    setShouldFetch(false);
    setIsAutoFetch(false);
    setSearchTerm("");
    setColumnFilters({ RFI_Number: "", Report_No: "", RFI_Numbering: "" });
    clearAllProjectTypes();
    clearAllStatuses();
    clearAllInspectors();
    setCurrentPage(1);
    const selectedProjectObj = projects?.find(p => p.id === projectId);
    setProjectName(selectedProjectObj ? selectedProjectObj.name : "");
  };

  const handleSearch = () => {
    if (projectName && selectedProjectType) {
      setShouldFetch(true);
      setIsAutoFetch(false);
      setSearchTerm("");
      setColumnFilters({ RFI_Number: "", Report_No: "", RFI_Numbering: "" });
      clearAllProjectTypes();
      clearAllStatuses();
      clearAllInspectors();
      setCurrentPage(1);
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("project", encodeURIComponent(projectName));
      if (selectedProjectType) searchParams.set("type", selectedProjectType);
      window.history.replaceState({}, "", `${location.pathname}?${searchParams.toString()}`);
    }
  };

  const handleAddReport = (rfiItem) => { setSelectedRFI(rfiItem); setShowAddReportModal(true); };

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
      if (typeFromQuery) setSelectedProjectType(typeFromQuery);
      const foundProject = projects?.find(p => p.name === decodedProjectName);
      if (foundProject) setSelectedProject(foundProject.id);
    } else { setIsAutoFetch(false); setShouldFetch(false); }
  }, [location.search, projects]);

  useEffect(() => {
    if (rfiData && Object.keys(rfiData).length > 0) {
      const firstItem = Object.values(rfiData)[0];
      if (firstItem.Over_Domestic) setProjectType(firstItem.Over_Domestic);
    }
  }, [rfiData]);

  const stats = useMemo(() => {
    if (!rfiData || !shouldFetch) return { total: 0, done: 0, Ongoing: 0 };
    const dataArray = Object.values(rfiData);
    const total = dataArray.length;
    const done = dataArray.filter(item => item.RFI_Status === "Done" || item.RFI_Status === "انجام شده").length;
    const Ongoing = dataArray.filter(item => item.RFI_Status === "Ongoing" || item.RFI_Status === "در حال انجام").length;
    return { total, done, Ongoing };
  }, [rfiData, shouldFetch]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const handleSort = (key) => { let direction = "asc"; if (sortConfig.key === key) direction = sortConfig.direction === "asc" ? "desc" : "asc"; setSortConfig({ key, direction }); };

  const extractNumberFromString = (str) => {
    if (!str || str === "************") return 0;
    try { const cleanStr = str.replace(/[^\d]/g, ""); if (cleanStr) { const num = parseInt(cleanStr, 10); return isNaN(num) ? 0 : num; } return 0; } catch (error) { return 0; }
  };

  const tableData = useMemo(() => {
    if (!rfiData || !shouldFetch) return [];
    return Object.values(rfiData).map((item) => ({ ...item, formattedInspectionDate: new Date(item.InspectionDate).toLocaleDateString("fa-IR"), rfiNumberNum: parseInt(item.RFI_Number) || 0, inspectorName: item.Inspector_Name || "-" })).sort((a, b) => { const numA = a.rfiNumberNum, numB = b.rfiNumberNum; if (!isNaN(numA) && !isNaN(numB)) return numB - numA; if (!isNaN(numA)) return -1; if (!isNaN(numB)) return 1; return b.RFI_Number.localeCompare(a.RFI_Number); });
  }, [rfiData, shouldFetch]);

  const uniqueProjectTypes = useMemo(() => { const types = new Set(); tableData.forEach(item => { if (item.Over_Domestic && item.Over_Domestic.trim()) types.add(item.Over_Domestic.trim()); }); return Array.from(types).sort(); }, [tableData]);
  const uniqueStatuses = useMemo(() => { const statuses = new Set(); tableData.forEach(item => { if (item.RFI_Status && item.RFI_Status.trim()) { let s = item.RFI_Status.trim(); if (s === "در حال انجام") s = "Ongoing"; if (s === "انجام شده") s = "Done"; if (s === "لغو شده") s = "Cancel"; statuses.add(s); } }); return Array.from(statuses).sort((a, b) => { const order = { 'Done': 1, 'Ongoing': 2, 'Cancel': 3, 'Cancelled': 4 }; return (order[a] || 99) - (order[b] || 99); }); }, [tableData]);
  const uniqueInspectors = useMemo(() => { const inspectors = new Set(); tableData.forEach(item => { const inspector = item.Inspector_Name || "-"; inspectors.add(inspector); }); return Array.from(inspectors).sort((a, b) => { if (a === "-") return 1; if (b === "-") return -1; return a.localeCompare(b, 'fa'); }); }, [tableData]);

  const handleInspectorFilterChange = (inspector) => setInspectorFilters(prev => ({ ...prev, [inspector]: !prev[inspector] }));
  const selectAllInspectors = () => { const allSelected = {}; uniqueInspectors.forEach(inspector => { allSelected[inspector] = true; }); setInspectorFilters(allSelected); };
  const clearAllInspectors = () => setInspectorFilters({});
  const areAllInspectorsSelected = useMemo(() => uniqueInspectors.length > 0 && uniqueInspectors.every(inspector => inspectorFilters[inspector]), [uniqueInspectors, inspectorFilters]);
  const activeInspectorCount = useMemo(() => uniqueInspectors.filter(inspector => inspectorFilters[inspector]).length, [uniqueInspectors, inspectorFilters]);

  const handleProjectTypeFilterChange = (type) => setProjectTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));
  const selectAllProjectTypes = () => { const allSelected = {}; uniqueProjectTypes.forEach(type => { allSelected[type] = true; }); setProjectTypeFilters(prev => ({ ...prev, ...allSelected })); };
  const clearAllProjectTypes = () => { const allCleared = {}; Object.keys(projectTypeFilters).forEach(type => { allCleared[type] = false; }); setProjectTypeFilters(allCleared); };
  const areAllProjectTypesSelected = useMemo(() => uniqueProjectTypes.length > 0 && uniqueProjectTypes.every(type => projectTypeFilters[type]), [uniqueProjectTypes, projectTypeFilters]);
  const activeProjectTypeCount = useMemo(() => uniqueProjectTypes.filter(type => projectTypeFilters[type]).length, [uniqueProjectTypes, projectTypeFilters]);

  const handleStatusFilterChange = (status) => setStatusFilters(prev => ({ ...prev, [status]: !prev[status] }));
  const selectAllStatuses = () => { const allSelected = {}; uniqueStatuses.forEach(status => { allSelected[status] = true; }); setStatusFilters(prev => ({ ...prev, ...allSelected })); };
  const clearAllStatuses = () => { const allCleared = {}; Object.keys(statusFilters).forEach(status => { allCleared[status] = false; }); setStatusFilters(allCleared); };
  const areAllStatusesSelected = useMemo(() => uniqueStatuses.length > 0 && uniqueStatuses.every(status => statusFilters[status]), [uniqueStatuses, statusFilters]);
  const activeStatusCount = useMemo(() => uniqueStatuses.filter(status => statusFilters[status]).length, [uniqueStatuses, statusFilters]);

  const normalizeText = (text) => text ? text.toString().replace(/[\u200C\u200B\s-]/g, "").toLowerCase() : "";
  const checkMatch = (value, searchTerm) => { if (!searchTerm || searchTerm.trim() === "") return true; const normalizedValue = normalizeText(value); const normalizedSearch = normalizeText(searchTerm); if (normalizedValue.includes(normalizedSearch)) return true; const numbersInValue = normalizedValue.match(/\d+/g) || []; return numbersInValue.some(num => num.includes(normalizedSearch)); };

  const filteredAndSortedData = useMemo(() => {
    if (!tableData.length) return [];
    let filteredData = [...tableData];
    if (searchTerm.trim()) filteredData = filteredData.filter(item => checkMatch(item.RFI_Number, searchTerm) || checkMatch(item.Report_No, searchTerm) || checkMatch(item.RFI_Numbering, searchTerm) || checkMatch(item.ProjectTitle, searchTerm) || checkMatch(item.Inspector_Name, searchTerm));
    Object.keys(columnFilters).forEach(key => { const filterValue = columnFilters[key]; if (filterValue.trim()) filteredData = filteredData.filter(item => checkMatch(item[key], filterValue)); });
    const activeProjectTypeFilters = Object.keys(projectTypeFilters).filter(type => projectTypeFilters[type]);
    if (activeProjectTypeFilters.length > 0) filteredData = filteredData.filter(item => item.Over_Domestic && activeProjectTypeFilters.includes(item.Over_Domestic.trim()));
    const activeStatusFilters = Object.keys(statusFilters).filter(status => statusFilters[status]);
    if (activeStatusFilters.length > 0) filteredData = filteredData.filter(item => item.RFI_Status && activeStatusFilters.includes(item.RFI_Status.trim()));
    const activeInspectorFilters = Object.keys(inspectorFilters).filter(inspector => inspectorFilters[inspector]);
    if (activeInspectorFilters.length > 0) filteredData = filteredData.filter(item => { const inspector = item.Inspector_Name || "-"; return activeInspectorFilters.includes(inspector); });
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aValue, bValue;
      switch (sortConfig.key) {
        case "RFI_Number": aValue = parseInt(a.RFI_Number) || 0; bValue = parseInt(b.RFI_Number) || 0; break;
        case "RFI_Status": const getPriority = (s) => { if (!s) return 99; const str = String(s).toLowerCase().trim(); if (str === "done" || str === "انجام شده") return 1; if (str === "ongoing" || str === "در حال انجام") return 2; if (str === "cancel" || str === "cancelled" || str === "لغو شده") return 3; return 99; }; aValue = getPriority(a.RFI_Status); bValue = getPriority(b.RFI_Status); break;
        case "InspectionDate": aValue = new Date(a.InspectionDate).getTime(); bValue = new Date(b.InspectionDate).getTime(); break;
        case "Inspector_Name": aValue = a.Inspector_Name || ""; bValue = b.Inspector_Name || ""; break;
        case "IRNNO": aValue = parseInt(a.IRNNO) || 0; bValue = parseInt(b.IRNNO) || 0; break;
        case "Duration": aValue = parseInt(a.Duration) || 0; bValue = parseInt(b.Duration) || 0; break;
        case "Report_No": aValue = extractNumberFromString(a.Report_No); bValue = extractNumberFromString(b.Report_No); if (aValue === 0 && bValue === 0) { aValue = a.Report_No || ""; bValue = b.Report_No || ""; } break;
        case "RFI_Numbering": aValue = extractNumberFromString(a.RFI_Numbering); bValue = extractNumberFromString(b.RFI_Numbering); if (aValue === 0 && bValue === 0) { aValue = a.RFI_Numbering || ""; bValue = b.RFI_Numbering || ""; } break;
        case "ProjectTitle": aValue = a.ProjectTitle || ""; bValue = b.ProjectTitle || ""; break;
        case "Over_Domestic": const order = { "داخلی کالا": 1, "داخلی کشتی": 2, خارجی: 3, "Domestic Goods": 1, "Domestic Ship": 2, Foreign: 3 }; const typeA = a.Over_Domestic || ""; const typeB = b.Over_Domestic || ""; aValue = order[typeA] || order[typeA.toLowerCase()] || 99; bValue = order[typeB] || order[typeB.toLowerCase()] || 99; break;
        default: aValue = a[sortConfig.key] || ""; bValue = b[sortConfig.key] || "";
      }
      let comparison = (typeof aValue === "number" && typeof bValue === "number") ? aValue - bValue : String(aValue).localeCompare(String(bValue), "fa-IR");
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [tableData, searchTerm, columnFilters, projectTypeFilters, statusFilters, inspectorFilters, sortConfig]);

  const paginatedData = useMemo(() => { const start = (currentPage - 1) * itemsPerPage; return filteredAndSortedData.slice(start, start + itemsPerPage); }, [filteredAndSortedData, currentPage, itemsPerPage]);
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handlePageChange = (page) => { if (page >= 1 && page <= totalPages) { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const handleItemsPerPageChange = (e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); };

  useEffect(() => { if (searchTerm.trim()) setCurrentPage(1); }, [searchTerm]);
  useEffect(() => { if (Object.values(columnFilters).some(f => f.trim())) setCurrentPage(1); }, [columnFilters]);
  useEffect(() => { if (activeProjectTypeCount > 0) setCurrentPage(1); }, [activeProjectTypeCount]);
  useEffect(() => { if (activeStatusCount > 0) setCurrentPage(1); }, [activeStatusCount]);
  useEffect(() => { if (activeInspectorCount > 0) setCurrentPage(1); }, [activeInspectorCount]);

  const handleOpenNotificationModal = (item) => { if (item.RFI_Numbering && item.RFI_Numbering !== "************") { setSelectedRFINumbering(item.RFI_Numbering); setShowNotificationModal(true); } };
  const handleOpenReportModal = (item) => { setSelectedReportRFI(item); setShowReportModal(true); };
  const handleColumnFilterChange = (key, val) => setColumnFilters(prev => ({ ...prev, [key]: val }));
  const toggleColumnFilter = (key) => setShowColumnFilters(prev => ({ ...prev, [key]: !prev[key] }));
  const clearColumnFilter = (key) => setColumnFilters(prev => ({ ...prev, [key]: "" }));
  const clearAllFilters = () => { setSearchTerm(""); setColumnFilters({ RFI_Number: "", Report_No: "", RFI_Numbering: "" }); clearAllProjectTypes(); clearAllStatuses(); clearAllInspectors(); };
  const activeFiltersCount = useMemo(() => { let c = 0; if (searchTerm.trim()) c++; if (columnFilters.RFI_Number.trim()) c++; if (columnFilters.Report_No.trim()) c++; if (columnFilters.RFI_Numbering.trim()) c++; if (activeProjectTypeCount > 0) c++; if (activeStatusCount > 0) c++; if (activeInspectorCount > 0) c++; return c; }, [searchTerm, columnFilters, activeProjectTypeCount, activeStatusCount, activeInspectorCount]);

  const showEmptyState = shouldFetch && !rfiLoading && !rfiError && tableData.length === 0;
  const showInitialState = !shouldFetch && !rfiLoading && !isAutoFetch;
  const showAutoFetchLoading = isAutoFetch && rfiLoading;
  const showManualLoading = !isAutoFetch && rfiLoading;
  const showResults = shouldFetch && tableData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <StepHeader title="گزارش پروژه‌ها" description="مشاهده گزارش‌ها بر اساس پروژه انتخابی" icon={FaTable} />
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-3 lg:p-4">
          {isAutoFetch && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setIsAutoFetch(false); setShouldFetch(false); setProjectName(""); setSelectedProject(""); setSearchTerm(""); setColumnFilters({ RFI_Number: "", Report_No: "", RFI_Numbering: "" }); clearAllProjectTypes(); clearAllStatuses(); clearAllInspectors(); setCurrentPage(1); }} className="hover:bg-blue-700 p-1.5 rounded-full"><FaArrowLeft className="text-xl rotate-180" /></button>
                  <div><h3 className="text-lg font-semibold mb-1">پروژه: {projectName}</h3></div>
                </div>
                {rfiLoading && <FaSync className="animate-spin text-white text-xl" />}
              </div>
            </div>
          )}

          {!isAutoFetch && (
            <div className="mb-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
                <div className="lg:col-span-4"><div className="flex flex-col"><label className="block text-xs font-semibold text-gray-700 mb-1">انتخاب پروژه *</label><SearchableSelect value={selectedProject} onChange={handleProjectChange} options={projectOptions} placeholder={projectsLoading ? "در حال دریافت..." : projectsError ? "خطا در دریافت" : "جستجو و انتخاب پروژه..."} disabled={projectsLoading || !!projectsError} /></div></div>
                <div className="lg:col-span-4"><div className="flex flex-col"><label className="block text-xs font-semibold text-gray-700 mb-1">نوع پروژه *</label><select value={selectedProjectType} onChange={(e) => setSelectedProjectType(e.target.value)} className="w-full  py-1.5 px-2 border border-gray-300 rounded-lg text-sm bg-white" disabled={projectTypesLoading} required><option value="" disabled>{projectTypesLoading ? "در حال دریافت..." : "انتخاب نوع پروژه"}</option>{projectTypes?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select></div></div>
                <div className="lg:col-span-4"><Button onClick={handleSearch} variant="primary" icon="search" disabled={!projectName || !selectedProjectType || rfiLoading} className="w-full py-2 h-[40px]">{rfiLoading ? <span><FaSync className="animate-spin ml-2" /> در حال جستجو...</span> : "جستجو"}</Button></div>
              </div>
            </div>
          )}

          {showResults && (
            <div className="mb-4 relative">
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FaSearch className="text-sm" /></div>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="جستجوی سریع..." className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-lg text-sm" />
              {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"><FaTimes className="text-sm" /></button>}
            </div>
          )}

          {showResults && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-2 text-white shadow"><div className="flex items-center gap-2"><FaCalendarCheck /><span className="text-xs">آخرین IRN:</span><span className="font-bold">{irnLoading ? <FaSync className="animate-spin" /> : (lastIRNData?.irnno || 0)}</span>{lastIRNData?.rfi_numer && <span className="text-xs">(RFI:{lastIRNData.rfi_numer})</span>}</div></div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-2 text-white shadow"><div className="flex items-center gap-2"><FaListAlt /><span className="text-xs">کل گزارش‌ها</span><span className="font-bold">{stats.total}</span></div></div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-2 text-white shadow"><div className="flex items-center gap-2"><FaCheckCircle /><span className="text-xs">انجام شده</span><span className="font-bold">{stats.done}</span>{stats.total > 0 && <span className="text-green-200 text-[10px]">({Math.round((stats.done / stats.total) * 100)}%)</span>}</div></div>
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-2 text-white shadow"><div className="flex items-center gap-2"><FaClock /><span className="text-xs">در حال انجام</span><span className="font-bold">{stats.Ongoing}</span>{stats.total > 0 && <span className="text-amber-200 text-[10px]">({Math.round((stats.Ongoing / stats.total) * 100)}%)</span>}</div></div>
            </div>
          )}

          {rfiError && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">خطا در دریافت داده‌ها: {rfiError.message}</div>}

          {showResults && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 mb-4">
              <table className="w-full text-sm" style={{ minWidth: "1300px" }}>
                <thead><tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                  <FilterableSortHeader title="شماره‌پروژه" sortKey="RFI_Number" sortConfig={sortConfig} onSort={handleSort} filterValue={columnFilters.RFI_Number} onFilterChange={(v) => handleColumnFilterChange("RFI_Number", v)} showFilter={showColumnFilters.RFI_Number} onToggleFilter={() => toggleColumnFilter("RFI_Number")} onClearFilter={() => clearColumnFilter("RFI_Number")} placeholder="فیلتر عددی" />
                  <th className="p-3 font-semibold text-white text-xs min-w-20 relative"><div className="flex flex-col items-center"><div className="flex items-center gap-1 mb-1"><span>وضعیت</span><div className="flex gap-0.5"><button ref={statusFilterButtonRef} onClick={() => setShowStatusFilter(!showStatusFilter)} className={`p-1 rounded ${activeStatusCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"}`}><FaFilter className={`text-xs ${activeStatusCount > 0 ? "text-yellow-300" : "text-white"}`} /></button><button onClick={() => handleSort("RFI_Status")} className={`p-1 rounded ${sortConfig.key === "RFI_Status" ? "bg-blue-700" : "hover:bg-blue-700"}`}><SortIcon columnKey="RFI_Status" sortConfig={sortConfig} /></button></div></div>{activeStatusCount > 0 && !showStatusFilter && <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">{activeStatusCount} انتخاب<button onClick={clearAllStatuses} className="mr-1"><FaTimes className="text-[8px]" /></button></div>}</div></th>
                  <SortHeader title="تاریخ بازرسی" sortKey="InspectionDate" sortConfig={sortConfig} onSort={handleSort} />
                  <th className="p-3 font-semibold text-white text-xs min-w-20 relative"><div className="flex flex-col items-center"><div className="flex items-center gap-1 mb-1"><span>بازرس</span><div className="flex gap-0.5"><button ref={inspectorFilterButtonRef} onClick={() => setShowInspectorFilter(!showInspectorFilter)} className={`p-1 rounded ${activeInspectorCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"}`}><FaFilter className={`text-xs ${activeInspectorCount > 0 ? "text-yellow-300" : "text-white"}`} /></button><button onClick={() => handleSort("Inspector_Name")} className={`p-1 rounded ${sortConfig.key === "Inspector_Name" ? "bg-blue-700" : "hover:bg-blue-700"}`}><SortIcon columnKey="Inspector_Name" sortConfig={sortConfig} /></button></div></div>{activeInspectorCount > 0 && !showInspectorFilter && <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">{activeInspectorCount} انتخاب<button onClick={clearAllInspectors} className="mr-1"><FaTimes className="text-[8px]" /></button></div>}</div></th>
                  <SortHeader title="IRN" sortKey="IRNNO" sortConfig={sortConfig} onSort={handleSort} />
                  <SortHeader title="مدت" sortKey="Duration" sortConfig={sortConfig} onSort={handleSort} />
                  <FilterableSortHeader title="شماره گزارش" sortKey="Report_No" sortConfig={sortConfig} onSort={handleSort} filterValue={columnFilters.Report_No} onFilterChange={(v) => handleColumnFilterChange("Report_No", v)} showFilter={showColumnFilters.Report_No} onToggleFilter={() => toggleColumnFilter("Report_No")} onClearFilter={() => clearColumnFilter("Report_No")} placeholder="مثال: FAH-INS-PCH-0480" />
                  <FilterableSortHeader title="شماره نوتیفیکشن" sortKey="RFI_Numbering" sortConfig={sortConfig} onSort={handleSort} filterValue={columnFilters.RFI_Numbering} onFilterChange={(v) => handleColumnFilterChange("RFI_Numbering", v)} showFilter={showColumnFilters.RFI_Numbering} onToggleFilter={() => toggleColumnFilter("RFI_Numbering")} onClearFilter={() => clearColumnFilter("RFI_Numbering")} placeholder="مثال: FAH-INS-PCH-0480" />
                  <th className="p-3 font-semibold text-white text-xs min-w-20 relative"><div className="flex flex-col items-center"><div className="flex items-center gap-1 mb-1"><span>نوع پروژه</span><div className="flex gap-0.5"><button ref={projectTypeFilterButtonRef} onClick={() => setShowProjectTypeFilter(!showProjectTypeFilter)} className={`p-1 rounded ${activeProjectTypeCount > 0 ? "bg-blue-700" : "hover:bg-blue-700"}`}><FaFilter className={`text-xs ${activeProjectTypeCount > 0 ? "text-yellow-300" : "text-white"}`} /></button><button onClick={() => handleSort("Over_Domestic")} className={`p-1 rounded ${sortConfig.key === "Over_Domestic" ? "bg-blue-700" : "hover:bg-blue-700"}`}><SortIcon columnKey="Over_Domestic" sortConfig={sortConfig} /></button></div></div>{activeProjectTypeCount > 0 && !showProjectTypeFilter && <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">{activeProjectTypeCount} انتخاب<button onClick={clearAllProjectTypes} className="mr-1"><FaTimes className="text-[8px]" /></button></div>}</div></th>
                  <th className="p-3 font-semibold text-white text-xs text-center min-w-[70px]">عملیات</th>
                </tr></thead>
                <tbody>{paginatedData.map((item, idx) => (
                  <tr key={idx} className="border-b hover:bg-blue-50">
                    <td className="p-3 text-center"><div className="flex items-center justify-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span>{item.RFI_Number}</span></div></td>
                    <td className="p-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.RFI_Status)}`}>{getPersianStatus(item.RFI_Status)}</span></td>
                    <td className="p-3 text-center">{item.formattedInspectionDate}</td>
                    <td className="p-3 text-center"><div className="flex items-center justify-center gap-1"><FaUserTie className="text-gray-400" /><span>{item.Inspector_Name}</span></div></td>
                    <td className="p-3 text-center">{item.IRNNO ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{item.IRNNO}</span> : "-"}</td>
                    <td className="p-3 text-center">{item.Duration ? `${item.Duration} روز` : "-"}</td>
                    <td className="p-3 text-center">{item.Report_No === "************" || !item.Report_No ? <button onClick={() => handleOpenReportModal(item)} className="text-gray-600 hover:text-blue-800">************</button> : <button onClick={() => handleOpenReportModal(item)} className="text-blue-600 hover:text-blue-800">{item.Report_No}</button>}</td>
                    <td className="p-3 text-center"><button onClick={() => handleOpenNotificationModal(item)} className={`text-blue-600 hover:text-blue-800 ${(!item.RFI_Numbering || item.RFI_Numbering === "************") ? "opacity-50 cursor-not-allowed" : ""}`}>{item.NotificationNo && item.NotificationNo !== "************" ? `\u200E${item.NotificationNo}` : item.NotificationNo}</button></td>
                    <td className="p-3 text-center"><span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">{getPersianProjectType(item.Over_Domestic)}</span></td>
                    <td className="p-3 text-center"><button onClick={() => handleDeleteNotification(item)} disabled={!item.RFI_Numbering || item.RFI_Numbering === "************" || isDeletingNotification} className="text-red-600 hover:text-red-800 p-1 rounded"><FaTrash /></button></td>
                  </tr>
                ))}</tbody>
              </table>
              {activeFiltersCount > 0 && (
                <div className="bg-blue-50 p-2 text-xs flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap"><span className="text-blue-700 font-semibold">نتایج فیلتر شده:</span><span>{filteredAndSortedData.length} از {tableData.length} مورد</span>{searchTerm && <span className="bg-blue-100 px-1.5 py-0.5 rounded">جستجو: {searchTerm}</span>}{activeProjectTypeCount > 0 && <span className="bg-yellow-100 px-1.5 py-0.5 rounded">نوع پروژه: {activeProjectTypeCount} مورد</span>}{activeStatusCount > 0 && <span className="bg-green-100 px-1.5 py-0.5 rounded">وضعیت: {activeStatusCount} مورد</span>}{activeInspectorCount > 0 && <span className="bg-purple-100 px-1.5 py-0.5 rounded">بازرس: {activeInspectorCount} مورد</span>}</div>
                  <button onClick={clearAllFilters} className="text-red-600 text-xs flex items-center gap-1"><FaTimes /> حذف همه</button>
                </div>
              )}
            </div>
          )}

          {showResults && totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={filteredAndSortedData.length} onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange} />}

          {showResults && (
            <div className="md:hidden space-y-3">
              {paginatedData.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg border p-3">
                  <div className="flex justify-between border-b pb-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="font-semibold">RFI: {item.RFI_Number}</span></div><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(item.RFI_Status)}`}>{getPersianStatus(item.RFI_Status)}</span></div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div><span className="text-gray-600">تاریخ بازرسی:</span><p>{item.formattedInspectionDate}</p></div>
                    <div><span className="text-gray-600">بازرس:</span><p>{item.Inspector_Name}</p></div>
                    <div><span className="text-gray-600">IRN:</span><p>{item.IRNNO || "-"}</p></div>
                    <div><span className="text-gray-600">مدت:</span><p>{item.Duration ? `${item.Duration} روز` : "-"}</p></div>
                    <div><span className="text-gray-600">شماره گزارش:</span><p>{item.Report_No === "************" ? <button onClick={() => handleOpenReportModal(item)} className="text-gray-600">************</button> : <button onClick={() => handleOpenReportModal(item)} className="text-blue-600">{item.Report_No}</button>}</p></div>
                    <div><span className="text-gray-600">RFI Numbering:</span><p>{item.RFI_Numbering}</p></div>
                    <div><span className="text-gray-600">نام پروژه:</span><p>{item.ProjectTitle}</p></div>
                    <div><span className="text-gray-600">نوع پروژه:</span><p>{getPersianProjectType(item.Over_Domestic)}</p></div>
                    <div><button onClick={() => handleDeleteNotification(item)} disabled={!item.RFI_Numbering || item.RFI_Numbering === "************"} className="text-red-600 text-xs">حذف</button></div>
                  </div>
                </div>
              ))}
              {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={filteredAndSortedData.length} onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange} />}
            </div>
          )}

          {showResults && <div className="mt-3 text-xs text-gray-600 bg-blue-50 p-2 rounded"><span className="font-semibold">تعداد گزارش: {filteredAndSortedData.length} مورد</span><span className="mr-2">برای پروژه: {projectName}</span>{activeFiltersCount > 0 && <span className="mr-2">{activeFiltersCount} فیلتر فعال</span>}{isAutoFetch && <span className="mr-2">بارگذاری خودکار</span>}</div>}
          {showEmptyState && <div className="text-center py-8 text-gray-500"><FaFileAlt className="text-3xl mx-auto mb-2 text-gray-400" /><p>گزارش یافت نشد</p><p className="text-xs">برای پروژه {projectName} هیچ گزارشی موجود نیست.</p></div>}
          {showInitialState && <div className="text-center py-8 text-gray-500"><FaSearch className="text-3xl mx-auto mb-2 text-indigo-400" /><p>انتخاب پروژه</p><p className="text-xs">لطفاً یک پروژه انتخاب کنید و دکمه جستجو را بزنید.</p></div>}
          {showAutoFetchLoading && <div className="text-center py-8 text-gray-500"><FaSync className="text-3xl mx-auto mb-2 text-blue-400 animate-spin" /><p className="text-xs">گزارش برای پروژه {projectName} در حال بارگذاری است.</p></div>}
          {showManualLoading && <div className="text-center py-8 text-gray-500"><FaSync className="text-3xl mx-auto mb-2 text-indigo-400 animate-spin" /><p>در حال جستجو...</p><p className="text-xs">در حال دریافت گزارش‌های برای پروژه {projectName}</p></div>}
        </div>
      </div>

      <AddReportModal isOpen={showReportModal} onClose={() => { setShowReportModal(false); setSelectedReportRFI(null); }} rfiData={selectedReportRFI} nextIRN={lastIRNData?.next_irnno?.toString() || ""} />
      <NotificationInfoModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} notificationData={selectedNotification} rfiNumber={selectedRFINumbering} />
      <DeleteNotificationPopover isOpen={showDeleteNotification} onClose={() => { setShowDeleteNotification(false); setSelectedNotificationToDelete(null); }} onConfirm={confirmDeleteNotification} rfiNumbering={selectedNotificationToDelete?.rfiNumbering || ''} title="حذف سطر" message={`آیا از حذف ${selectedNotificationToDelete?.rfiNumbering} اطمینان دارید؟`} confirmText={isDeletingNotification ? "در حال حذف..." : "بله"} cancelText="انصراف" isLoading={isDeletingNotification} />
      <ProjectTypeFilterDropdown isOpen={showProjectTypeFilter} onClose={() => setShowProjectTypeFilter(false)} uniqueTypes={uniqueProjectTypes} selectedTypes={projectTypeFilters} onTypeChange={handleProjectTypeFilterChange} onSelectAll={areAllProjectTypesSelected ? clearAllProjectTypes : selectAllProjectTypes} onClearAll={clearAllProjectTypes} areAllSelected={areAllProjectTypesSelected} activeCount={activeProjectTypeCount} buttonRef={projectTypeFilterButtonRef} />
      <StatusFilterDropdown isOpen={showStatusFilter} onClose={() => setShowStatusFilter(false)} uniqueStatuses={uniqueStatuses} selectedStatuses={statusFilters} onStatusChange={handleStatusFilterChange} onSelectAll={areAllStatusesSelected ? clearAllStatuses : selectAllStatuses} onClearAll={clearAllStatuses} areAllSelected={areAllStatusesSelected} activeCount={activeStatusCount} buttonRef={statusFilterButtonRef} />
      <InspectorFilterDropdown isOpen={showInspectorFilter} onClose={() => setShowInspectorFilter(false)} uniqueInspectors={uniqueInspectors} selectedInspectors={inspectorFilters} onInspectorChange={handleInspectorFilterChange} onSelectAll={areAllInspectorsSelected ? clearAllInspectors : selectAllInspectors} onClearAll={clearAllInspectors} areAllSelected={areAllInspectorsSelected} activeCount={activeInspectorCount} buttonRef={inspectorFilterButtonRef} />
    </div>
  );
};

export default RFIReportTable;

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey) return <div className="flex flex-col items-center"><FaSortUp className="text-gray-300 text-xs -mb-1" /><FaSortDown className="text-gray-300 text-xs -mt-1" /></div>;
  return sortConfig.direction === "asc" ? <FaSortUp className="text-yellow-300 text-xs" /> : <FaSortDown className="text-yellow-300 text-xs" />;
};

const FilterableSortHeader = ({ title, sortKey, sortConfig, onSort, filterValue, onFilterChange, showFilter, onToggleFilter, onClearFilter, placeholder }) => {
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const headerRef = useRef(null);
  const hasFilter = filterValue && filterValue.trim() !== "";

  useEffect(() => {
    if (showFilter && headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setPopoverPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX + rect.width / 2 - 100, width: 200 });
    }
  }, [showFilter]);

  return (
    <th ref={headerRef} className="p-3 font-semibold text-white text-xs min-w-20 relative">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <span>{title}</span>
          <div className="flex items-center gap-0.5">
            <button onClick={onToggleFilter} className={`p-1 rounded ${hasFilter ? "bg-blue-700" : "hover:bg-blue-700"}`}><FaFilter className={`text-xs ${hasFilter ? "text-yellow-300" : "text-white"}`} /></button>
            <button onClick={() => onSort(sortKey)} className={`p-1 rounded ${sortConfig.key === sortKey ? "bg-blue-700" : "hover:bg-blue-700"}`}><SortIcon columnKey={sortKey} sortConfig={sortConfig} /></button>
          </div>
        </div>
        {hasFilter && !showFilter && <div className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">{filterValue.length > 8 ? `${filterValue.substring(0, 8)}...` : filterValue}<button onClick={onClearFilter} className="mr-1"><FaTimes className="text-[8px]" /></button></div>}
      </div>
      {showFilter && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggleFilter} />
          <div className="fixed z-50 bg-white rounded-lg shadow-lg border p-2" style={{ top: popoverPosition.top, left: popoverPosition.left, width: 200 }} onClick={(e) => e.stopPropagation()}>
            <div className="text-center text-xs font-semibold mb-1">فیلتر {title}</div>
            <input type="text" value={filterValue} onChange={(e) => onFilterChange(e.target.value)} placeholder={placeholder} className="w-full px-2 py-1 text-xs border rounded text-center" autoFocus />
            <div className="flex gap-1 mt-2"><button onClick={onToggleFilter} className="flex-1 text-xs py-1 bg-gray-100 rounded">بستن</button>{hasFilter && <button onClick={onClearFilter} className="flex-1 text-xs py-1 bg-red-100 rounded">حذف</button>}</div>
          </div>
        </>
      )}
    </th>
  );
};

const SortHeader = ({ title, sortKey, sortConfig, onSort }) => (
  <th className="p-3 font-semibold text-white text-xs min-w-20"><div className="flex items-center justify-center gap-1"><span>{title}</span><button onClick={() => onSort(sortKey)} className="p-1 rounded hover:bg-blue-700"><SortIcon columnKey={sortKey} sortConfig={sortConfig} /></button></div></th>
);