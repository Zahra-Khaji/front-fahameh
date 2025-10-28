// src/components/common/RequestInfoSidebar.jsx
import React from 'react';
import { provinces, citiesByProvince, sellers } from '../../data/staticData';
import Button from '../ui/Button';

const RequestInfoSidebar = ({ previousData, onBack, showBackButton = true }) => {
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
            {getSellerName(previousData?.projectInfo?.seller) || '-'}
          </p>
        </div>
        
        <div>
          <span className="font-semibold text-gray-600">موقعیت:</span>
          <p className="text-gray-800">
            {getLocationName(previousData?.projectInfo?.province, previousData?.projectInfo?.city).provinceName} - 
            {getLocationName(previousData?.projectInfo?.province, previousData?.projectInfo?.city).cityName}
          </p>
        </div>

        {showBackButton && onBack && (
          <Button
            variant="secondary"
            size="md"
            icon="arrowLeft"
            onClick={onBack}
            className="w-full text-sm mt-4"
          >
            بازگشت به مرحله قبل
          </Button>
        )}
      </div>
    </div>
  );
};

export default RequestInfoSidebar;