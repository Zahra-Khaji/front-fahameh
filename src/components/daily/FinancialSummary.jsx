// src/components/daily/FinancialSummary.jsx
import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const FinancialSummary = ({ summary = {} }) => {
  return (
    <div className="mt-2 px-4 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
        <FaMoneyBillWave className="ml-2 text-blue-600" />
        خلاصه مالی
      </h4>
      <div className="text-sm text-gray-700">
        {/* خط اول - سه آیتم در یک خط */}
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
        
        {/* خط دوم - مجموع پرداختی */}
        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold text-green-700">
            مجموع پرداختی به {summary.mainInspector || 'بازرس'}:
          </span>
          <span className="font-bold text-green-700 text-lg">
            {summary.totalInspector1 || '۰'} تومان
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;