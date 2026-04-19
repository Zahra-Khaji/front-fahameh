import React, { useState, useMemo } from "react";
import { FaSearch, FaSort, FaSortUp, FaSortDown, FaTimes } from "react-icons/fa";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = "داده‌ای وجود ندارد",
  searchable = true,
  sortable = true,
  searchPlaceholder = "جستجو...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // پیدا کردن کلید ستون اصلی (اولین ستون غیر عملیات)
  const mainColumnKey = useMemo(() => {
    const mainColumn = columns.find(col => col.key !== "actions");
    return mainColumn?.key || columns[0]?.key;
  }, [columns]);

  // فیلتر کردن داده‌ها بر اساس جستجو
  const filteredData = useMemo(() => {
    if (!searchTerm.trim() || !mainColumnKey) {
      return data;
    }
    
    const searchLower = searchTerm.trim().toLowerCase();
    return data.filter(row => {
      const value = row[mainColumnKey];
      if (!value) return false;
      return String(value).toLowerCase().includes(searchLower);
    });
  }, [data, searchTerm, mainColumnKey]);

  // مرتب‌سازی داده‌ها
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }
    
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";
      
      aVal = String(aVal);
      bVal = String(bVal);
      
      if (sortConfig.direction === "asc") {
        return aVal.localeCompare(bVal, "fa");
      } else {
        return bVal.localeCompare(aVal, "fa");
      }
    });
  }, [filteredData, sortConfig]);

  // تابع مرتب‌سازی - فقط برای ستون‌های غیر عملیات
  const handleSort = (key) => {
    if (key === "actions" || !sortable) return;
    
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = null;
      setSortConfig({ key: null, direction: null });
      return;
    }
    setSortConfig({ key, direction });
  };

  // آیکون مرتب‌سازی - فقط برای ستون‌های غیر عملیات
  const getSortIcon = (columnKey) => {
    if (columnKey === "actions" || !sortable) return null;
    
    if (sortConfig.key !== columnKey) {
      return <FaSort className="text-gray-400 text-xs inline" />;
    }
    if (sortConfig.direction === "asc") {
      return <FaSortUp className="text-blue-600 text-xs inline" />;
    }
    if (sortConfig.direction === "desc") {
      return <FaSortDown className="text-blue-600 text-xs inline" />;
    }
    return <FaSort className="text-gray-400 text-xs inline" />;
  };

  // پاک کردن جستجو
  const clearSearch = () => {
    setSearchTerm("");
  };

  // تعیین داده نهایی برای نمایش
  const displayData = sortedData;

  // شمارنده نتایج
  const resultCount = displayData.length;
  const totalCount = data.length;
  const isFiltered = searchTerm.trim() !== "";

  return (
    <div className="w-full">
      {/* نوار جستجو */}
      {searchable && (
        <div className="mb-3 relative">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FaSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
          {isFiltered && (
            <div className="text-xs text-gray-500 mt-1">
              {resultCount} مورد از {totalCount} یافت شد
            </div>
          )}
        </div>
      )}

      {/* جدول */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              {columns.map((col) => {
                const isActionColumn = col.key === "actions";
                return (
                  <th
                    key={col.key}
                    className={`px-4 py-2 whitespace-nowrap ${
                      col.align === "center" ? "text-center" : "text-right"
                    } ${!isActionColumn && sortable ? "cursor-pointer hover:bg-gray-200" : ""}`}
                    onClick={() => handleSort(col.key)}
                    style={{ minWidth: isActionColumn ? "100px" : "auto" }}
                  >
                    {isActionColumn ? (
                      // ستون عملیات - فقط عنوان
                      <span>{col.title}</span>
                    ) : (
                      // ستون‌های دیگر - عنوان + آیکون سورت در کنار هم
                      <div className="inline-flex items-center gap-1">
                        <span>{col.title}</span>
                        {getSortIcon(col.key)}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
                  در حال بارگذاری...
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-red-500">
                  خطا در دریافت اطلاعات
                </td>
              </tr>
            )}

            {!loading && !error && displayData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-6">
                  {searchTerm ? "نتیجه‌ای برای جستجوی شما یافت نشد" : emptyMessage}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              displayData.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="border-t hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2 whitespace-nowrap ${
                        col.align === "center" ? "text-center" : "text-right"
                      }`}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;