// src/components/ui/NotificationInfoModal/NotificationInfoModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaHashtag, 
  FaCheckCircle, 
  FaUserTie, 
  FaComment, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaClock,
  FaUser,
  FaFolder,
  FaPlusCircle,
  FaCopy,
  FaTrash,
  FaMoneyBillWave,
  FaSync,
  FaExclamationTriangle,
  FaEdit
} from 'react-icons/fa';
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useNotificationInfo, useUpdateNotification } from '../../../hooks/useNotificationNumber';
import { toast } from 'react-hot-toast';

const NotificationInfoModal = ({ isOpen, onClose, rfiNumber }) => {
  // استفاده از هوک‌های یکپارچه
  const { data: notificationData, isLoading, error } = useNotificationInfo(rfiNumber);
  const { mutate: updateNotification, isLoading: isUpdating } = useUpdateNotification();

  // تابع تبدیل تاریخ به شمسی
  const convertToPersianDate = (dateString) => {
    if (!dateString) {
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa
      });
    }
    
    try {
      const date = new Date(dateString);
      return new DateObject({
        date: date,
        calendar: persian,
        locale: persian_fa
      });
    } catch (err) {
      console.error('Error converting date:', err);
      const today = new Date();
      return new DateObject({
        date: today,
        calendar: persian,
        locale: persian_fa
      });
    }
  };

  // حالت‌های جدول نوتیفیکیشن
  const [notificationRows, setNotificationRows] = useState([]);
  const [rfiDatesRows, setRfiDatesRows] = useState([]);

  // حالت‌های ممکن
  const statusOptions = [
    { value: 'انجام شده', label: 'انجام شده' },
    { value: 'در حال انجام', label: 'در حال انجام' }
  ];

  // نوع بازرس
  const inspectorTypeOptions = [
    { value: 'فریلنسر', label: 'فریلنسر' },
    { value: 'بازرس داخلی', label: 'بازرس داخلی' }
  ];

  // وضعیت تأیید
  const approvalOptions = [
    { value: '1', label: 'تائید شده' },
    { value: '0', label: 'تائید نشده' }
  ];

  // ریست فرم وقتی مدال باز می‌شود
  useEffect(() => {
    if (isOpen) {
      if (notificationData) {
        const { timeTable, rfiDates } = notificationData;
        
        // پر کردن جدول نوتیفیکیشن
        if (timeTable) {
          setNotificationRows([{
            id: 1,
            notificationNumber: timeTable.RFI_Numbering || rfiNumber || '',
            status: timeTable.RFI_Status === 'Done' ? 'انجام شده' : 'در حال انجام',
            inspectorType: timeTable.Inspector_Type || 'فریلنسر',
            description: timeTable.Remark || '',
            receivedDate: convertToPersianDate(timeTable.RFI_Recived_Date),
            location: timeTable.InspectionLocation || '',
            inspectionDate: convertToPersianDate(timeTable.InspectionDate),
            vendorName: timeTable.VendorName || '',
            duration: timeTable.Inspection_Duration || '',
            inspectorName: timeTable.Inspector_Name || '',
            remark: timeTable.Remark || '',
            folderNumber: timeTable.FolderNo || '',
            material: timeTable.Material || '',
            goodsDescription: timeTable.Goods_Description || '',
            qty3rdPartyInspector: timeTable.QTY_3rdpartinspector || '0',
            approvedDuration: timeTable.approved_Duration || '0',
            projectType: timeTable.Over_Domestic || '',
            rfiStatus: timeTable.RFI_Status || ''
          }]);
        } else {
          // اگر داده‌ای نبود، ردیف خالی ایجاد کن
          setNotificationRows([{
            id: 1,
            notificationNumber: rfiNumber || '',
            status: 'در حال انجام',
            inspectorType: 'فریلنسر',
            description: '',
            receivedDate: convertToPersianDate(new Date()),
            location: '',
            inspectionDate: convertToPersianDate(new Date()),
            vendorName: '',
            duration: '',
            inspectorName: '',
            remark: '',
            folderNumber: '',
            material: '',
            goodsDescription: '',
            qty3rdPartyInspector: '0',
            approvedDuration: '0',
            projectType: '',
            rfiStatus: ''
          }]);
        }

        // پر کردن جدول صورت وضعیت بازرس
        if (rfiDates && rfiDates.length > 0) {
          setRfiDatesRows(
            rfiDates.map((item, index) => ({
              id: index + 1,
              inspectionDate: convertToPersianDate(item.RFI_Date),
              approvalStatus: item.ApproveManday || item.ApproveManday1 || '0',
              inspectorName: item.Inspector_Name || '',
              fee: item.InspectorPrice ? `${item.InspectorPrice.toLocaleString('fa-IR')}` : ''
            }))
          );
        } else {
          setRfiDatesRows([{
            id: 1,
            inspectionDate: convertToPersianDate(new Date()),
            approvalStatus: '0',
            inspectorName: '',
            fee: ''
          }]);
        }
      } else {
        // اگر notificationData null بود، ردیف‌های پیش‌فرض ایجاد کن
        setNotificationRows([{
          id: 1,
          notificationNumber: rfiNumber || '',
          status: 'در حال انجام',
          inspectorType: 'فریلنسر',
          description: '',
          receivedDate: convertToPersianDate(new Date()),
          location: '',
          inspectionDate: convertToPersianDate(new Date()),
          vendorName: '',
          duration: '',
          inspectorName: '',
          remark: '',
          folderNumber: '',
          material: '',
          goodsDescription: '',
          qty3rdPartyInspector: '0',
          approvedDuration: '0',
          projectType: '',
          rfiStatus: ''
        }]);
        
        setRfiDatesRows([{
          id: 1,
          inspectionDate: convertToPersianDate(new Date()),
          approvalStatus: '0',
          inspectorName: '',
          fee: ''
        }]);
      }
    }
  }, [isOpen, notificationData, rfiNumber]);

  // ========== مدیریت ردیف‌های جدول نوتیفیکیشن ==========
  const handleAddNotificationRow = () => {
    const newId = notificationRows.length > 0 ? Math.max(...notificationRows.map(r => r.id)) + 1 : 1;
    setNotificationRows([
      ...notificationRows,
      {
        id: newId,
        notificationNumber: '',
        status: 'در حال انجام',
        inspectorType: 'فریلنسر',
        description: '',
        receivedDate: convertToPersianDate(new Date()),
        location: '',
        inspectionDate: convertToPersianDate(new Date()),
        vendorName: notificationRows[0]?.vendorName || '',
        duration: '',
        inspectorName: '',
        remark: '',
        folderNumber: '',
        material: '',
        goodsDescription: '',
        qty3rdPartyInspector: '0',
        approvedDuration: '0',
        projectType: '',
        rfiStatus: ''
      }
    ]);
  };

  const handleDeleteNotificationRow = (id) => {
    if (notificationRows.length > 1) {
      setNotificationRows(notificationRows.filter(row => row.id !== id));
    }
  };

  const handleCopyNotificationRow = (id) => {
    const rowToCopy = notificationRows.find(row => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...notificationRows.map(r => r.id)) + 1;
      setNotificationRows([
        ...notificationRows,
        {
          ...rowToCopy,
          id: newId,
          notificationNumber: ''
        }
      ]);
    }
  };

  const handleNotificationRowChange = (id, field, value) => {
    setNotificationRows(notificationRows.map(row => 
      row.id === id 
        ? { ...row, [field]: value }
        : row
    ));
  };

  // ========== مدیریت ردیف‌های جدول صورت وضعیت بازرس ==========
  const handleAddRfiDatesRow = () => {
    const newId = rfiDatesRows.length > 0 ? Math.max(...rfiDatesRows.map(r => r.id)) + 1 : 1;
    setRfiDatesRows([
      ...rfiDatesRows,
      {
        id: newId,
        inspectionDate: convertToPersianDate(new Date()),
        approvalStatus: '0',
        inspectorName: '',
        fee: ''
      }
    ]);
  };

  const handleDeleteRfiDatesRow = (id) => {
    if (rfiDatesRows.length > 1) {
      setRfiDatesRows(rfiDatesRows.filter(row => row.id !== id));
    }
  };

  const handleCopyRfiDatesRow = (id) => {
    const rowToCopy = rfiDatesRows.find(row => row.id === id);
    if (rowToCopy) {
      const newId = Math.max(...rfiDatesRows.map(r => r.id)) + 1;
      setRfiDatesRows([
        ...rfiDatesRows,
        {
          ...rowToCopy,
          id: newId
        }
      ]);
    }
  };

  const handleRfiDatesRowChange = (id, field, value) => {
    setRfiDatesRows(rfiDatesRows.map(row => 
      row.id === id 
        ? { ...row, [field]: value }
        : row
    ));
  };

  // تابع بررسی اعتبار فرم
  const validateForm = () => {
    if (notificationRows.length === 0) {
      toast.error('❌ حداقل یک ردیف در جدول نوتیفیکیشن باید وجود داشته باشد');
      return false;
    }

    // بررسی ردیف‌های نوتیفیکیشن
    for (const row of notificationRows) {
      if (!row.notificationNumber.trim()) {
        toast.error('❌ شماره نوتیفیکیشن الزامی است');
        return false;
      }
      if (!row.vendorName.trim()) {
        toast.error('❌ نام وندور الزامی است');
        return false;
      }
    }

    // بررسی ردیف‌های صورت وضعیت
    for (const row of rfiDatesRows) {
      if (!row.inspectorName.trim() && row.fee.trim()) {
        toast.error('❌ برای ردیف‌های دارای دستمزد، نام بازرس الزامی است');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // فیلتر ردیف‌های خالی
    const validNotificationRows = notificationRows.filter(row => 
      row.notificationNumber.trim() !== '' || 
      row.vendorName.trim() !== ''
    );
    
    const validRfiDatesRows = rfiDatesRows.filter(row => 
      row.inspectorName.trim() !== '' || 
      row.fee.trim() !== ''
    );

    if (validNotificationRows.length === 0) {
      toast.error('❌ هیچ داده‌ای برای ذخیره در جدول نوتیفیکیشن وجود ندارد');
      return;
    }

    updateNotification(
      {
        timeTableRows: validNotificationRows,
        rfiDatesRows: validRfiDatesRows
      },
      {
        onSuccess: () => {
          toast.success('✅ اطلاعات با موفقیت ذخیره شد');
          onClose();
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || error.message || 'خطای ناشناخته';
          toast.error(`❌ خطا در ذخیره اطلاعات: ${errorMessage}`);
        }
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FaHashtag className="text-gray-700 text-xl" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  اطلاعات نوتیفیکیشن شماره {rfiNumber}
                </h3>
                {isLoading && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <FaSync className="animate-spin" />
                    در حال دریافت اطلاعات...
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
            title="بستن"
            disabled={isUpdating}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* نمایش خطا */}
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <FaExclamationTriangle />
              خطا در دریافت اطلاعات: {error.message}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* بخش اول: اطلاعات نوتیفیکیشن */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>
               
                <h4 className="text-base font-bold text-gray-800">اطلاعات نوتیفیکیشن</h4>
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  {notificationRows.length} مورد
                </span>
              </div>
              
              {/* <button
                type="button"
                onClick={handleAddNotificationRow}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-gray-800 border border-blue-200 text-sm font-semibold rounded-lg transition duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isUpdating}
              >
                <FaPlusCircle className="text-base text-gray-700" />
                افزودن سطر جدید
              </button> */}
            </div>

            {/* Desktop Table - نوتیفیکیشن */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm mb-4">
              <table className="w-full text-xs">
              <thead>
  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
    <th className="p-3 text-right font-bold text-white text-xs min-w-40">شماره نوتیفیکشن</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-24">وضعیت</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-28">بازرس</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-48">توضیحات</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-28">تاریخ دریافت</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-24">لوکیشن</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-28">تاریخ بازرسی</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-32">نام وندور</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-20">مدت</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-28">نام بازرس</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-32">Remark</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-24">شماره فولدر</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-24">عملیات</th>
  </tr>
</thead>
                <tbody>
                  {notificationRows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      {/* شماره نوتیفیکشن */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.notificationNumber}
                          onChange={(e) => handleNotificationRowChange(row.id, 'notificationNumber', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شماره نوتیفیکشن"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* وضعیت */}
                      <td className="p-3">
                        <select
                          value={row.status}
                          onChange={(e) => handleNotificationRowChange(row.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* نوع بازرس */}
                      <td className="p-3">
                        <select
                          value={row.inspectorType}
                          onChange={(e) => handleNotificationRowChange(row.id, 'inspectorType', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        >
                          {inspectorTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* توضیحات */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => handleNotificationRowChange(row.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="توضیحات"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* تاریخ دریافت */}
                      <td className="p-3">
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) => handleNotificationRowChange(row.id, 'receivedDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* لوکیشن */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) => handleNotificationRowChange(row.id, 'location', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شهر"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* تاریخ بازرسی */}
                      <td className="p-3">
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) => handleNotificationRowChange(row.id, 'inspectionDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* نام وندور */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) => handleNotificationRowChange(row.id, 'vendorName', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="نام وندور"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* مدت */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.duration}
                          onChange={(e) => handleNotificationRowChange(row.id, 'duration', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="مدت"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* نام بازرس */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.inspectorName}
                          onChange={(e) => handleNotificationRowChange(row.id, 'inspectorName', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="نام بازرس"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* Remark */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.remark}
                          onChange={(e) => handleNotificationRowChange(row.id, 'remark', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="توضیحات تکمیلی"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* شماره فولدر */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.folderNumber}
                          onChange={(e) => handleNotificationRowChange(row.id, 'folderNumber', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="شماره فولدر"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* عملیات */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyNotificationRow(row.id)}
                            className="text-gray-700 hover:text-gray-900 p-1.5 rounded hover:bg-blue-100 transition duration-200"
                            title="کپی کردن سطر"
                            disabled={isLoading || isUpdating}
                          >
                            <FaCopy className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNotificationRow(row.id)}
                            className="text-gray-700 hover:text-gray-900 p-1.5 rounded hover:bg-blue-100 transition duration-200"
                            title="حذف سطر"
                            disabled={notificationRows.length === 1 || isLoading || isUpdating}
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

            {/* Mobile View - نوتیفیکیشن */}
            <div className="md:hidden space-y-4 mb-6">
              {notificationRows.map((row, index) => (
                <div key={row.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-gray-700" />
                      <span className="font-semibold">سطر #{index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyNotificationRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="کپی"
                        disabled={isLoading || isUpdating}
                      >
                        <FaCopy className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNotificationRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="حذف"
                        disabled={notificationRows.length === 1 || isLoading || isUpdating}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">شماره نوتیفیکشن</span>
                        <input
                          type="text"
                          value={row.notificationNumber}
                          onChange={(e) => handleNotificationRowChange(row.id, 'notificationNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شماره"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">وضعیت</span>
                        <select
                          value={row.status}
                          onChange={(e) => handleNotificationRowChange(row.id, 'status', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">نوع بازرس</span>
                        <select
                          value={row.inspectorType}
                          onChange={(e) => handleNotificationRowChange(row.id, 'inspectorType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        >
                          {inspectorTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">نام وندور</span>
                        <input
                          type="text"
                          value={row.vendorName}
                          onChange={(e) => handleNotificationRowChange(row.id, 'vendorName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام وندور"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">توضیحات</span>
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleNotificationRowChange(row.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="توضیحات"
                        disabled={isLoading || isUpdating}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">تاریخ دریافت</span>
                        <DatePicker
                          value={row.receivedDate}
                          onChange={(date) => handleNotificationRowChange(row.id, 'receivedDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تاریخ بازرسی</span>
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) => handleNotificationRowChange(row.id, 'inspectionDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">لوکیشن</span>
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) => handleNotificationRowChange(row.id, 'location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="شهر"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">مدت</span>
                        <input
                          type="text"
                          value={row.duration}
                          onChange={(e) => handleNotificationRowChange(row.id, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="مدت"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">نام بازرس</span>
                        <input
                          type="text"
                          value={row.inspectorName}
                          onChange={(e) => handleNotificationRowChange(row.id, 'inspectorName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="نام بازرس"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">شماره فولدر</span>
                        <input
                          type="text"
                          value={row.folderNumber}
                          onChange={(e) => handleNotificationRowChange(row.id, 'folderNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          placeholder="123"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">Remark</span>
                      <input
                        type="text"
                        value={row.remark}
                        onChange={(e) => handleNotificationRowChange(row.id, 'remark', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="توضیحات تکمیلی"
                        disabled={isLoading || isUpdating}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {/* دکمه اضافه کردن برای موبایل */}
              <button
  type="button"
  onClick={handleAddNotificationRow}
  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isLoading || isUpdating}
>
  <FaPlusCircle className="text-base" />
  افزودن سطر جدید
</button>
            </div>
          </div>

          {/* بخش دوم: اطلاعات صورت وضعیت بازرس */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
              <div className="w-3 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-r"></div>

                <h4 className="text-base font-bold text-gray-800">اطلاعات تاریخ های بازرسی</h4>
                <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
                  {rfiDatesRows.length} مورد
                </span>
              </div>
              
              <button
  type="button"
  onClick={handleAddRfiDatesRow}
  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isLoading || isUpdating}
>
  <FaPlusCircle className="text-base" />
  افزودن سطر جدید
</button>
            </div>

            {/* Desktop Table - صورت وضعیت بازرس */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="w-full text-xs">
              <thead>
  <tr className="bg-gradient-to-r from-blue-700 to-blue-600">
    <th className="p-3 text-right font-bold text-white text-xs min-w-32">شروع تاریخ بازرسی</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-40">بازرس اول</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-36">دستمزد</th>
    <th className="p-3 text-right font-bold text-white text-xs min-w-20">عملیات</th>
  </tr>
</thead>
                <tbody>
                  {rfiDatesRows.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`border-b border-gray-200 transition duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      {/* تاریخ بازرسی */}
                      <td className="p-3">
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) => handleRfiDatesRowChange(row.id, 'inspectionDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* تائید/عدم تائید */}
                      {/* <td className="p-3">
                        <select
                          value={row.approvalStatus}
                          onChange={(e) => handleRfiDatesRowChange(row.id, 'approvalStatus', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          disabled={isLoading || isUpdating}
                        >
                          {approvalOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td> */}

                      {/* بازرس اول */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.inspectorName}
                          onChange={(e) => handleRfiDatesRowChange(row.id, 'inspectorName', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                          placeholder="نام بازرس"
                          disabled={isLoading || isUpdating}
                        />
                      </td>

                      {/* دستمزد */}
                      <td className="p-3">
                        <div className="relative">
                          <input
                            type="text"
                            value={row.fee}
                            onChange={(e) => handleRfiDatesRowChange(row.id, 'fee', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-transparent pl-8"
                            placeholder="مبلغ"
                            disabled={isLoading || isUpdating}
                          />
                          <FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                        </div>
                      </td>

                      {/* عملیات */}
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyRfiDatesRow(row.id)}
                            className="text-gray-700 hover:text-gray-900 p-1.5 rounded hover:bg-blue-100 transition duration-200"
                            title="کپی کردن سطر"
                            disabled={isLoading || isUpdating}
                          >
                            <FaCopy className="text-xs" />
                          </button>
                          {/* <button
                            type="button"
                            onClick={() => handleDeleteRfiDatesRow(row.id)}
                            className="text-gray-700 hover:text-gray-900 p-1.5 rounded hover:bg-blue-100 transition duration-200"
                            title="حذف سطر"
                            disabled={rfiDatesRows.length === 1 || isLoading || isUpdating}
                          >
                            <FaTrash className="text-xs" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - صورت وضعیت بازرس */}
            <div className="md:hidden space-y-4">
              {rfiDatesRows.map((row, index) => (
                <div key={row.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-700" />
                      <span className="font-semibold">سطر #{index + 1}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyRfiDatesRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="کپی"
                        disabled={isLoading || isUpdating}
                      >
                        <FaCopy className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRfiDatesRow(row.id)}
                        className="text-gray-700 hover:text-gray-900 p-1"
                        title="حذف"
                        disabled={rfiDatesRows.length === 1 || isLoading || isUpdating}
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-gray-600 block mb-1">تاریخ بازرسی</span>
                        <DatePicker
                          value={row.inspectionDate}
                          onChange={(date) => handleRfiDatesRowChange(row.id, 'inspectionDate', date)}
                          calendar={persian}
                          locale={persian_fa}
                          format="YYYY/MM/DD"
                          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        />
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">تائید/عدم تائید</span>
                        <select
                          value={row.approvalStatus}
                          onChange={(e) => handleRfiDatesRowChange(row.id, 'approvalStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                          disabled={isLoading || isUpdating}
                        >
                          {approvalOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">بازرس اول</span>
                      <input
                        type="text"
                        value={row.inspectorName}
                        onChange={(e) => handleRfiDatesRowChange(row.id, 'inspectorName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        placeholder="نام بازرس"
                        disabled={isLoading || isUpdating}
                      />
                    </div>

                    <div>
                      <span className="text-gray-600 block mb-1">دستمزد</span>
                      <div className="relative">
                        <input
                          type="text"
                          value={row.fee}
                          onChange={(e) => handleRfiDatesRowChange(row.id, 'fee', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs pl-8"
                          placeholder="مبلغ"
                          disabled={isLoading || isUpdating}
                        />
                        <FaMoneyBillWave className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* دکمه اضافه کردن برای موبایل */}
              <button
  type="button"
  onClick={handleAddRfiDatesRow}
  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={isLoading || isUpdating}
>
  <FaPlusCircle className="text-base" />
  افزودن سطر جدید
</button>
            </div>
          </div>

          {/* دکمه‌های ثبت و انصراف */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
  type="submit"
  disabled={isLoading || isUpdating}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isUpdating ? (
    <>
      <FaSync className="animate-spin text-lg" />
      در حال ذخیره...
    </>
  ) : (
    <>
      <FaCheckCircle className="text-lg" />
      ذخیره اطلاعات
    </>
  )}
</button>
            
<button
  type="button"
  onClick={handleCancel}
  disabled={isUpdating}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
>
  <FaTimes className="text-lg" />
  انصراف
</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationInfoModal;