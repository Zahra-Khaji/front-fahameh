// src/components/notification/FinalConfirmationContent.jsx
import React from 'react';
import { FaClipboardList, FaUserTie, FaHashtag, FaCalendarAlt } from 'react-icons/fa';

// Hooks
import { useProvinces, useCities } from '../../hooks/useProvinces';
import { useVendors } from '../../hooks/useVendors';

// Utils
import { formatPersianDate, formatMultipleDates } from '../../utils/helpers';

const FinalConfirmationContent = ({ previousData, notifications }) => {
  // استفاده از هوک‌های مشابه فرم
  const { data: provinces } = useProvinces();
  const { data: cities } = useCities(previousData?.projectInfo?.province);
  const { data: vendors } = useVendors();

  const getLocationName = (provinceId, cityId) => {
    const province = provinces?.find(p => p.id === provinceId);
    const city = cities?.find(c => c.id === cityId);
    return {
      provinceName: province ? province.name : provinceId || '-',
      cityName: city ? city.name : cityId || '-'
    };
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors?.find(s => s.id === vendorId);
    return vendor ? vendor.name : vendorId || '-';
  };

  const getStatusLabel = (status) => {
    return status === 'pending' ? 'در حال انجام' :
           status === 'approved' ? 'تأیید شده' :
           status === 'rejected' ? 'رد شده' :
           'تکمیل شده';
  };

  const projectName = previousData?.projectInfo?.projectName || '-';
  const province = previousData?.projectInfo?.province || '';
  const city = previousData?.projectInfo?.city || '';
  const vendor = previousData?.projectInfo?.vendor || '';
  const defaultInspector = previousData?.inspectorInfo?.inspectorName || '';
  const defaultFee = previousData?.inspectorInfo?.fee || '';

  const location = getLocationName(province, city);

  return (
    <div
    
    className="space-y-4 mb-4 ">
      
      {/* سطر اول: اطلاعات پروژه و اطلاعات بازرسی */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Information */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <h3 className="text-md font-bold text-blue-800 mb-3 flex items-center">
            <FaClipboardList className="ml-2 text-sm" />
            اطلاعات پروژه
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">نام پروژه:</span>
              <span className="font-semibold text-blue-800">{projectName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">موقعیت:</span>
              <span className="font-semibold">
                {location.provinceName} - {location.cityName}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">وندور:</span>
              <span className="font-semibold">{getVendorName(vendor)}</span>
            </div>
          </div>
        </div>

        {/* Inspection Information */}
        <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <h3 className="text-md font-bold text-indigo-800 mb-3 flex items-center">
            <FaUserTie className="ml-2 text-sm" />
            اطلاعات بازرسی
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">بازرس اصلی:</span>
              <span className="font-semibold text-indigo-800">{defaultInspector}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">موقعیت بازرس:</span>
              <span className="font-semibold">{previousData?.inspectorInfo?.inspectorLocation}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">شماره تماس:</span>
              <span className="font-semibold">{previousData?.inspectorInfo?.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-600 font-medium min-w-[80px]">دستمزد پایه:</span>
              <span className="font-semibold">{defaultFee}</span>
            </div>
          </div>
        </div>
      </div>

      {/* سطر دوم و سوم: اطلاعات نوتیفیکیشن‌ها */}
      {notifications && notifications.length > 0 && (
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <h3 className="text-md font-bold text-green-800 mb-3 flex items-center">
            <FaHashtag className="ml-2 text-sm" />
            اطلاعات نوتیفیکیشن‌ها ({notifications.length} مورد)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notifications.map((notification, index) => (
              <div key={notification.id} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-green-100">
                  <span className="text-xs font-semibold text-green-700">
                    نوتیفیکیشن #{notification.number}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    notification.status === 'approved' ? 'bg-green-100 text-green-800' :
                    notification.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    notification.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getStatusLabel(notification.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium min-w-[80px]">تاریخ ارسال:</span>
                    <span className="font-semibold">{formatPersianDate(notification.sendDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-medium min-w-[80px]">تعداد روز:</span>
                    <span className="font-semibold">{notification.inspectionDays} روز</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 font-medium min-w-[80px] mt-0.5">تاریخ‌های بازرسی:</span>
                    <span className="font-semibold text-right text-xs leading-5">
                      {formatMultipleDates(notification.inspectionRange)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* برنامه بازرسی خلاصه */}
      {notifications && notifications.length > 0 && (
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <h3 className="text-md font-bold text-purple-800 mb-3 flex items-center">
            <FaCalendarAlt className="ml-2 text-sm" />
            برنامه بازرسی - خلاصه
          </h3>
          <div className="space-y-2 text-xs">
            {notifications.map((notification, index) => (
              <div key={notification.id} className="flex items-center gap-4 bg-white rounded px-3 py-2">
                <span className="text-gray-600 font-medium min-w-[120px]">
                  نوتیفیکیشن #{notification.number}:
                </span>
                <span className="font-semibold text-purple-700">
                  {formatMultipleDates(notification.inspectionRange)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalConfirmationContent;