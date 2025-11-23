// src/hooks/useProvinces.js
import { useQuery, useQueryClient } from '@tanstack/react-query';
import provinceService from '../services/provinceService';

// کلیدهای query
export const provinceKeys = {
  all: ['provinces'],
  lists: () => [...provinceKeys.all, 'list'],
  list: (filters) => [...provinceKeys.lists(), { filters }],
  details: () => [...provinceKeys.all, 'detail'],
  detail: (id) => [...provinceKeys.details(), id],
  cities: (provinceId) => [...provinceKeys.detail(provinceId), 'cities'],
};

// هوک برای گرفتن لیست استان‌ها
export const useProvinces = () => {
  return useQuery({
    queryKey: provinceKeys.lists(),
    queryFn: () => provinceService.getAllProvinces(),
    staleTime: 10 * 60 * 1000, // 10 minutes (تغییر کمتر اتفاق می‌افته)
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// هوک برای گرفتن لیست شهرهای یک استان
export const useCities = (provinceId) => {
  return useQuery({
    queryKey: provinceKeys.cities(provinceId),
    queryFn: () => provinceService.getCitiesByProvince(provinceId),
    enabled: !!provinceId, // فقط وقتی provinceId وجود دارد اجرا شود
    staleTime: 10 * 60 * 1000,
  });
};