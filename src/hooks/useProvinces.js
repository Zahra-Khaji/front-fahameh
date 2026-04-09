// src/hooks/useProvinces.js
import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
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
export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cityData) =>
      provinceService.createCity(cityData),

    onSuccess: (newCity) => {

      queryClient.invalidateQueries({
        queryKey: provinceKeys.cities(newCity.province_id)
      });

    },

    onError: (error) => {
      console.error("Error creating city:", error);
    }
  });
};


export const useCreateProvince = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provinceData) =>
      provinceService.createProvince(provinceData),

    onSuccess: (newProvince) => {
      queryClient.setQueryData(provinceKeys.lists(), (oldData) => {
        if (!oldData) return [newProvince];
        return [...oldData, newProvince];
      });

      queryClient.invalidateQueries({
        queryKey: provinceKeys.lists()
      });
    },

    onError: (error) => {
      console.error("Error creating province:", error);
    }
  });
};
