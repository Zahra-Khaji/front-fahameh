import React from "react";

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = "داده‌ای وجود ندارد",
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2 ${
                  col.align === "center" ? "text-center" : "text-right"
                }`}
              >
                {col.title}
              </th>
            ))}
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

          {!loading && !error && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-6">
                {emptyMessage}
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="border-t hover:bg-gray-50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 ${
                      col.align === "center" ? "text-center" : "text-right"
                    }`}
                  >
                    {/* اصلاح مهم: پاس دادن row به render */}
                    {col.render ? col.render(row) : (row[col.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;