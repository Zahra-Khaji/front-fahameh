import { useQuery, useQueryClient } from '@tanstack/react-query';
import countryService from '../services/countryService';

// کلیدهای query برای کشورها
export const countryKeys = {
  all: ['countries'],
  lists: () => [...countryKeys.all, 'list'],
  list: (filters) => [...countryKeys.lists(), { filters }],
  details: () => [...countryKeys.all, 'detail'],
  detail: (id) => [...countryKeys.details(), id],
};

// هوک برای گرفتن لیست کشورها
export const useCountries = () => {
  return useQuery({
    queryKey: countryKeys.lists(),
    queryFn: () => countryService.getAllCountries(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // دو بار تلاش مجدد در صورت خطا
  });
};

// هوک برای گرفتن اطلاعات یک کشور خاص
export const useCountry = (countryId) => {
  return useQuery({
    queryKey: countryKeys.detail(countryId),
    queryFn: () => countryService.getCountryById(countryId),
    enabled: !!countryId, // فقط وقتی countryId وجود دارد اجرا شود
    staleTime: 10 * 60 * 1000,
  });
};