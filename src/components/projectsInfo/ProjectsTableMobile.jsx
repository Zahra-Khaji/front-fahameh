// src/components/projects/ProjectsTableMobile.jsx
import React from 'react';
import { FaMapMarkerAlt, FaUserTie, FaHashtag, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import Button from '../ui/Button';
import { formatMultipleDates } from '../../utils/helpers';

const ProjectsTableMobile = ({ 
  projects, 
  onRegisterReport, 
  onRegisterDailyReport, 
  onViewDetails, 
  getCityName 
}) => {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          {/* Project Header */}
          <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                project.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <h3 className="font-bold text-gray-800 text-base">{project.name}</h3>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${
              project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {project.status === 'active' ? 'فعال' : 'تکمیل شده'}
            </span>
          </div>

          {/* Project Details */}
          <div className="space-y-3 text-sm mb-4">
            {/* Vendor and Location in one row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <FaBuilding className="text-gray-400 text-xs" />
                <div>
                  <span className="text-gray-600 text-xs block">وندور</span>
                  <span className="font-semibold text-sm">{project.vendor}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400 text-xs" />
                <div>
                  <span className="text-gray-600 text-xs block">موقعیت</span>
                  <span className="font-semibold text-sm">{getCityName(project.province, project.city)}</span>
                </div>
              </div>
            </div>

            {/* Inspector */}
            <div className="flex items-center gap-2">
              <FaUserTie className="text-gray-400 text-xs" />
              <div>
                <span className="text-gray-600 text-xs block">بازرس</span>
                <span className="font-semibold text-sm">{project.inspector}</span>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-2">
              <FaHashtag className="text-gray-400 text-xs" />
              <div>
                <span className="text-gray-600 text-xs block">نوتیفیکیشن‌ها</span>
                <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {project.notifications.join('، ')}
                </span>
              </div>
            </div>

            {/* Inspection Dates */}
            <div className="flex items-start gap-2">
              <FaCalendarAlt className="text-gray-400 text-xs mt-0.5" />
              <div className="flex-1">
                <span className="text-gray-600 text-xs block">تاریخ‌های بازرسی</span>
                <span className="font-semibold text-sm text-right block">
                  {formatMultipleDates(project.inspectionDates)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onRegisterReport(project.id)}
                variant="primary"
                size="sm"
                icon="file"
                className="w-full text-xs"
              >
                ثبت گزارش
              </Button>
              <Button
                onClick={() => onRegisterDailyReport(project.id)}
                variant="success"
                size="sm"
                icon="clipboard"
                className="w-full text-xs"
              >
                صورت وضعیت
              </Button>
            </div>
            <Button
              onClick={() => onViewDetails(project.id)}
              variant="secondary"
              size="sm"
              icon="eye"
              className="w-full text-xs"
            >
              مشاهده جزئیات
            </Button>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg p-6">
          <div className="text-3xl mb-2">📋</div>
          <p className="font-semibold">پروژه‌ای یافت نشد</p>
          <p className="text-xs text-gray-400 mt-1">لطفاً فیلترها را تنظیم کنید</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsTableMobile;