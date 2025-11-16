// src/components/forms/DailyInspectionReport.jsx
import React, { useState, useEffect } from 'react';
import { FaList, FaCalendarAlt} from 'react-icons/fa';
import FinalConfirmationContent  from "./../../components/daily/FinalConfirmationContent"

// Components
import StepHeader from '../common/StepHeader';
import RequestInfoSidebar from '../common/RequestInfoSidebar';
import Button from '../ui/Button';
import DailyReportsTable from '../daily/DailyReportsTable';
import FinancialSummary from '../daily/FinancialSummary';
import ConfirmationModal from '../ui/ConfirmationModal';

// Hooks & Utils
import { useDailyReports } from '../../hooks/useDailyReports';

const DailyInspectionReport = ({ onBack, onComplete, previousData, lists }) => {
  const [showFinalModal, setShowFinalModal] = useState(false);

  const {
    dailyReports,
    updateDailyReport,
    summary,
    validateForm
  } = useDailyReports(previousData, lists?.dailyReports || []);

  const handleFinalSubmit = () => {
    if (!validateForm()) {
      alert('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }
    setShowFinalModal(true);
  };

  const handleFinalConfirmation = () => {
    const finalData = {
      dailyReports: dailyReports,
      summary: summary
    };

    console.log('Final Daily Reports:', finalData);
    setShowFinalModal(false);
    onComplete(finalData);
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-2 sm:py-3 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="ثبت صورت وضعیت بازرسی روزانه"
          description="مرحله چهارم - ثبت گزارش روزانه و مالی بازرسی"
          icon={FaList}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RequestInfoSidebar 
              previousData={previousData} 
              onBack={onBack} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="ml-2 text-blue-500 text-sm sm:text-base" />
                  صورت وضعیت بازرسی روزانه
                </h2>
                <span className="text-xs sm:text-sm text-gray-600 bg-blue-50 px-2 sm:px-3 py-1 rounded self-start sm:self-auto">
                  {dailyReports.length} روز
                </span>
              </div>

              {/* Daily Reports Table */}
              <DailyReportsTable
                dailyReports={dailyReports}
                onUpdate={updateDailyReport}
              />

              {/* Financial Summary */}
              <FinancialSummary summary={summary} />

              {/* Final Submit Button */}
              <div className="flex justify-center pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
                <Button
                  onClick={handleFinalSubmit}
                  disabled={!validateForm()}
                  variant="success"
                  size="lg"
                  icon="save"
                  className="w-full sm:w-auto"
                >
                  تکمیل و ثبت نهایی
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFinalModal}
        onClose={() => setShowFinalModal(false)}
        onConfirm={handleFinalConfirmation}
        title="تأیید نهایی اطلاعات"
        message="لطفاً اطلاعات وارد شده را بررسی و تأیید کنید"
        confirmText="تأیید و ثبت نهایی"
        cancelText="بازگشت و ویرایش"
        type="success"
        size="large"
      >
        <FinalConfirmationContent 
          previousData={previousData} 
          summary={summary} 
          dailyReports={dailyReports}
        />
      </ConfirmationModal>
    </div>
  );
};

export default DailyInspectionReport;