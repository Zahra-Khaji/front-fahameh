// src/components/notification/FinalConfirmationContent.jsx
import React from 'react';
import { 
  FaBuilding, 
  FaUserTie, 
  FaHashtag, 
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaClock,
  FaFileSignature,
  FaTag,
  FaIndustry,
  FaUser,
  FaCertificate,
  FaCalendarDay,
  FaListOl
} from 'react-icons/fa';
import { formatPersianDate, formatMultipleDates } from '../../utils/helpers';

// اضافه کردن هوک‌های لازم برای دریافت نام استان و شهر
import { useProvinces, useCities } from '../../hooks/useProvinces';
import { useCountries } from '../../hooks/useCountries';

const FinalConfirmationContent = ({ previousData, notification }) => {
  if (!previousData || !notification) {
    return (
      <div className="text-center py-3 text-gray-500 text-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  // استفاده از هوک‌ها برای دریافت نام استان و شهر
  const { data: provinces } = useProvinces();
  const { data: countries } = useCountries();
  const { data: cities } = useCities(previousData.projectInfo?.province);

  // تابع برای دریافت نام موقعیت
  const getLocationDisplay = () => {
    const projectInfo = previousData.projectInfo || {};
    
    // اگر پروژه خارجی است
    const isForeign = projectInfo.projectType === '0' || 
                     projectInfo.projectType === 'foreign';
    
    if (isForeign && projectInfo.country) {
      // نمایش کشور برای پروژه خارجی
      const country = countries?.find(c => 
        c.id === projectInfo.country || 
        c.id?.toString() === projectInfo.country?.toString()
      );
      return country?.name || projectInfo.country || '—';
    } else {
      // نمایش استان و شهر برای پروژه داخلی
      const province = provinces?.find(p => 
        p.id === projectInfo.province || 
        p.id?.toString() === projectInfo.province?.toString()
      );
      
      const city = cities?.find(c => 
        c.id === projectInfo.city || 
        c.id?.toString() === projectInfo.city?.toString()
      );
      
      if (province && city) {
        return `${province.name} - ${city.name}`;
      } else if (province) {
        return province.name;
      } else if (city) {
        return city.name;
      } else if (projectInfo.province || projectInfo.city) {
        return `${projectInfo.province || ''}${projectInfo.city ? ' - ' + projectInfo.city : ''}`;
      }
    }
    
    return '—';
  };

  // استخراج داده‌ها برای نمایش فشرده
  const projectInfo = previousData.projectInfo || {};
  const inspectorInfo = previousData.inspectorInfo || {};

  // تعیین نوع پروژه
  const getProjectTypeText = (type) => {
    const typeMap = {
      '0': 'خارجی',
      '1': 'داخلی کالا', 
      '2': 'داخلی کشتی',
      'foreign': 'خارجی',
      'domestic_goods': 'داخلی کالا',
      'domestic_ship': 'داخلی کشتی'
    };
    return typeMap[type] || type || 'نامشخص';
  };

  // دریافت نام کامل موقعیت
  const locationDisplay = getLocationDisplay();

  return (
    <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pr-1">
      {/* اطلاعات پروژه - کارت کوچک */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <FaBuilding className="text-blue-600 text-xs" />
          <h5 className="text-xs font-bold text-blue-800">اطلاعات پروژه</h5>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="space-y-1">
            {/* نام پروژه با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaFileSignature className="text-blue-500 text-xs flex-shrink-0" />
              <span className="font-medium">نام:</span>
              <span className="font-bold text-blue-900 truncate" title={projectInfo.projectName}>
                {projectInfo.projectName || '—'}
              </span>
            </div>
            
            {/* نوع پروژه با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaTag className="text-blue-500 text-xs flex-shrink-0" />
              <span className="font-medium">نوع:</span>
              <span className="font-bold text-blue-900">
                {getProjectTypeText(projectInfo.projectType)}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            {/* محل با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaMapMarkerAlt className="text-blue-500 text-xs flex-shrink-0" />
              <span className="font-medium">موقعیت:</span>
              <span 
                className="font-bold text-blue-900 truncate" 
                title={locationDisplay}
              >
                {locationDisplay}
              </span>
            </div>
            
            {/* وندور با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaIndustry className="text-blue-500 text-xs flex-shrink-0" />
              <span className="font-medium">وندور:</span>
              <span className="font-bold text-blue-900 truncate" title={projectInfo.vendor}>
                {projectInfo.vendor || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات بازرس - کارت کوچک */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 border border-green-200 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <FaUserTie className="text-green-600 text-xs" />
          <h5 className="text-xs font-bold text-green-800">اطلاعات بازرس</h5>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="space-y-1">
            {/* نام بازرس با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaUser className="text-green-500 text-xs flex-shrink-0" />
              <span className="font-medium">نام:</span>
              <span className="font-bold text-green-900 truncate" title={inspectorInfo.inspectorName}>
                {inspectorInfo.inspectorName || '—'}
              </span>
            </div>
            
            {/* تخصص با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaBriefcase className="text-green-500 text-xs flex-shrink-0" />
              <span className="font-medium">تخصص:</span>
              <span className="font-bold text-green-900">
                {inspectorInfo.expertise || '—'}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            {/* دستمزد با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaDollarSign className="text-green-500 text-xs flex-shrink-0" />
              <span className="font-medium">دستمزد:</span>
              <span className="font-bold text-green-900">
                {inspectorInfo.fee ? `${inspectorInfo.fee} تومان` : '—'}
              </span>
            </div>
            
            {/* ایمیل با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaEnvelope className="text-green-500 text-xs flex-shrink-0" />
              <span className="font-medium">ایمیل:</span>
              <span className="font-bold text-green-900 truncate" title={inspectorInfo.email}>
                {inspectorInfo.email || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات نوتیفیکیشن - کارت کوچک */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <FaHashtag className="text-purple-600 text-xs" />
          <h5 className="text-xs font-bold text-purple-800">اطلاعات نوتیفیکیشن</h5>
        </div>
        
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="space-y-1">
            {/* شماره نوتیفیکیشن با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaHashtag className="text-purple-500 text-xs flex-shrink-0" />
              <span className="font-medium">شماره:</span>
              <span className="font-bold text-purple-900 bg-purple-50 px-1.5 py-0.5 rounded">
                {notification.number || '—'}
              </span>
            </div>
            
            {/* IDOM با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaCertificate className="text-purple-500 text-xs flex-shrink-0" />
              <span className="font-medium">IDOM:</span>
              <span className="font-bold text-purple-900">
                {notification.idom || 1}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            {/* تاریخ ارسال با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaCalendarAlt className="text-purple-500 text-xs flex-shrink-0" />
              <span className="font-medium">ارسال:</span>
              <span className="font-bold text-purple-900">
                {notification.sendDate ? formatPersianDate(notification.sendDate) : '—'}
              </span>
            </div>
            
            {/* مدت بازرسی با ایکون */}
            <div className="flex items-center gap-1 text-gray-600">
              <FaClock className="text-purple-500 text-xs flex-shrink-0" />
              <span className="font-medium">مدت:</span>
              <span className="font-bold text-purple-900">
                {notification.inspectionDays || 0} روز
              </span>
            </div>
          </div>
          
          {/* تاریخ‌های بازرسی - ستون کامل */}
          <div className="col-span-2 mt-1 pt-1 border-t border-purple-200">
            <div className="flex items-start gap-1 text-gray-600">
              <FaCalendarDay className="text-purple-500 text-xs mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium mb-0.5 flex items-center gap-1">
                  <span>تاریخ‌های بازرسی:</span>
                  <span className="text-purple-600 text-[10px] bg-purple-100 px-1 py-0.5 rounded">
                    {notification.inspectionRange?.length || 0} تاریخ
                  </span>
                </div>
                <div className="font-bold text-purple-900 text-[10px] leading-tight bg-purple-50 p-1.5 rounded">
                  {notification.inspectionRange?.length > 0 
                    ? formatMultipleDates(notification.inspectionRange)
                    : '—'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* خلاصه نهایی - کامپکت */}
      {/* <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-2.5 border border-amber-200 shadow-sm">
        <div className="flex items-center justify-center">
          <FaListOl className="text-amber-600 text-xs mr-1.5" />
          <div className="text-center flex-1">
            <div className="text-[10px] text-amber-800 font-semibold mb-0.5">
              خلاصه درخواست
            </div>
            <div className="text-xs font-bold text-amber-900 truncate" title={`${projectInfo.projectName} - ${notification.number}`}>
              {projectInfo.projectName || 'پروژه'} • {notification.number || 'نوتیفیکیشن'}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5 flex justify-center items-center gap-1">
              <FaMapMarkerAlt className="text-amber-600 text-[9px]" />
              <span>{locationDisplay}</span>
              <span>•</span>
              <FaCalendarDay className="text-amber-600 text-[9px]" />
              <span>{notification.inspectionRange?.length || 0} روز</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default FinalConfirmationContent;