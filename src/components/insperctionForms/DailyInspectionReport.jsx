// src/components/DailyInspectionReport.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaList,
  FaArrowLeft,
  FaSave,
  FaFileAlt,
  FaClipboardList,
  FaBell
} from 'react-icons/fa';

// تابع کمکی برای تولید تاریخ‌های بین دو تاریخ
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  
  // اطمینان از اینکه تاریخ‌ها به درستی پارس شده‌اند
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// تابع فرمت تاریخ شمسی
const formatPersianDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('fa-IR');
  } catch (error) {
    console.error('خطا در فرمت تاریخ:', error);
    return '-';
  }
};

// تابع تبدیل رشته مالی به عدد
// در DailyInspectionReport.jsx - تابع parseFinancialString رو اینطور تصحیح کنید:

// تابع تبدیل رشته مالی به عدد - تصحیح شده
const parseFinancialString = (financialString) => {
  if (!financialString) return 0;
  
  console.log('ورودی تابع parseFinancialString:', financialString);
  
  // اگر عدد ساده هست
  if (typeof financialString === 'number') {
    return financialString;
  }
  
  // اگر رشته هست
  if (typeof financialString === 'string') {
    // حذف همه کاراکترهای غیرعددی به جز اعداد فارسی و انگلیسی
    const cleanString = financialString
      .replace(/[^۰-۹0-9]/g, '') // فقط اعداد فارسی و انگلیسی نگه دار
      .replace(/[۰-۹]/g, (char) => {
        // تبدیل اعداد فارسی به انگلیسی
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return persianNumbers.indexOf(char).toString();
      });
    
    console.log('رشته تمیز شده:', cleanString);
    
    const result = parseInt(cleanString) || 0;
    console.log('نتیجه نهایی:', result);
    return result;
  }
  
  return 0;
};


// تابع تبدیل عدد به رشته مالی فارسی
const formatFinancialNumber = (number) => {
  return number.toLocaleString('fa-IR');
};

const DailyInspectionReport = ({ onBack, onComplete, previousData }) => {
  const [dailyReports, setDailyReports] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // وضعیت‌های تأیید
  const approvalStatuses = [
    { value: 'approved', label: 'تأیید شده', color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'rejected', label: 'عدم تأیید', color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'pending', label: 'در انتظار', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'conditional', label: 'تأیید مشروط', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  // گرفتن اطلاعات از مراحل قبلی
  const defaultInspector = previousData?.inspectorInfo?.inspectorName || '';
  const defaultFee = previousData?.inspectorInfo?.fee || '';
  const projectName = previousData?.projectInfo?.projectName || '';
  const province = previousData?.projectInfo?.province || '';
  const city = previousData?.projectInfo?.city || '';
  const seller = previousData?.projectInfo?.seller || '';

  // گرفتن بازه زمانی واقعی از مرحله نوتیفیکیشن
  const getRealInspectionRange = () => {
    console.log('previousData:', previousData);
    
    // اول سعی می‌کنیم از notifications بگیریم
    if (previousData?.notifications && previousData.notifications.length > 0) {
      const notification = previousData.notifications[0];
      if (notification.inspectionRange && Array.isArray(notification.inspectionRange) && notification.inspectionRange.length === 2) {
        console.log('استفاده از inspectionRange نوتیفیکیشن:', notification.inspectionRange);
        return notification.inspectionRange;
      }
    }
    
    // سپس از inspectionRange مستقیم بگیریم
    if (previousData?.inspectionRange && Array.isArray(previousData.inspectionRange) && previousData.inspectionRange.length === 2) {
      console.log('استفاده از inspectionRange مستقیم:', previousData.inspectionRange);
      return previousData.inspectionRange;
    }
    
    // اگر هیچکدام نبود، لاگ کنیم و از تاریخ‌های نمونه استفاده کنیم
    console.log('داده‌های بازه زمانی یافت نشد، از نمونه استفاده می‌شود');
    return [
      new Date('2024-10-13'), // ۱۳ مهر ۱۴۰۳
      new Date('2024-10-15')  // ۱۵ مهر ۱۴۰۳
    ];
  };

  const realInspectionRange = getRealInspectionRange();

  // مقداردهی اولیه
  useEffect(() => {
    initializeComponent();
  }, [previousData]);

  const initializeComponent = () => {
    // لیست بازرسان
    setInspectors([
      { id: '1', name: defaultInspector },
      { id: '2', name: 'مهندس رضایی' },
      { id: '3', name: 'مهندس کریمی' },
      { id: '4', name: 'مهندس احمدی' }
    ]);

    // تولید سطرهای جدول بر اساس بازه زمانی واقعی
    generateDailyReports();
  };

  const generateDailyReports = () => {
    // استفاده از بازه زمانی واقعی از مرحله نوتیفیکیشن
    const dates = getDatesInRange(realInspectionRange[0], realInspectionRange[1]);
    
    console.log('تاریخ‌های تولید شده برای جدول:');
    dates.forEach((date, index) => {
      console.log(`سطر ${index + 1}:`, formatPersianDate(date));
    });
    
    const reports = dates.map((date, index) => ({
      id: Date.now() + index,
      inspectionDate: date,
      approvalStatus: 'approved',
      inspectorName: defaultInspector,
      inspectorFee: defaultFee,
      secondInspectorName: '',
      secondInspectorFee: ''
    }));

    setDailyReports(reports);
  };

  // مدیریت تغییر مقادیر
  const handleInputChange = (reportId, field, value) => {
    setDailyReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, [field]: value }
          : report
      )
    );
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    return dailyReports.every(report => 
      report.approvalStatus && 
      report.inspectorName && 
      report.inspectorFee
    );
  };

  // مدیریت ثبت نهایی
  const handleFinalSubmit = () => {
    if (!validateForm()) {
      alert('لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    setShowFinalModal(true);
  };

  // تائید نهایی و ارسال داده
  const handleFinalConfirmation = () => {
    const finalData = {
      dailyReports: dailyReports,
      summary: calculateSummary()
    };

    console.log('Final Daily Reports:', finalData);
    setShowFinalModal(false);
    onComplete(finalData);
  };

  // محاسبه خلاصه مالی
// محاسبه خلاصه مالی - تصحیح شده
const calculateSummary = () => {
  const approvedReports = dailyReports.filter(report => report.approvalStatus === 'approved');
  
  console.log('گزارش‌های تأیید شده:', approvedReports);
  
  const totalInspector1 = approvedReports.reduce((sum, report) => {
    const fee = parseFinancialString(report.inspectorFee);
    console.log(`دستمزد "${report.inspectorFee}" -> ${fee}`);
    return sum + fee;
  }, 0);

  const totalInspector2 = approvedReports.reduce((sum, report) => {
    const fee = parseFinancialString(report.secondInspectorFee);
    console.log(`دستمزد دوم "${report.secondInspectorFee}" -> ${fee}`);
    return sum + fee;
  }, 0);

  const mainInspector = dailyReports[0]?.inspectorName || defaultInspector || 'بازرس';
  const totalDays = dailyReports.length;
  const approvedDays = approvedReports.length;

  console.log('مجموع محاسبه شده بازرس ۱:', totalInspector1);
  console.log('مجموع محاسبه شده بازرس ۲:', totalInspector2);

  return {
    mainInspector,
    totalDays,
    approvedDays,
    totalInspector1: formatFinancialNumber(totalInspector1),
    totalInspector2: formatFinancialNumber(totalInspector2),
    grandTotal: formatFinancialNumber(totalInspector1 + totalInspector2),
    rawTotal1: totalInspector1,
    rawTotal2: totalInspector2
  };
};

  const summary = calculateSummary();

  // تابع برای گرفتن نام استان و شهر
  const getLocationName = (provinceId, cityId) => {
    const provinces = [
      { id: '1', name: 'تهران' },
      { id: '2', name: 'اصفهان' },
      { id: '3', name: 'فارس' },
    ];
    
    const citiesByProvince = {
      '1': [{ id: '1-1', name: 'تهران' }],
      '2': [{ id: '2-1', name: 'اصفهان' }],
      '3': [{ id: '3-1', name: 'شیراز' }],
    };

    const province = provinces.find(p => p.id === provinceId);
    const city = citiesByProvince[provinceId]?.find(c => c.id === cityId);
    return {
      provinceName: province ? province.name : '-',
      cityName: city ? city.name : '-'
    };
  };

  // تابع برای گرفتن نام فروشنده
  const getSellerName = (sellerId) => {
    const sellers = [
      { id: '1', name: 'برزین' },
      { id: '2', name: 'مجتمع صنعتی آریا' },
    ];
    const seller = sellers.find(s => s.id === sellerId);
    return seller ? seller.name : '-';
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* هدر */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white text-center mb-4 shadow-lg">
          <div className="flex items-center justify-center mb-1">
            <FaList className="text-2xl ml-2" />
            <h1 className="text-xl font-bold">ثبت صورت وضعیت بازرسی روزانه</h1>
          </div>
          <p className="text-blue-100 text-sm">مرحله چهارم - ثبت گزارش روزانه و مالی بازرسی</p>
          
          {/* نمایش بازه زمانی واقعی */}
          {/* <div className="mt-2 text-blue-200 text-xs">
            بازه زمانی: {formatPersianDate(realInspectionRange[0])} تا {formatPersianDate(realInspectionRange[1])}
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* سایدبار اطلاعات قبلی */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                اطلاعات پایه
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">پروژه:</span>
                  <p className="text-gray-800">{projectName || '-'}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">بازرس اصلی:</span>
                  <p className="text-gray-800">{defaultInspector || '-'}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">دستمزد پایه:</span>
                  <p className="text-gray-800">{defaultFee || '-'}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-600">تعداد روزها:</span>
                  <p className="text-gray-800">{dailyReports.length} روز</p>
                </div>

                {/* <div className="p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700 text-center">
                    بازه انتخابی: {formatPersianDate(realInspectionRange[0])} تا {formatPersianDate(realInspectionRange[1])}
                  </p>
                </div> */}

                <button
                  onClick={onBack}
                  className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 mt-4 flex items-center justify-center"
                >
                  <FaArrowLeft className="ml-2" />
                  بازگشت به مرحله قبل
                </button>
              </div>
            </div>
          </div>

          {/* محتوای اصلی - جدول صورت وضعیت */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <FaCalendarAlt className="ml-2 text-blue-500" />
                  صورت وضعیت بازرسی روزانه
                </h2>
                <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                  {dailyReports.length} روز
                </span>
              </div>

              {/* جدول صورت وضعیت */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-32">
                        تاریخ بازرسی
                      </th>
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-40">
                        وضعیت تأیید *
                      </th>
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-44">
                        نام بازرس *
                      </th>
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-36">
                        دستمزد (تومان) *
                      </th>
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-44">
                        نام بازرس دوم
                      </th>
                      <th className="p-3 text-right font-semibold text-gray-700 min-w-36">
                        دستمزد بازرس دوم
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyReports.map((report, index) => (
                      <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                        {/* تاریخ بازرسی */}
                        <td className="p-3">
                          <div className="flex items-center text-gray-700 font-semibold">
                            <FaCalendarAlt className="ml-1 text-blue-500 text-xs" />
                            {formatPersianDate(report.inspectionDate)}
                          </div>
                        </td>

                        {/* وضعیت تأیید */}
                        <td className="p-3">
                          <select
                            value={report.approvalStatus}
                            onChange={(e) => handleInputChange(report.id, 'approvalStatus', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                          >
                            {approvalStatuses.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* نام بازرس */}
                        <td className="p-3">
                          <select
                            value={report.inspectorName}
                            onChange={(e) => handleInputChange(report.id, 'inspectorName', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                          >
                            {inspectors.map(inspector => (
                              <option key={inspector.id} value={inspector.name}>
                                {inspector.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* دستمزد بازرس */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={report.inspectorFee}
                            onChange={(e) => handleInputChange(report.id, 'inspectorFee', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                            placeholder="مثال: ۱,۲۰۰,۰۰۰"
                          />
                        </td>

                        {/* نام بازرس دوم */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={report.secondInspectorName}
                            onChange={(e) => handleInputChange(report.id, 'secondInspectorName', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200"
                            placeholder="اختیاری"
                          />
                        </td>

                        {/* دستمزد بازرس دوم */}
                        <td className="p-3">
                          <input
                            type="text"
                            value={report.secondInspectorFee}
                            onChange={(e) => handleInputChange(report.id, 'secondInspectorFee', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-200 text-left"
                            placeholder="اختیاری"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* خلاصه مالی */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaMoneyBillWave className="ml-2 text-blue-600" />
                  خلاصه مالی
                </h4>
                <div className="text-sm text-gray-700">
                  {/* خط اول - سه آیتم در یک خط */}
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-blue-200">
                    <div>
                      <span className="font-semibold">بازرس اصلی:</span>
                      <span className="mr-2">{summary.mainInspector}</span>
                    </div>
                    <div>
                      <span className="font-semibold">تعداد روزها:</span>
                      <span className="mr-2">{summary.totalDays} روز</span>
                    </div>
                    <div>
                      <span className="font-semibold">تأیید شده:</span>
                      <span className="mr-2">{summary.approvedDays} روز</span>
                    </div>
                  </div>
                  
                  {/* خط دوم - مجموع پرداختی */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-semibold text-green-700">
                      مجموع پرداختی به {summary.mainInspector}:
                    </span>
                    <span className="font-bold text-green-700 text-lg">
                      {summary.totalInspector1} تومان
                    </span>
                  </div>
                </div>
              </div>

              {/* دکمه تکمیل نهایی */}
              <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={handleFinalSubmit}
                  disabled={!validateForm()}
                  className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg flex items-center"
                >
                  <FaSave className="ml-2" />
                  تکمیل و ثبت نهایی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مدال تأیید نهایی */}
   

{/* مدال تأیید نهایی */}
{showFinalModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
      {/* هدر مدال */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl px-6 py-2 text-white text-center sticky top-0">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-white" />
        </div>
        <h2 className="text-2xl font-bold">تأیید نهایی اطلاعات</h2>
        <p className="text-green-100 text-sm mt-2">لطفاً اطلاعات وارد شده را بررسی و تأیید کنید</p>
      </div>

      {/* محتوای مدال */}
      <div className="p-6">
        {/* خلاصه اطلاعات تمام مراحل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* اطلاعات پروژه */}
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <FaClipboardList className="ml-2" />
              اطلاعات پروژه
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">نام پروژه:</span>
                <span className="font-semibold">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">موقعیت:</span>
                <span className="font-semibold">
                  {getLocationName(province, city).provinceName} - {getLocationName(province, city).cityName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">وندور:</span>
                <span className="font-semibold">{getSellerName(seller)}</span>
              </div>
            </div>
          </div>

          {/* اطلاعات بازرسی - ترکیب اطلاعات بازرس و بازه زمانی */}
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
            <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
              <FaUserTie className="ml-2" />
              اطلاعات بازرسی
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">بازرس اصلی:</span>
                <span className="font-semibold">{defaultInspector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">موقعیت بازرس:</span>
                <span className="font-semibold">{previousData?.inspectorInfo?.inspectorLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">دستمزد پایه:</span>
                <span className="font-semibold">{defaultFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تخصص:</span>
                <span className="font-semibold">{previousData?.inspectorInfo?.expertise}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">بازه زمانی:</span>
                <span className="font-semibold">
                  {formatPersianDate(realInspectionRange[0])} تا {formatPersianDate(realInspectionRange[1])}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تعداد روزها:</span>
                <span className="font-semibold">{dailyReports.length} روز</span>
              </div>
            </div>
          </div>

          {/* خلاصه مالی - حذف پرداختی بازرس دوم */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
              <FaMoneyBillWave className="ml-2" />
              خلاصه مالی
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تعداد گزارش‌های تأیید شده:</span>
                <span className="font-semibold">{summary.approvedDays} روز</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">دستمزد روزانه:</span>
                <span className="font-semibold">{defaultFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">مجموع پرداختی:</span>
                <span className="font-semibold text-green-700">{summary.totalInspector1} تومان</span>
              </div>
            </div>
          </div>

          {/* صورت وضعیت روزانه */}
          {/* <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
              <FaFileAlt className="ml-2" />
              صورت وضعیت
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تعداد روزهای بازرسی:</span>
                <span className="font-semibold">{dailyReports.length} روز</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">روزهای تأیید شده:</span>
                <span className="font-semibold">{summary.approvedDays} روز</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">روزهای در انتظار:</span>
                <span className="font-semibold">
                  {dailyReports.filter(report => report.approvalStatus === 'pending').length} روز
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">روزهای رد شده:</span>
                <span className="font-semibold">
                  {dailyReports.filter(report => report.approvalStatus === 'rejected').length} روز
                </span>
              </div>
            </div>
          </div> */}
        </div>

      

        {/* دکمه‌های اقدام */}
        <div className="flex gap-4 pt-2 border-t border-gray-200 -mt-6">
          <button
            onClick={handleFinalConfirmation}
            className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition duration-200 font-semibold text-lg flex items-center justify-center shadow-lg"
          >
            <FaCheck className="ml-2" />
            تأیید و ثبت نهایی
          </button>
          <button
            onClick={() => setShowFinalModal(false)}
            className="flex-1 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition duration-200 font-semibold text-lg"
          >
            بازگشت و ویرایش
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default DailyInspectionReport;