// src/components/filters/FilterPanel.jsx
import React from 'react';
import { FaTimes, FaEraser } from 'react-icons/fa';
import Button from '../ui/Button';

const FilterPanel = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (filterName, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    onFiltersChange({
      projectName: '',
      inspector: '',
      notificationNumber: ''
    });
  };

  const hasActiveFilters = filters.projectName || filters.inspector || filters.notificationNumber;

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {/* Project Name Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            نام پروژه
          </label>
          <input
            type="text"
            value={filters.projectName}
            onChange={(e) => handleFilterChange('projectName', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="جستجو بر اساس نام پروژه"
            dir="rtl"
          />
        </div>

        {/* Inspector Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            نام بازرس
          </label>
          <input
            type="text"
            value={filters.inspector}
            onChange={(e) => handleFilterChange('inspector', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="جستجو بر اساس نام بازرس"
            dir="rtl"
          />
        </div>

        {/* Notification Number Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            شماره نوتیفیکیشن
          </label>
          <input
            type="text"
            value={filters.notificationNumber}
            onChange={(e) => handleFilterChange('notificationNumber', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="جستجو بر اساس شماره نوتیفیکیشن"
            dir="rtl"
          />
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className={`
              inline-flex items-center justify-center gap-2 px-3 py-1.5 
              text-xs font-medium rounded-lg transition-all duration-200 
              border h-9 w-full md:w-auto
              ${hasActiveFilters 
                ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800 hover:border-red-400 hover:shadow-sm transform hover:scale-105' 
                : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
              }
            `}
          >
            <FaEraser className="text-xs" />
            پاک کردن فیلترها
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;