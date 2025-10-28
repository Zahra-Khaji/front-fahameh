// src/components/daily/FinalConfirmationContent.jsx
import React from 'react';
import { FaClipboardList, FaUserTie, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';

// Utils
import { provinces, citiesByProvince, sellers } from '../../data/staticData';
import { formatPersianDate } from '../../utils/helpers';

const FinalConfirmationContent = ({ previousData, summary, dailyReports }) => {
  const getLocationName = (provinceId, cityId) => {
    const province = provinces.find(p => p.id === provinceId);
    const city = citiesByProvince[provinceId]?.find(c => c.id === cityId);
    return {
      provinceName: province ? province.name : '-',
      cityName: city ? city.name : '-'
    };
  };

  const getSellerName = (sellerId) => {
    const seller = sellers.find(s => s.id === sellerId);
    return seller ? seller.name : '-';
  };

  const projectName = previousData?.projectInfo?.projectName || '-';
  const province = previousData?.projectInfo?.province || '';
  const city = previousData?.projectInfo?.city || '';
  const seller = previousData?.projectInfo?.seller || '';
  const defaultInspector = previousData?.inspectorInfo?.inspectorName || '';
  const defaultFee = previousData?.inspectorInfo?.fee || '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      
      {/* Project Information */}
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

      {/* Inspection Information */}
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
            <span className="text-gray-600">تعداد روزها:</span>
            <span className="font-semibold">{dailyReports.length} روز</span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
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

      {/* Daily Status */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
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
      </div>
    </div>
  );
};

export default FinalConfirmationContent;