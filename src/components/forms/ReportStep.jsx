// src/components/forms/ReportStep.jsx
import React, { useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';

// Components
import StepHeader from '../common/StepHeader';
import RequestInfoSidebar from '../common/RequestInfoSidebar';
import Button from '../ui/Button';
import ReportForm from '../report/ReportForm';
import ReportsList from '../report/ReportsList';
import NotificationsTable from '../notification/NotificationsTable';

// Hooks & Utils
import { useReports } from '../../hooks/useReports';

const ReportStep = ({ onBack, onComplete, previousData, lists, onListChange }) => {
  const [showAddForm, setShowAddForm] = useState(true);
  
  const {
    reports,
    addReport,
    updateReport,
    deleteReport,
    lastReportNumber
  } = useReports(lists?.reports || [], onListChange);

  const handleFinalSubmit = (reportData) => {
    const newReport = {
      id: Date.now(),
      ...reportData,
      inspector: previousData?.inspectorInfo?.inspectorName || '',
      project: previousData?.projectInfo?.projectName || '',
      createdAt: new Date()
    };

    addReport(newReport);
    setShowAddForm(false);
  };

  // const handleCompleteStep = () => {
  //   const stepData = {
  //     reports: reports
  //   };
  //   console.log('ارسال داده‌های گزارش:', stepData);
  //   onComplete(stepData);
  // };
  const handleCompleteStep = () => {
    // استفاده از وضعیت آخرین گزارش اضافه شده
    const latestReportStatus = reports.length > 0 ? reports[0].status : 'under_inspection';
    
    const stepData = {
      reports: reports,
      reportStatus: latestReportStatus // ارسال وضعیت گزارش
    };
    
    console.log('ارسال داده‌های گزارش:', stepData);
    onComplete(stepData);
  };

  // استفاده از نوتیفیکیشن‌های واقعی از previousData
  const realNotifications = previousData?.notifications || [];

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="ثبت اطلاعات گزارش بازرس"
          description="مرحله سوم - ثبت نتایج و گزارش‌های بازرسی"
          icon={FaFileAlt}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <RequestInfoSidebar 
              previousData={previousData} 
              onBack={onBack} 
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Notifications Table با دیتای واقعی */}
            {realNotifications.length > 0 && (
              <NotificationsTable notifications={realNotifications} />
            )}

            {/* Add Report Form */}
            {showAddForm && (
              <ReportForm
                lastReportNumber={lastReportNumber}
                onSubmit={handleFinalSubmit}
                onCancel={() => setShowAddForm(false)}
              />
            )}

            {/* Reports List */}
            {reports.length > 0 && (
              <ReportsList
                reports={reports}
                onEdit={updateReport}
                onDelete={deleteReport}
                onAddNew={() => setShowAddForm(true)}
                showAddButton={!showAddForm}
                onComplete={handleCompleteStep}
              />
            )}

            {/* Empty State */}
            {!showAddForm && reports.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <FaFileAlt className="text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">هنوز گزارشی ثبت نشده</h3>
                  <p className="text-sm mt-1">برای شروع، اولین گزارش بازرس را ثبت کنید</p>
                </div>
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="primary"
                  icon="plus"
                >
                  افزودن گزارش
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStep;