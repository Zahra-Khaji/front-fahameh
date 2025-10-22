// src/components/ReportStep.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaHashtag,
  FaList,
  FaTrash,
  FaPlus,
  FaTimes,
  FaFileAlt,
  FaBell
} from 'react-icons/fa';

// داده‌های مشترک
const provinces = [
  { id: '1', name: 'تهران' },
  { id: '2', name: 'اصفهان' },
  { id: '3', name: 'فارس' },
  { id: '4', name: 'خراسان رضوی' },
  { id: '5', name: 'آذربایجان شرقی' },
];

const citiesByProvince = {
  '1': [
    { id: '1-1', name: 'تهران' },
    { id: '1-2', name: 'شهریار' },
    { id: '1-3', name: 'ری' },
    { id: '1-4', name: 'اسلامشهر' },
  ],
  '2': [
    { id: '2-1', name: 'اصفهان' },
    { id: '2-2', name: 'کاشان' },
    { id: '2-3', name: 'نجف آباد' },
    { id: '2-4', name: 'خمینی شهر' },
  ],
  '3': [
    { id: '3-1', name: 'شیراز' },
    { id: '3-2', name: 'مرودشت' },
    { id: '3-3', name: 'کازرون' },
  ],
  '4': [
    { id: '4-1', name: 'مشهد' },
    { id: '4-2', name: 'نیشابور' },
    { id: '4-3', name: 'سبزوار' },
  ],
  '5': [
    { id: '5-1', name: 'تبریز' },
    { id: '5-2', name: 'مراغه' },
    { id: '5-3', name: 'مرند' },
  ],
}
;

const sellers = [
  { id: '1', name: 'برزین' },
  { id: '2', name: 'مجتمع صنعتی آریا' },
  { id: '3', name: 'کارخانجات پیشتاز' },
  { id: '4', name: 'صنایع مدرن پارس' },
];

// تابع برای گرفتن نام استان و شهر
const getLocationName = (provinceId, cityId) => {
  const province = provinces.find(p => p.id === provinceId);
  const city = citiesByProvince[provinceId]?.find(c => c.id === cityId);
  return {
    provinceName: province ? province.name : '-',
    cityName: city ? city.name : '-'
  };
};

// تابع برای گرفتن نام فروشنده
const getSellerName = (sellerId) => {
  const seller = sellers.find(s => s.id === sellerId);
  return seller ? seller.name : '-';
};

const ReportStep = ({ onBack, onComplete, previousData }) => {
  // stateهای فرم
  const [reportNumber, setReportNumber] = useState('');
  const [status, setStatus] = useState('');
  const [corrections, setCorrections] = useState('');
  const [receiveDate, setReceiveDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reports, setReports] = useState([]);
  const [lastReportNumber, setLastReportNumber] = useState(2000);
  const [showAddForm, setShowAddForm] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, report: null });

  // وضعیت‌های ممکن برای گزارش
  const statusOptions = [
    { value: 'approved', label: 'تأیید شده', color: 'text-green-600', bgColor: 'bg-green-100' },
    { value: 'rejected', label: 'رد شده', color: 'text-red-600', bgColor: 'bg-red-100' },
    { value: 'needs_correction', label: 'نیاز به اصلاحات', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { value: 'under_review', label: 'در حال بررسی', color: 'text-blue-600', bgColor: 'bg-blue-100' }
  ];

  // داده‌های نمونه برای نوتیفیکیشن‌ها (در حالت واقعی از props میاد)
  const sampleNotifications = [
    {
      id: 1,
      number: 1001,
      sendDate: new Date(),
      inspectionRange: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)],
      status: 'pending',
      inspector: previousData?.inspectorInfo?.inspectorName || 'مهندس محمدی',
      province: previousData?.projectInfo?.province || 'تهران'
    }
  ];

  // مقداردهی اولیه
  useEffect(() => {
    setReportNumber(lastReportNumber + 1);
    const today = new Date();
    setReceiveDate(today);
  }, []);

  // مدیریت ثبت نهایی
  const handleFinalSubmit = () => {
    const newReport = {
      id: Date.now(),
      number: reportNumber,
      status: status,
      corrections: corrections,
      receiveDate: receiveDate,
      inspector: previousData?.inspectorInfo?.inspectorName || '',
      project: previousData?.projectInfo?.projectName || '',
      createdAt: new Date()
    };

    setReports(prev => [newReport, ...prev]);
    setLastReportNumber(reportNumber);
    setShowConfirmation(false);
    setShowAddForm(false);
    
    // ریست فرم برای استفاده بعدی
    setReportNumber(lastReportNumber + 2);
    setStatus('');
    setCorrections('');
    setReceiveDate(new Date());
  };

  // مدیریت افزودن گزارش جدید
  const handleAddNewReport = () => {
    setShowAddForm(true);
    setReportNumber(lastReportNumber + 1);
    setStatus('');
    setCorrections('');
    setReceiveDate(new Date());
  };

  // مدیریت تغییر وضعیت
  const handleStatusChange = (reportId, newStatus) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      )
    );
  };

  // مدیریت حذف گزارش
  const handleDeleteReport = (reportId) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    setDeleteConfirmation({ show: false, report: null });
  };

  // نمایش پوپاپ تأیید حذف
  const showDeleteConfirmation = (report) => {
    setDeleteConfirmation({ show: true, report });
  };

  // فرمت تاریخ برای نمایش
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fa-IR');
  };

  // فرمت بازه تاریخ
  const formatDateRange = (range) => {
    if (!range || range.length < 2) return '-';
    return `${formatDate(range[0])} تا ${formatDate(range[1])}`;
  };

  // گرفتن label وضعیت
  const getStatusLabel = (statusValue) => {
    const statusObj = statusOptions.find(option => option.value === statusValue);
    return statusObj ? statusObj.label : '-';
  };

  // گرفتن کلاس وضعیت
  const getStatusClass = (statusValue) => {
    const statusObj = statusOptions.find(option => option.value === statusValue);
    return statusObj ? `${statusObj.color} ${statusObj.bgColor} px-2 py-1 rounded text-xs` : '';
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4">
      <div className="max-w-7xl mx-auto"> {/* افزایش max-width */}
        
        {/* هدر */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white text-center mb-4 shadow-lg">
          <div className="flex items-center justify-center mb-1">
            <FaFileAlt className="text-2xl ml-2" />
            <h1 className="text-xl font-bold">ثبت اطلاعات گزارش بازرس</h1>
          </div>
          <p className="text-blue-100 text-sm">مرحله سوم - ثبت نتایج و گزارش‌های بازرسی</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* سایدبار اطلاعات قبلی */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">
                اطلاعات درخواست
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">پروژه:</span>
                  <p className="text-gray-800">{previousData?.projectInfo?.projectName || '-'}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">بازرس:</span>
                  <p className="text-gray-800">{previousData?.inspectorInfo?.inspectorName || '-'}</p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">وندور:</span>
                  <p className="text-gray-800">
                    {getSellerName(previousData?.projectInfo?.seller) || '-'}
                  </p>
                </div>
                
                <div>
                  <span className="font-semibold text-gray-600">موقعیت:</span>
                  <p className="text-gray-800">
                    {getLocationName(previousData?.projectInfo?.province, previousData?.projectInfo?.city).provinceName} - {getLocationName(previousData?.projectInfo?.province, previousData?.projectInfo?.city).cityName}
                  </p>
                </div>

                <button
                  onClick={onBack}
                  className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 mt-4"
                >
                  بازگشت به مرحله قبل
                </button>
              </div>
            </div>
          </div>

          {/* محتوای اصلی */}
          <div className="lg:col-span-3">
            
            {/* بخش A: فرم اطلاعات گزارش */}
            {showAddForm && !showConfirmation && (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaFileAlt className="ml-2 text-blue-500" />
                  اطلاعات گزارش بازرس
                </h2>

                <div className="space-y-4">
                  
                  {/* شماره گزارش */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaHashtag className="ml-1 text-blue-500" />
                      شماره گزارش *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={reportNumber}
                        onChange={(e) => setReportNumber(parseInt(e.target.value) || '')}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                        placeholder="شماره گزارش"
                      />
                      <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded">
                        پیشنهاد سیستم: {lastReportNumber + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      سیستم به صورت خودکار آخرین شماره +۱ را پیشنهاد می‌دهد.
                    </p>
                  </div>

                  {/* وضعیت */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaCheck className="ml-1 text-blue-500" />
                      وضعیت *
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                    >
                      <option value="">انتخاب وضعیت</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* اصلاحات */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      اصلاحات
                    </label>
                    <textarea
                      value={corrections}
                      onChange={(e) => setCorrections(e.target.value)}
                      rows="3"
                      className="w-full px-3 h-11  text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white resize-none"
                      placeholder="در صورت نیاز به اصلاحات، توضیحات را وارد کنید..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      این فیلد در صورت انتخاب وضعیت "نیاز به اصلاحات" الزامی خواهد بود
                    </p>
                  </div>

                  {/* تاریخ دریافت گزارش */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="ml-1 text-blue-500" />
                      تاریخ دریافت گزارش *
                    </label>
                    <DatePicker
                      value={receiveDate}
                      onChange={setReceiveDate}
                      format="YYYY/MM/DD"
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                      placeholder="انتخاب تاریخ"
                    />
                  </div>

                  {/* دکمه‌های اقدام */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowConfirmation(true)}
                      disabled={!reportNumber || !status || !receiveDate || (status === 'needs_correction' && !corrections)}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-semibold flex items-center justify-center"
                    >
                      <FaCheck className="ml-2" />
                      ادامه و تأیید اطلاعات
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-semibold"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* بخش B: نمایش هر دو جدول */}
            {(sampleNotifications.length > 0 || reports.length > 0) && (
              <div className="space-y-6">
                
                {/* جدول نوتیفیکیشن‌ها */}
                {sampleNotifications.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                          <FaBell className="ml-2 text-blue-500" />
                          نوتیفیکیشن‌های ثبت شده
                        </h2>
                      </div>
                      
                      <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                        تعداد: {sampleNotifications.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-right font-semibold text-gray-700">شماره</th>
                            <th className="p-3 text-right font-semibold text-gray-700">تاریخ ارسال</th>
                            <th className="p-3 text-right font-semibold text-gray-700">بازه بازرسی</th>
                            <th className="p-3 text-right font-semibold text-gray-700">وضعیت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleNotifications.map((notification) => (
                            <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3 font-semibold">{notification.number}</td>
                              <td className="p-3">{formatDate(notification.sendDate)}</td>
                              <td className="p-3">{formatDateRange(notification.inspectionRange)}</td>
                              <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  notification.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  notification.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  notification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {notification.status === 'pending' ? 'در حال انجام' :
                                   notification.status === 'approved' ? 'تأیید شده' :
                                   notification.status === 'rejected' ? 'رد شده' : 'تکمیل شده'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* جدول گزارش‌های ثبت شده */}
                {reports.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                          <FaList className="ml-2 text-blue-500" />
                          گزارش‌های ثبت شده
                        </h2>
                        
                        {!showAddForm && (
                          <button
                            onClick={handleAddNewReport}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200 font-semibold text-sm flex items-center shadow-sm"
                          >
                            <FaPlus className="ml-1 text-xs" />
                            افزودن جدید
                          </button>
                        )}
                      </div>
                      
                      <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                        تعداد: {reports.length}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-right font-semibold text-gray-700">شماره</th>
                            <th className="p-3 text-right font-semibold text-gray-700">تاریخ دریافت</th>
                            <th className="p-3 text-right font-semibold text-gray-700">وضعیت</th>
                            <th className="p-3 text-right font-semibold text-gray-700">اصلاحات</th>
                            <th className="p-3 text-right font-semibold text-gray-700">عملیات</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report) => (
                            <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="p-3 font-semibold">{report.number}</td>
                              <td className="p-3">{formatDate(report.receiveDate)}</td>
                              <td className="p-3">
                                <select
                                  value={report.status}
                                  onChange={(e) => handleStatusChange(report.id, e.target.value)}
                                  className={`text-xs px-2 py-1 rounded border ${getStatusClass(report.status)} border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                >
                                  {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3 max-w-xs">
                                <div className="text-xs text-gray-600 truncate" title={report.corrections}>
                                  {report.corrections || '-'}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => showDeleteConfirmation(report)}
                                    className="text-red-500 hover:text-red-700 transition duration-200"
                                    title="حذف"
                                  >
                                    <FaTrash className="text-xs" />
                                  </button>
                                </div>
                          </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* دکمه تکمیل نهایی */}
                   
{/* دکمه تکمیل نهایی */}
<div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
  <button
    onClick={onComplete} // این now goes to daily report stage
    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg flex items-center"
  >
    <FaCheck className="ml-2" />
    ادامه به مرحله صورت وضعیت  {/* تغییر متن */}
  </button>
</div>
                  </div>
                )}
              </div>
            )}

            {/* نمایش وقتی هیچ گزارشی ثبت نشده */}
            {!showAddForm && reports.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <FaFileAlt className="text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">هنوز گزارشی ثبت نشده</h3>
                  <p className="text-sm mt-1">برای شروع، اولین گزارش بازرس را ثبت کنید</p>
                </div>
                <button
                  onClick={handleAddNewReport}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-200 font-semibold flex items-center mx-auto"
                >
                  <FaPlus className="ml-2" />
                  افزودن گزارش
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* پوپاپ تأیید نهایی */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto">
            {/* هدر مدال */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white text-center relative">
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute left-4 top-4 text-white hover:text-green-200 transition duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-2xl text-white" />
              </div>
              <h2 className="text-xl font-bold">تأیید نهایی گزارش</h2>
              <p className="text-green-100 text-sm mt-1">لطفاً اطلاعات گزارش را بررسی کنید</p>
            </div>

            {/* محتوای مدال */}
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-yellow-500 ml-2" />
                  <h3 className="font-semibold text-yellow-800">توجه!</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  آیا از صحت اطلاعات گزارش اطمینان دارید؟
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">خلاصه اطلاعات:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">شماره گزارش:</span>
                    <span className="font-semibold">{reportNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">وضعیت:</span>
                    <span className="font-semibold">{getStatusLabel(status)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">تاریخ دریافت:</span>
                    <span className="font-semibold">{formatDate(receiveDate)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">اصلاحات:</span>
                    <span className="font-semibold text-right text-xs max-w-xs">
                      {corrections || '---'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 font-semibold text-sm"
                >
                  تأیید و ثبت نهایی
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 font-semibold text-sm"
                >
                  ویرایش اطلاعات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* پوپاپ تأیید حذف */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaExclamationTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">تأیید حذف</h3>
            <p className="text-gray-600 text-xs mb-4">
              آیا از حذف گزارش با شماره <span className="font-bold">{deleteConfirmation.report?.number}</span> اطمینان دارید؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteReport(deleteConfirmation.report.id)}
                className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition duration-200 font-semibold text-xs"
              >
                بله، حذف شود
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, report: null })}
                className="flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200 font-semibold text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportStep;