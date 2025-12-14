// src/components/projects/ProjectsTable.jsx
import React, { useState, useMemo } from 'react';
import { FaFilter, FaFileAlt, FaClipboardList, FaEye } from 'react-icons/fa';

// Components
import StepHeader from '../common/StepHeader';
import FilterPanel from './FilterPanel';
import Button from '../ui/Button';
import ProjectsTableMobile from './ProjectsTableMobile'; // اضافه شده

// Data & Utils
import { provinces, citiesByProvince } from '../../data/staticData';
import { formatMultipleDates } from '../../utils/helpers';
import InspectionReportModal from '../modals/InspectionReportModal';
import DailyReportsModal from '../modals/DailyReportsModal';
// import DailyReportsModal from '../modals/DailyReportsModal';

// Sample Data
const sampleProjectsData = [
  {
    id: 1,
    name: "بدر شرق",
    vendor: "برزین",
    province: "1",
    city: "1-1",
    inspector: "مهندس محمدی",
    notifications: [1001, 1002],
    inspectionDates: [new Date('2024-01-15'), new Date('2024-01-16')],
    status: "active"
  },
  {
    id: 2,
    name: "پارس بهین پالایش",
    vendor: "مجتمع صنعتی آریا",
    province: "2",
    city: "2-1",
    inspector: "مهندس رضایی",
    notifications: [1003],
    inspectionDates: [new Date('2024-02-20')],
    status: "active"
  },
  {
    id: 3,
    name: "پتروشیمی جم",
    vendor: "کارخانجات پیشتاز",
    province: "3",
    city: "3-1",
    inspector: "مهندس کریمی",
    notifications: [1004, 1005, 1006],
    inspectionDates: [new Date('2024-03-10'), new Date('2024-03-11'), new Date('2024-03-12')],
    status: "completed"
  }
];

const ProjectsTable = () => {
  const [filters, setFilters] = useState({
    projectName: '',
    inspector: '',
    notificationNumber: ''
  });
  const [selectedProjectForReport, setSelectedProjectForReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
    const [selectedProjectForDaily, setSelectedProjectForDaily] = useState(null);
    const [showDailyModal, setShowDailyModal] = useState(false);
  
 
    const handleRegisterDailyReport = (projectId, projectData) => {
      setSelectedProjectForDaily(projectId);
 
      const project = sampleProjectsData.find(p => p.id === projectId);
      setShowDailyModal(true);
    };

  const handleRegisterReport = (projectId) => {
    setSelectedProjectForReport(projectId);
    setShowReportModal(true);
  };
  // فیلتر کردن داده‌ها
  const filteredProjects = useMemo(() => {
    return sampleProjectsData.filter(project => {
      const matchesProjectName = filters.projectName === '' || 
        project.name.toLowerCase().includes(filters.projectName.toLowerCase());
      const matchesInspector = filters.inspector === '' || 
        project.inspector.toLowerCase().includes(filters.inspector.toLowerCase());
      const matchesNotification = filters.notificationNumber === '' || 
        project.notifications.some(notif => notif.toString().includes(filters.notificationNumber));

      return matchesProjectName && matchesInspector && matchesNotification;
    });
  }, [filters]);

  const getCityName = (provinceId, cityId) => {
    const city = citiesByProvince[provinceId]?.find(c => c.id === cityId);
    return city ? city.name : '-';
  };



  const handleViewDetails = (projectId) => {


    const fetchData = async () => {
  
      try {
       const response = await fetch('http://127.0.0.1:8001/projects', {
           method: 'GET',
           headers: {
               'accept': 'application/json',
               'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJNLVNhZHJpIiwiZXhwIjoxNzYzOTM2NzEzfQ.K3eY3rokXwr-GnXeWdVqIj6lwjVtE_5AUhyAe6bE7nc'
           },
           // mode: 'no-cors'
       });
   
       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }
   
       const data = await response.json();
       console.log("Data received:", data);
   } catch (error) {
       console.error('Error fetching data:', error);
   }
    };
    fetchData()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Header شبیه فرم‌های قبلی */}
        <StepHeader
          title="مدیریت پروژه‌های بازرسی"
          description="مشاهده و مدیریت تمام پروژه‌های بازرسی"
          icon={FaFilter}
        />

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-3 lg:p-4">
          
          {/* Filter Panel - همیشه نمایش داده می‌شه */}
          <div className="mb-4 lg:mb-6">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              {/* Table Header با رنگ آبی */}
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-24">نام پروژه</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-24">وندور</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-20">موقعیت</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-24">نام بازرس</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-28">نوتیفیکیشن‌ها</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-36">تاریخ‌های بازرسی</th>
                  <th className="p-4 text-right font-semibold text-white text-sm min-w-40">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project, index) => (
                  <tr 
                    key={project.id} 
                    className={`border-b border-gray-200 transition duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50`}
                  >
                    <td className="p-4 font-semibold text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          project.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        {project.name}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{project.vendor}</td>
                    <td className="p-4 text-gray-700">{getCityName(project.province, project.city)}</td>
                    <td className="p-4 text-gray-700">{project.inspector}</td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {project.notifications.join('، ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 text-xs">
                      {formatMultipleDates(project.inspectionDates)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRegisterReport(project.id)}
                          variant="primary"
                          size="sm"
                          icon="file"
                          className="text-xs px-3"
                        >
                          گزارش
                        </Button>
                        <Button
                          onClick={() => handleRegisterDailyReport(project.id)}
                          variant="success"
                          size="sm"
                          icon="clipboard"
                          className="text-xs px-3"
                        >
                          صورت وضعیت
                        </Button>
                        <Button
                          onClick={() => handleViewDetails(project.id)}
                          variant="secondary"
                          size="sm"
                          icon="eye"
                          className="text-xs px-3"
                        >
                          مشاهده
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-white">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-lg font-semibold">پروژه‌ای یافت نشد</p>
                <p className="text-sm text-gray-400 mt-1">لطفاً فیلترها را تنظیم کنید</p>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
            <span className="font-semibold text-blue-800">تعداد پروژه‌ها: </span>
            <span className="font-bold text-blue-600">{filteredProjects.length} مورد</span>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <ProjectsTableMobile
              projects={filteredProjects}
              onRegisterReport={handleRegisterReport}
              onRegisterDailyReport={handleRegisterDailyReport}
              onViewDetails={handleViewDetails}
              getCityName={getCityName}
            />
          </div>
        </div>
        <InspectionReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          projectId={selectedProjectForReport}
        />
           <DailyReportsModal
          isOpen={showDailyModal}
          onClose={() => setShowDailyModal(false)}
          projectId={selectedProjectForDaily}
          projectData={sampleProjectsData.find(p => p.id === selectedProjectForDaily)}
        />
      </div>
    </div>
  );
};

export default ProjectsTable;