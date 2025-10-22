// src/components/NotificationStep.jsx
import React, { useState, useEffect } from 'react';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePicker from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaCalendarAlt,
  FaHashtag,
  FaList,
  FaTrash,
  FaPlus,
  FaTimes,
  FaArrowLeft
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
};

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

const NotificationStep = ({ onBack, onComplete, previousData }) => {
  // stateهای فرم
  const [notificationNumber, setNotificationNumber] = useState('');
  const [sendDate, setSendDate] = useState(null);
  const [inspectionRange, setInspectionRange] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lastNotificationNumber, setLastNotificationNumber] = useState(1000);
  const [showAddForm, setShowAddForm] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, notification: null });

  // وضعیت‌های ممکن
  const statusOptions = [
    { value: 'pending', label: 'در حال انجام', color: 'text-yellow-600' },
    { value: 'approved', label: 'تأیید شده', color: 'text-green-600' },
    { value: 'rejected', label: 'رد شده', color: 'text-red-600' },
    { value: 'completed', label: 'تکمیل شده', color: 'text-blue-600' }
  ];

  // مقداردهی اولیه
  useEffect(() => {
    setNotificationNumber(lastNotificationNumber + 1);
    const today = new Date();
    setSendDate(today);
  }, []);

  // مدیریت ثبت نهایی
  const handleFinalSubmit = () => {
    const newNotification = {
      id: Date.now(),
      number: notificationNumber,
      sendDate: sendDate,
      inspectionRange: inspectionRange,
      status: 'pending',
      inspector: previousData?.inspectorInfo?.inspectorName || '',
      province: previousData?.projectInfo?.province || '',
      description: '',
      inspectionStartDate: inspectionRange[0] || null,
      createdAt: new Date()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setLastNotificationNumber(notificationNumber);
    setShowConfirmation(false);
    setShowAddForm(false);
    
    // ریست فرم برای استفاده بعدی
    setNotificationNumber(lastNotificationNumber + 2);
    setSendDate(new Date());
    setInspectionRange([]);
  };

  // مدیریت افزودن نوتیفیکیشن جدید
  const handleAddNewNotification = () => {
    setShowAddForm(true);
    setNotificationNumber(lastNotificationNumber + 1);
    setSendDate(new Date());
    setInspectionRange([]);
  };

  // مدیریت تغییر وضعیت
  const handleStatusChange = (notificationId, newStatus) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: newStatus }
          : notif
      )
    );
  };

  // مدیریت حذف نوتیفیکیشن
  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setDeleteConfirmation({ show: false, notification: null });
  };

  // نمایش پوپاپ تأیید حذف
  const showDeleteConfirmation = (notification) => {
    setDeleteConfirmation({ show: true, notification });
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

  // مدیریت تکمیل مرحله
  const handleCompleteStep = () => {
    const stepData = {
      notifications: notifications,
      inspectionRange: inspectionRange.length === 2 ? inspectionRange : (notifications[0]?.inspectionRange || [])
    };
    console.log('ارسال داده‌های نوتیفیکیشن:', stepData);
    onComplete(stepData);
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* هدر */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white text-center mb-4 shadow-lg">
          <div className="flex items-center justify-center mb-1">
            <FaHashtag className="text-2xl ml-2" />
            <h1 className="text-xl font-bold">ثبت اطلاعات نوتیفیکیشن</h1>
          </div>
          <p className="text-blue-100 text-sm">مرحله دوم - مدیریت اطلاع‌رسانی و برنامه‌ریزی بازرسی</p>
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
                  className="w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 mt-4 flex items-center justify-center"
                >
                  <FaArrowLeft className="ml-2" />
                  بازگشت به مرحله قبل
                </button>
              </div>
            </div>
          </div>

          {/* محتوای اصلی */}
          <div className="lg:col-span-3">
            
            {/* بخش A: فرم اطلاعات نوتیفیکیشن */}
            {showAddForm && !showConfirmation && (
              <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FaHashtag className="ml-2 text-blue-500" />
                  اطلاعات نوتیفیکیشن
                </h2>

                <div className="space-y-4">
                  
                  {/* شماره ثبت نوتیفیکیشن */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaHashtag className="ml-1 text-blue-500" />
                      شماره ثبت نوتیفیکیشن *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={notificationNumber}
                        onChange={(e) => setNotificationNumber(parseInt(e.target.value) || '')}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                        placeholder="شماره ثبت"
                      />
                      <span className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded">
                        پیشنهاد سیستم: {lastNotificationNumber + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      سیستم به صورت خودکار آخرین شماره +۱ را پیشنهاد می‌دهد. در صورت نیاز می‌توانید تغییر دهید.
                    </p>
                  </div>

                  {/* تاریخ ارسال نوتیفیکیشن */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="ml-1 text-blue-500" />
                      تاریخ ارسال نوتیفیکیشن *
                    </label>
                    <DatePicker
                      value={sendDate}
                      onChange={setSendDate}
                      format="YYYY/MM/DD"
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                      placeholder="انتخاب تاریخ"
                    />
                  </div>

                  {/* بازه انجام بازرسی */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="ml-1 text-blue-500" />
                      بازه انجام بازرسی *
                    </label>
                    <DatePicker
                      dateSeparator=" تا "
                      value={inspectionRange}
                      onChange={setInspectionRange}
                      fixMainPosition
                      fixRelativePosition
                      range
                      rangeHover
                      className="custom-calendar"
                      plugins={[<Toolbar position="bottom" />]}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="left"
                      inputClass="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                    ></DatePicker>
                    {/* نمایش بازه انتخاب شده دقیقاً زیر فیلد */}
                    {inspectionRange.length === 2 && (
                      <p className="text-xs text-green-600 mt-2 mr-1">
                        بازه انتخاب شده: {formatDateRange(inspectionRange)}
                      </p>
                    )}
                  </div>

                  {/* دکمه‌های اقدام */}
                  <div className="flex gap-3 pt-3">
                    <button
                      onClick={() => setShowConfirmation(true)}
                      disabled={!notificationNumber || !sendDate || !inspectionRange || inspectionRange.length < 2}
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

            {/* لیست نوتیفیکیشن‌های ثبت شده */}
            {notifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                      <FaList className="ml-2 text-blue-500" />
                      نوتیفیکیشن‌های ثبت شده
                    </h2>
                    
                    {!showAddForm && (
                      <button
                        onClick={handleAddNewNotification}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition duration-200 font-semibold text-sm flex items-center shadow-sm"
                      >
                        <FaPlus className="ml-1 text-xs" />
                        افزودن جدید
                      </button>
                    )}
                  </div>
                  
                  <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                    تعداد: {notifications.length}
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
                        <th className="p-3 text-right font-semibold text-gray-700">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
                        <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-semibold">{notification.number}</td>
                          <td className="p-3">{formatDate(notification.sendDate)}</td>
                          <td className="p-3">{formatDateRange(notification.inspectionRange)}</td>
                          <td className="p-3">
                            <select
                              value={notification.status}
                              onChange={(e) => handleStatusChange(notification.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded border ${
                                statusOptions.find(s => s.value === notification.status)?.color || 'text-gray-600'
                              } border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => showDeleteConfirmation(notification)}
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

                {/* دکمه ادامه به مرحله بعد */}
                <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
                  <button
                    onClick={handleCompleteStep}
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold text-lg flex items-center"
                  >
                    <FaCheck className="ml-2" />
                    ادامه به مرحله بعد
                  </button>
                </div>
              </div>
            )}

            {/* نمایش وقتی هیچ نوتیفیکیشنی ثبت نشده */}
            {!showAddForm && notifications.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-gray-500 mb-4">
                  <FaList className="text-4xl mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">هنوز نوتیفیکیشنی ثبت نشده</h3>
                  <p className="text-sm mt-1">برای شروع، اولین نوتیفیکیشن را ثبت کنید</p>
                </div>
                <button
                  onClick={handleAddNewNotification}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition duration-200 font-semibold flex items-center mx-auto"
                >
                  <FaPlus className="ml-2" />
                  افزودن نوتیفیکیشن
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
              <h2 className="text-xl font-bold">تأیید نهایی</h2>
              <p className="text-green-100 text-sm mt-1">لطفاً اطلاعات را بررسی کنید</p>
            </div>

            {/* محتوای مدال */}
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <FaExclamationTriangle className="text-yellow-500 ml-2" />
                  <h3 className="font-semibold text-yellow-800">توجه!</h3>
                </div>
                <p className="text-yellow-700 text-sm">
                  آیا از صحت اطلاعات نوتیفیکیشن اطمینان دارید؟
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-sm">خلاصه اطلاعات:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">شماره ثبت:</span>
                    <span className="font-semibold">{notificationNumber}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-gray-600">تاریخ ارسال:</span>
                    <span className="font-semibold">{formatDate(sendDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">بازه بازرسی:</span>
                    <span className="font-semibold text-left">{formatDateRange(inspectionRange)}</span>
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
              آیا از حذف نوتیفیکیشن با شماره <span className="font-bold">{deleteConfirmation.notification?.number}</span> اطمینان دارید؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteNotification(deleteConfirmation.notification.id)}
                className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition duration-200 font-semibold text-xs"
              >
                بله، حذف شود
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, notification: null })}
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

export default NotificationStep;