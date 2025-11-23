// src/components/common/RequestInfoSidebar.jsx
import React from 'react';
import { useProvinces, useCities } from '../../hooks/useProvinces';
import { useVendors } from '../../hooks/useVendors';
import Button from '../ui/Button';

const RequestInfoSidebar = ({ previousData, onBack, showBackButton = true }) => {
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

  const location = getLocationName(previousData?.projectInfo?.province, previousData?.projectInfo?.city);

  return (
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
            {getVendorName(previousData?.projectInfo?.vendor)}
          </p>
        </div>
        
        <div>
          <span className="font-semibold text-gray-600">موقعیت:</span>
          <p className="text-gray-800">
            {location.provinceName} - {location.cityName}
          </p>
        </div>

        {showBackButton && onBack && (
          <Button
            variant="secondary"
            size="md"
            icon="arrowLeft"
            onClick={onBack}
            className="w-full text-xs mt-4"
          >
            بازگشت به مرحله قبل
          </Button>
        )}
      </div>
    </div>
  );
};

export default RequestInfoSidebar;