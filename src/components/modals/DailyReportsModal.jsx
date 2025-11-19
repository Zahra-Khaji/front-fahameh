// src/components/modals/DailyReportsModal.jsx
import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaTimes, FaBuilding, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

// Components
import Button from '../ui/Button';
import DailyReportsTable from '../daily/DailyReportsTable';

// Data & Utils
import { projects, inspectors } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const DailyReportsModal = ({ 
  isOpen, 
  onClose, 
  projectId,
  projectData // داده‌های کامل پروژه از جدول
}) => {
  const [dailyReports, setDailyReports] = useState([]); // مقدار اولیه آرایه خالی

  // وقتی مدال باز میشه یا projectData تغییر میکنه، صورت وضعیت‌ها رو ایجاد کن
  useEffect(() => {
    if (isOpen && projectData && projectData.inspectionDates) {
      // ایجاد صورت وضعیت برای هر تاریخ بازرسی
      const reports = projectData.inspectionDates.map((date, index) => ({
        id: Date.now() + index,
        inspectionDate: date,
        approvalStatus: 'pending', // وضعیت پیشفرض
        inspectorName: projectData.inspector || '', // نام بازرس از پروژه
        inspectorFee: getInspectorFee(projectData.inspector), // دستمزد از اطلاعات بازرس
        secondInspectorName: '',
        secondInspectorFee: ''
      }));
      setDailyReports(reports);
    } else {
      // اگر داده‌ها موجود نیستند، آرایه خالی تنظیم کن
      setDailyReports([]);
    }
  }, [isOpen, projectData]);

  // پیدا کردن دستمزد بازرس
  const getInspectorFee = (inspectorName) => {
    if (!inspectorName) return '';
    const inspector = inspectors.find(ins => ins.name === inspectorName);
    return inspector ? inspector.fee : '';
  };

  // آپدیت کردن صورت وضعیت
  const handleUpdateReport = (reportId, field, value) => {
    setDailyReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, [field]: value }
          : report
      )
    );
  };

  // ثبت نهایی صورت وضعیت‌ها
  const handleSubmit = () => {
    console.log('صورت وضعیت‌های ثبت شده:', dailyReports);
    // اینجا می‌تونی داده‌ها رو به API ارسال کنی
    onClose();
  };

  const selectedProject = projects.find(p => p.id === projectId);
  const projectName = selectedProject?.name || '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaClipboardList className="text-lg" />
              </div>
              <div>
                <h2 className="text-lg font-bold">صورت وضعیت‌های پروژه {projectName}</h2>
                <p className="text-green-100 text-sm mt-1">
                  {dailyReports?.length || 0} تاریخ بازرسی
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition duration-200"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* اطلاعات پروژه */}
          {projectData && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-2">
                <FaBuilding className="text-white" />
                <span>پروژه: {projectName}</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-2">
                <FaUserTie className="text-white" />
                <span>بازرس: {projectData.inspector || 'تعیین نشده'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white bg-opacity-20 rounded-lg p-2">
                <FaCalendarAlt className="text-white" />
                <span>{dailyReports?.length || 0} تاریخ بازرسی</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* جدول صورت وضعیت‌ها */}
          {dailyReports && dailyReports.length > 0 ? (
            <>
              <DailyReportsTable 
                dailyReports={dailyReports}
                onUpdate={handleUpdateReport}
              />
              
              {/* دکمه ثبت نهایی */}
              <div className="flex justify-center pt-6 mt-6 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  variant="success"
                  size="lg"
                  icon="check"
                  className="w-full md:w-96"
                >
                  ثبت صورت وضعیت‌ها
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaCalendarAlt className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold">تاریخ بازرسی‌ای یافت نشد</p>
              <p className="text-sm mt-1">لطفاً ابتدا تاریخ‌های بازرسی را در نوتیفیکیشن‌ها تعریف کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyReportsModal;