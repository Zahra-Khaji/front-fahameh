import React, { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { 
  FaTrash, FaSort, FaSortUp, FaSortDown, 
  FaFilter, FaTimes, FaSearch, FaSave, FaEdit 
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// تعریف ستون‌های ثابت - کلیدها لاتین (از API)، عنوان‌ها فارسی (برای نمایش)
const FIXED_COLUMNS = [
  { key: "title", title: "نام پروژه", type: "string", sortable: true, filterable: true },
  { key: "inspector_name", title: "نام بازرس", type: "string", sortable: true, filterable: true },
  { key: "personnel_code", title: "کد پرسنلی", type: "string", sortable: true, filterable: true },
  { key: "rfi_date", title: "تاریخ شروع بازرسی", type: "date", sortable: true, filterable: false },
  { key: "date_shamsi", title: "تاریخ شمسی", type: "string", sortable: true, filterable: false },
  { key: "approve_manday", title: "تعداد روز مورد تایید", type: "number", sortable: true, filterable: false },
  { key: "inspector_price", title: "قیمت بازرسی", type: "number", sortable: true, filterable: false },
  { key: "fix_total_price", title: "جمع کارکرد اعداد ثابت", type: "number", sortable: true, filterable: false },
  { key: "appman", title: "تعداد روز مورد تایید نهایی", type: "number", sortable: true, filterable: false, editable: true },
  { key: "final_price", title: "قیمت بازرس نهایی", type: "number", sortable: true, filterable: false, editable: true },
  { key: "total_price", title: "جمع کارکرد اعداد متغیر", type: "number", sortable: true, filterable: false },
  { key: "remark", title: "توضیحات", type: "string", sortable: true, filterable: true },
];

const FinancialSummaryTable = forwardRef(({ data, onDelete, onEdit, isLoading, isEditingEnabled = true }, ref) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isTableReady, setIsTableReady] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editedValue, setEditedValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedRows, setModifiedRows] = useState({});
  const [localData, setLocalData] = useState(data);
  const [isEditModeActive, setIsEditModeActive] = useState(false);
  
  const scrollContainerRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const filterRefs = useRef({});
  const inputRefs = useRef({});

  useImperativeHandle(ref, () => ({
    copyInitialToFinal: () => {
      const updatedData = localData.map(row => {
        if (row.is_submit === true) return row;
        const initialDays = row.approve_manday || 0;
        const initialPrice = row.inspector_price || 0;
        const finalDays = initialDays;
        const finalPrice = initialPrice;
        const variableSum = finalDays * finalPrice;
        return {
          ...row,
          appman: finalDays,
          final_price: finalPrice,
          total_price: variableSum
        };
      });
      setLocalData(updatedData);
      setModifiedRows({});
      setIsEditModeActive(true);
    },
    disableEditing: () => {
      setIsEditModeActive(false);
      setModifiedRows({});
    },
    getModifiedRows: () => {
      // ارسال تمام سطرها با سه فیلد مورد نیاز
      return localData.map(row => ({
        idrd: row.rfi_id,
        approve_manday1: row.appman,
        final_price: row.final_price
      }));
    }
  }));

  useEffect(() => {
    setLocalData(data);
    setModifiedRows({});
  }, [data]);

  useEffect(() => {
    if (scrollContainerRef.current && localData && localData.length > 0) {
      if (isInitialLoad) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
            setTimeout(() => {
              setIsTableReady(true);
              setIsInitialLoad(false);
            }, 50);
          }
        });
      }
    }
  }, [localData, isInitialLoad]);

  useEffect(() => {
    if (editingCell) {
      const inputKey = `${editingCell.rowIndex}-${editingCell.columnName}`;
      setTimeout(() => {
        if (inputRefs.current[inputKey]) {
          inputRefs.current[inputKey].focus();
        }
      }, 50);
    }
  }, [editingCell]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && filterRefs.current[openFilter] && !filterRefs.current[openFilter].contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  const getUniqueValues = (columnName) => {
    if (!localData) return [];
    const values = [...new Set(localData.map(item => item[columnName]).filter(Boolean))];
    return values.sort((a, b) => String(a).localeCompare(String(b), 'fa'));
  };

  const handleSort = (key) => {
    const column = FIXED_COLUMNS.find(col => col.key === key);
    if (!column?.sortable) return;
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
      setSortConfig({ key: null, direction: null });
      return;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey, sortable) => {
    if (!sortable) return null;
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-white/60 mr-1 text-xs" />;
    }
    if (sortConfig.direction === 'asc') {
      return <FaSortUp className="text-white mr-1 text-xs" />;
    }
    if (sortConfig.direction === 'desc') {
      return <FaSortDown className="text-white mr-1 text-xs" />;
    }
    return <FaSort className="text-white/60 mr-1 text-xs" />;
  };

  const toggleSelectAll = (columnName, uniqueValues) => {
    const currentFilter = activeFilters[columnName];
    if (currentFilter?.type === 'checkbox' && currentFilter.value.length === uniqueValues.length) {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'checkbox', value: [...uniqueValues] }
      });
    }
  };

  const toggleItem = (columnName, itemValue) => {
    const currentFilter = activeFilters[columnName];
    let newValues;
    if (currentFilter?.type === 'checkbox') {
      if (currentFilter.value.includes(itemValue)) {
        newValues = currentFilter.value.filter(v => v !== itemValue);
      } else {
        newValues = [...currentFilter.value, itemValue];
      }
    } else {
      newValues = [itemValue];
    }
    if (newValues.length === 0) {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'checkbox', value: newValues }
      });
    }
  };

  const handleTextFilterChange = (columnName, text) => {
    if (text.trim() === '') {
      const newFilters = { ...activeFilters };
      delete newFilters[columnName];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({
        ...activeFilters,
        [columnName]: { type: 'text', value: text }
      });
    }
  };

  const clearColumnFilter = (columnName) => {
    const newFilters = { ...activeFilters };
    delete newFilters[columnName];
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const filteredAndSortedData = useMemo(() => {
    if (!localData) return [];
    let result = [...localData];
    Object.entries(activeFilters).forEach(([columnName, filter]) => {
      if (filter.type === 'checkbox' && filter.value.length > 0) {
        result = result.filter(item => filter.value.includes(item[columnName]));
      } else if (filter.type === 'text' && filter.value.trim() !== '') {
        result = result.filter(item => 
          String(item[columnName] || '').toLowerCase().includes(filter.value.toLowerCase())
        );
      }
    });
    if (sortConfig.key) {
      const column = FIXED_COLUMNS.find(col => col.key === sortConfig.key);
      if (column && column.sortable) {
        result.sort((a, b) => {
          let aVal = a[sortConfig.key];
          let bVal = b[sortConfig.key];
          if (column.type === 'number') {
            aVal = aVal || 0;
            bVal = bVal || 0;
            return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
          }
          aVal = String(aVal || '');
          bVal = String(bVal || '');
          return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal, 'fa') : bVal.localeCompare(aVal, 'fa');
        });
      }
    }
    return result;
  }, [localData, sortConfig, activeFilters]);

  const formatCellValue = (value, columnType) => {
    if (value === null || value === undefined) return '-';
    if (columnType === 'number') {
      return new Intl.NumberFormat('fa-IR').format(value);
    }
    if (columnType === 'date' && value) {
      return value;
    }
    return String(value);
  };

  const getCellAlignment = (columnType) => {
    return columnType === 'number' ? 'text-left' : 'text-right';
  };

  const isRowEditable = (row) => isEditModeActive && row.is_submit === false;

  const isEditableColumn = (columnName, row) => {
    const column = FIXED_COLUMNS.find(col => col.key === columnName);
    return column?.editable === true && isRowEditable(row);
  };

  const handleCellClick = (rowIndex, columnName, currentValue, row) => {
    if (isEditableColumn(columnName, row)) {
      setEditingCell({ rowIndex, columnName });
      setEditedValue(currentValue?.toString() || '');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setEditedValue(value);
    if (editingCell && value !== localData[editingCell.rowIndex][editingCell.columnName]?.toString()) {
      setModifiedRows(prev => ({ ...prev, [editingCell.rowIndex]: true }));
    }
  };

  const updateVariableSum = (updatedData, rowIndex) => {
    const row = updatedData[rowIndex];
    const finalDays = row.appman || 0;
    const finalPrice = row.final_price || 0;
    updatedData[rowIndex] = { ...row, total_price: finalDays * finalPrice };
    return updatedData;
  };

  const handleDirectSave = () => {
    if (!editingCell || editedValue === '') return;
    setIsSaving(true);
    setTimeout(() => {
      const { rowIndex, columnName } = editingCell;
      let updatedData = [...localData];
      let rowToUpdate = { ...updatedData[rowIndex] };
      const numericValue = editedValue ? parseInt(editedValue, 10) : 0;
      rowToUpdate[columnName] = numericValue;
      updatedData[rowIndex] = rowToUpdate;
      updatedData = updateVariableSum(updatedData, rowIndex);
      setLocalData(updatedData);
      if (onEdit) onEdit(updatedData[rowIndex]);
      setIsSaving(false);
      setEditingCell(null);
      setEditedValue('');
      toast.success('تغییرات با موفقیت ذخیره شد!');
    }, 150);
  };

  const activeFiltersCount = Object.keys(activeFilters).length;

  if (isLoading) {
    return (
      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mr-3 text-gray-600">در حال بارگذاری اطلاعات...</span>
        </div>
      </div>
    );
  }

  if (!localData || localData.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">اطلاعاتی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow flex flex-col" style={{ height: '600px' }}>
      <div ref={tableWrapperRef} className="relative flex-1" style={{ height: '100%' }}>
        {!isTableReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">در حال آماده‌سازی جدول...</span>
            </div>
          </div>
        )}
        
        <div ref={scrollContainerRef} dir="ltr" className="absolute inset-0 overflow-auto" style={{ visibility: isTableReady ? 'visible' : 'hidden' }}>
          <div dir="rtl" className="min-w-full inline-block align-middle">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap" style={{ paddingRight: '24px' }}><span>ردیف</span></th>
                  {FIXED_COLUMNS.map((column) => {
                    const uniqueValues = column.filterable ? getUniqueValues(column.key) : [];
                    const activeFilter = activeFilters[column.key];
                    const isFilterActive = activeFilter !== undefined;
                    return (
                      <th key={column.key} className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap relative">
                        <div className="flex items-center gap-1">
                          <span>{column.title}</span>
                          {column.filterable && (
                            <div className="relative" ref={el => filterRefs.current[column.key] = el}>
                              <button onClick={() => setOpenFilter(openFilter === column.key ? null : column.key)} className={`p-1 rounded ${isFilterActive ? 'bg-blue-700 text-yellow-300' : 'hover:bg-blue-700 text-white'}`}>
                                {column.type === 'string' && uniqueValues.length <= 20 ? <FaFilter className="text-xs" /> : <FaSearch className="text-xs" />}
                              </button>
                              {openFilter === column.key && (
                                <div className="absolute top-full right-0 mt-1 z-50 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[250px] max-h-[300px] overflow-y-auto">
                                  <div className="p-2 border-b border-gray-200">
                                    <div className="flex justify-between mb-2"><span className="text-xs font-semibold">جستجو در {column.title}</span><button onClick={() => setOpenFilter(null)} className="text-gray-500 hover:text-gray-700">
  <FaTimes className="text-xs text-gray-500" />
</button></div>
                                    <div className="flex gap-2">
                                      {/* <input type="text" value={activeFilter?.type === 'text' ? activeFilter.value : ''} onChange={(e) => handleTextFilterChange(column.key, e.target.value)} placeholder={`جستجوی ${column.title}...`} className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" autoFocus /> */}
                                      <input
  type="text"
  value={activeFilter?.type === 'text' ? activeFilter.value : ''}
  onChange={(e) => handleTextFilterChange(column.key, e.target.value)}
  placeholder={`جستجوی ${column.title}...`}
  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-gray-900 bg-white"
  autoFocus
/>
                                      {isFilterActive && <button onClick={() => clearColumnFilter(column.key)} className="text-red-600 text-xs">پاک کردن</button>}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <button onClick={() => handleSort(column.key)} className="p-1 rounded hover:bg-blue-700">{getSortIcon(column.key, column.sortable)}</button>
                        </div>
                        {isFilterActive && <div className="text-[10px] text-yellow-300 mt-0.5">{activeFilter.type === 'checkbox' ? `${activeFilter.value.length} انتخاب` : `شامل: ${activeFilter.value}`}</div>}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-right text-xs font-medium text-white uppercase tracking-wider whitespace-nowrap"><span>حذف</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedData.map((item, index) => {
                  const isModified = modifiedRows[index] === true;
                  const isEditableRow = isRowEditable(item);
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${isModified ? 'bg-amber-100' : ''}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900" style={{ paddingRight: '24px' }}>{index + 1}</td>
                      {FIXED_COLUMNS.map((column) => {
                        const isEditing = editingCell && editingCell.rowIndex === index && editingCell.columnName === column.key;
                        const cellValue = item[column.key];
                        const isEditable = isEditableColumn(column.key, item);
                        return (
                          <td key={column.key} className={`px-3 py-2 whitespace-nowrap text-xs text-gray-900 ${column.type === 'number' ? 'text-left' : 'text-right'}`} onClick={() => handleCellClick(index, column.key, cellValue, item)}>
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <input ref={el => inputRefs.current[`${index}-${column.key}`] = el} type="text" value={editedValue} onChange={handleInputChange} className="w-24 px-1 py-0.5 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-right" placeholder="عدد" onClick={(e) => e.stopPropagation()} />
                                  <button onClick={(e) => { e.stopPropagation(); handleDirectSave(); }} className="text-green-600 p-1 rounded hover:bg-green-50" disabled={editedValue === '' || isSaving}>{isSaving ? <div className="animate-spin h-3 w-3 border-2 border-green-600 rounded-full border-t-transparent"></div> : <FaSave size={12} />}</button>
                                </>
                              ) : (
                                <>
                                  {formatCellValue(cellValue, column.type)}
                                  {isEditable && <FaEdit className="text-gray-400 text-[10px] mr-1" />}
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                        <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50" disabled={item.is_submit === true}><FaTrash size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {activeFiltersCount > 0 && (
        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-blue-600 font-semibold">فیلترهای فعال:</span>
            {Object.entries(activeFilters).map(([columnName, filter]) => (
              <span key={columnName} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                {FIXED_COLUMNS.find(col => col.key === columnName)?.title || columnName}: {filter.type === 'checkbox' ? `${filter.value.length} مورد` : filter.value}
                <button onClick={() => clearColumnFilter(columnName)} className="text-blue-600"><FaTimes className="text-[10px]" /></button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-red-600 text-xs flex items-center gap-1"><FaTimes className="text-xs" /> حذف همه</button>
          </div>
        </div>
      )}
    </div>
  );
});

FinancialSummaryTable.displayName = 'FinancialSummaryTable';

export default FinancialSummaryTable;