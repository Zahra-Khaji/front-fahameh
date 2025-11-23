// src/components/rfi/RFIReportTable.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaTable, FaSearch, FaSync, FaFileAlt, FaArrowRight } from 'react-icons/fa';

// Components
import StepHeader from '../common/StepHeader';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';

// Hooks
import { useProjects } from '../../hooks/useProjects';
import { useRFIReport } from '../../hooks/useRFIReport';

const RFIReportTable = () => {
  const location = useLocation();
  const [selectedProject, setSelectedProject] = useState('');
  const [projectName, setProjectName] = useState('');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isAutoFetch, setIsAutoFetch] = useState(false);

  // استفاده از هوک پروژه‌ها
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  
  // استفاده از هوک گزارش RFI
  const { data: rfiData, isLoading: rfiLoading, error: rfiError } = useRFIReport(
    projectName, 
    shouldFetch
  );

  // اثر برای خواندن query parameters از URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectFromQuery = searchParams.get('project');
    
    if (projectFromQuery) {
      const decodedProjectName = decodeURIComponent(projectFromQuery);
      setProjectName(decodedProjectName);
      setShouldFetch(true);
      setIsAutoFetch(true);
      
      // پیدا کردن ID پروژه بر اساس نام
      const foundProject = projects?.find(project => project.name === decodedProjectName);
      if (foundProject) {
        setSelectedProject(foundProject.id);
      }
    }
  }, [location.search, projects]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    setShouldFetch(false);
    setIsAutoFetch(false);
    
    const selectedProjectObj = projects?.find(project => project.id === projectId);
    if (selectedProjectObj) {
      setProjectName(selectedProjectObj.name);
    } else {
      setProjectName('');
    }
  };

  const handleSearch = () => {
    if (projectName) {
      setShouldFetch(true);
      setIsAutoFetch(false);
    }
  };

  // تبدیل داده‌های دریافتی به آرایه برای نمایش در جدول
  const tableData = useMemo(() => {
    if (!rfiData || !shouldFetch) return [];
    
    return Object.values(rfiData).map(item => ({
      ...item,
      formattedInspectionDate: new Date(item.InspectionDate).toLocaleDateString('fa-IR')
    }));
  }, [rfiData, shouldFetch]);

  // حالت‌های مختلف نمایش
  const showEmptyState = shouldFetch && !rfiLoading && !rfiError && tableData.length === 0;
  const showInitialState = !shouldFetch && !rfiLoading && !isAutoFetch;
  const showAutoFetchLoading = isAutoFetch && rfiLoading;
  const showManualLoading = !isAutoFetch && rfiLoading;
  const showResults = shouldFetch && tableData.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        <StepHeader
          title="گزارش  پروژه‌ها"
          
          description="مشاهده گزارش‌ها  بر اساس پروژه انتخابی"
          icon={FaTable}
        />

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-3 lg:p-4">
          
          {/* نمایش اطلاعات پروژه وقتی از بیرون میاد */}
          {isAutoFetch && (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaArrowRight className="text-xl" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      پروژه: {projectName}
                    </h3>
                    <p className="text-blue-100 text-sm">
                     در حال بارگذاری اطلاعات پروژه...
                    </p>
                  </div>
                </div>
                {rfiLoading && (
                  <FaSync className="animate-spin text-white text-xl" />
                )}
              </div>
            </div>
          )}

          {/* فرم انتخاب پروژه - اگر auto-fetch نباشد نمایش بده */}
          {!isAutoFetch && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-6 items-end">
              <div className="lg:col-span-3">
                <SelectField
                  label="انتخاب پروژه *"
                  value={selectedProject}
                  onChange={handleProjectChange}
                  options={projects || []}
                  placeholder={
                    projectsLoading ? "در حال دریافت لیست پروژه‌ها..." : 
                    projectsError ? "خطا در دریافت پروژه‌ها" : "انتخاب پروژه"
                  }
                  disabled={projectsLoading || !!projectsError}
                  className="py-2.5"
                />
              </div>
              
              <div className="lg:col-span-1">
                <Button
                  onClick={handleSearch}
                  variant="primary"
                  icon="search"
                  disabled={!projectName || rfiLoading}
                  className="w-full py-2.5"
                >
                  {rfiLoading ? (
                    <span className="flex items-center justify-center">
                      <FaSync className="animate-spin ml-2" />
                      در حال جستجو...
                    </span>
                  ) : (
                    'جستجو'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* نمایش خطا */}
          {rfiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm flex items-center">
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                خطا در دریافت داده‌ها: {rfiError.message}
              </p>
            </div>
          )}

          {/* Desktop Table */}
          {showResults && (
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-24">شماره RFI</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-24">وضعیت RFI</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-28">تاریخ بازرسی</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-32">شماره گزارش</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-36">RFI Numbering</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-28">نام پروژه</th>
                    <th className="p-4 text-right font-semibold text-white text-sm min-w-24">نوع پروژه</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      <td className="p-4 font-semibold text-gray-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          {item.RFI_Number}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.RFI_Status === 'Done' 
                            ? 'bg-green-100 text-green-800'
                            : item.RFI_Status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.RFI_Status === 'Done' ? 'انجام شده' : 
                           item.RFI_Status === 'Pending' ? 'در حال انجام' : 
                           item.RFI_Status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{item.formattedInspectionDate}</td>
                      <td className="p-4 font-mono text-gray-900 text-xs">{item.Report_No}</td>
                      <td className="p-4 font-mono text-gray-900 text-xs">{item.RFI_Numbering}</td>
                      <td className="p-4 text-gray-700">{item.ProjectTitle}</td>
                      <td className="p-4 text-gray-700">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                          {item.Over_Domestic}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile View */}
          {showResults && (
            <div className="md:hidden space-y-4">
              {tableData.map((item, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-semibold text-gray-800">شماره RFI: {item.RFI_Number}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.RFI_Status === 'Done' 
                          ? 'bg-green-100 text-green-800'
                          : item.RFI_Status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.RFI_Status === 'Done' ? 'انجام شده' : 
                         item.RFI_Status === 'Pending' ? 'در حال انجام' : 
                         item.RFI_Status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 font-medium">تاریخ بازرسی:</span>
                        <p className="text-gray-800">{item.formattedInspectionDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">شماره گزارش:</span>
                        <p className="text-gray-800 font-mono text-xs">{item.Report_No}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600 font-medium">RFI Numbering:</span>
                        <p className="text-gray-800 font-mono text-xs">{item.RFI_Numbering}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">نام پروژه:</span>
                        <p className="text-gray-800">{item.ProjectTitle}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 font-medium">نوع پروژه:</span>
                        <p className="text-gray-800">
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                            {item.Over_Domestic}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          {showResults && (
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <span className="font-semibold text-blue-800">تعداد گزارش : </span>
              <span className="font-bold text-blue-600">{tableData.length} مورد</span>
              <span className="mr-2 text-blue-700">برای پروژه: {projectName}</span>
              {isAutoFetch && (
                <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded mr-2">
                  بارگذاری خودکار
                </span>
              )}
            </div>
          )}

          {/* حالت خالی */}
          {showEmptyState && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaFileAlt className="text-4xl mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-semibold">گزارش  یافت نشد</p>
              <p className="text-sm text-gray-400 mt-1">
                برای پروژه <span className="font-semibold text-gray-600">{projectName}</span> هیچ گزارشی  موجود نیست.
              </p>
            </div>
          )}

          {/* حالت اولیه - فقط وقتی auto-fetch نباشد */}
          {showInitialState && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSearch className="text-4xl mx-auto mb-3 text-indigo-400" />
              <p className="text-lg font-semibold">انتخاب پروژه</p>
              <p className="text-sm text-gray-400 mt-1">
                لطفاً یک پروژه از لیست انتخاب کنید و دکمه جستجو را بزنید.
              </p>
            </div>
          )}

          {/* حالت auto-fetch loading */}
          {showAutoFetchLoading && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSync className="text-4xl mx-auto mb-3 text-blue-400 animate-spin" />
              <p className="text-lg font-semibold">در حال بارگذاری خودکار...</p>
              <p className="text-sm text-gray-400 mt-1">
                گزارش  برای پروژه <span className="font-semibold text-gray-600">{projectName}</span> در حال بارگذاری است.
              </p>
            </div>
          )}

          {/* حالت manual loading */}
          {showManualLoading && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
              <FaSync className="text-4xl mx-auto mb-3 text-indigo-400 animate-spin" />
              <p className="text-lg font-semibold">در حال جستجو...</p>
              <p className="text-sm text-gray-400 mt-1">
                در حال دریافت گزارش‌های  برای پروژه <span className="font-semibold text-gray-600">{projectName}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFIReportTable;