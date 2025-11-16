// src/components/daily/FinancialSummary.jsx
import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const FinancialSummary = ({ summary = {} }) => {
  return (
    <div className="mt-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
        <FaMoneyBillWave className="ml-2 text-blue-600 text-sm sm:text-base" />
        خلاصه مالی
      </h4>
      <div className="text-xs sm:text-sm text-gray-700">
        {/* Desktop View */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center mb-1 pb-0.5 border-b border-blue-200">
            <div>
              <span className="font-semibold">بازرس اصلی:</span>
              <span className="mr-2">{summary.mainInspector || '-'}</span>
            </div>
            <div>
              <span className="font-semibold">تعداد روزها:</span>
              <span className="mr-2">{summary.totalDays || 0} روز</span>
            </div>
            <div>
              <span className="font-semibold">تأیید شده:</span>
              <span className="mr-2">{summary.approvedDays || 0} روز</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <span className="font-semibold text-green-700">
              مجموع پرداختی به {summary.mainInspector || 'بازرس'}:
            </span>
            <span className="font-bold text-green-700 text-base sm:text-lg">
              {summary.totalInspector1 || '۰'} تومان
            </span>
          </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold">بازرس اصلی:</span>
            <span>{summary.mainInspector || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">تعداد روزها:</span>
            <span>{summary.totalDays || 0} روز</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">تأیید شده:</span>
            <span>{summary.approvedDays || 0} روز</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-blue-200">
            <span className="font-semibold text-green-700">مجموع پرداختی:</span>
            <span className="font-bold text-green-700">
              {summary.totalInspector1 || '۰'} تومان
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;