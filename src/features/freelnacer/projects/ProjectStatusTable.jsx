import React, { useState } from 'react';

const ProjectStatusTable = () => {
  // داده‌های نمونه برای جدول
  const [projects, setProjects] = useState([
    {
      id: 2,
      projectName: 'پروژه پارس بهین پالایش',
      vendorName: 'بهین',
      location: 'قشم',
      inspectorName: 'مریم کریمی',
      inspectionDate: '1404/08/18',
      reportStatus: 'در حال بازرسی',
      inspectorPayment: '---'
    },
    {
      id: 3,
      projectName: 'پروژه پتروشیمی جم',
      vendorName: 'جم',
      location: 'عسلویه',
      inspectorName: 'رضا احمدی',
      inspectionDate: '1404/07/10',
      reportStatus: 'نیاز به اصلاح',
      inspectorPayment: '---'
    },
    {
      id: 1,
      projectName: 'پروژه بدر شرق',
      vendorName: 'بدرین',
      location: 'چابهار',
      inspectorName: 'علی محمدی',
      inspectionDate: '1404/06/15',
      reportStatus: 'تکمیل شده',
      inspectorPayment: '2,500,000 تومان'
    },
 
 
    // {
    //   id: 4,
    //   projectName: 'پروژه پترو ساحل',
    //   vendorName: 'شرکت رایانش ابری',
    //   location: 'شیراز، بلوار زرگری',
    //   inspectorName: 'سارا نوروزی',
    //   inspectionDate: '1402/05/22',
    //   reportStatus: 'تکمیل شده',
    //   inspectorPayment: '3,000,000 تومان'
    // },
    // {
    //   id: 5,
    //   projectName: 'پروژه آسفالت طوسی',
    //   vendorName: 'آژانس طراحی وب',
    //   location: 'تبریز، خیابان امام',
    //   inspectorName: 'محمد حسینی',
    //   inspectionDate: '1402/05/25',
    //   reportStatus: 'در انتظار تایید',
    //   inspectorPayment: '1,500,000 تومان'
    // }
  ]);

  // وضعیت‌های مختلف برای فیلتر
  const statusOptions = ['همه', 'تکمیل شده', 'در حال بررسی', 'نیاز به اصلاح', 'در انتظار تایید'];
  const [selectedStatus, setSelectedStatus] = useState('همه');
  const [searchTerm, setSearchTerm] = useState('');

  // فیلتر کردن پروژه‌ها بر اساس وضعیت و جستجو
  const filteredProjects = projects.filter(project => {
    const matchesStatus = selectedStatus === 'همه' || project.reportStatus === selectedStatus;
    const matchesSearch = 
      project.projectName.includes(searchTerm) ||
      project.vendorName.includes(searchTerm) ||
      project.inspectorName.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  // تابع برای تغییر رنگ وضعیت
  const getStatusColor = (status) => {
    switch(status) {
      case 'تکمیل شده':
        return 'bg-green-100 text-green-800';
      case 'در حال بازرسی':
        return 'bg-blue-100 text-blue-800';
      case 'نیاز به اصلاح':
        return 'bg-yellow-100 text-yellow-800';
      case 'در انتظار تایید':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* هدر جدول */}
          {/* <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">وضعیت پروژه‌های شرکت</h1>
            <p className="text-gray-600 mt-1">نمایش کلیه پروژه‌های جاری و وضعیت بازرسی آنها</p>
          </div> */}
          
          {/* فیلترها و جستجو */}
          {/* <div className="px-6 py-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="جستجو در پروژه‌ها..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              نمایش <span className="font-bold">{filteredProjects.length}</span> پروژه از <span className="font-bold">{projects.length}</span> پروژه
            </div>
          </div> */}
          
          {/* جدول */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام پروژه
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام وندور
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    موقعیت
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    نام بازرس
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاریخ بازرسی
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    وضعیت گزارش بازرس
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    دریافتی بازرس
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{project.vendorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{project.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{project.inspectorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{project.inspectionDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.reportStatus)}`}>
                          {project.reportStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {project.inspectorPayment}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      هیچ پروژه‌ای با معیارهای انتخاب شده یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* فوتر جدول */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
            آخرین بروزرسانی: امروز ساعت ۱۴:۳۰
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusTable;