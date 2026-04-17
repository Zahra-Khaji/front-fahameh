import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import provinceService from '../services/provinceService';
import toast from 'react-hot-toast';

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
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

// هوک برای گرفتن لیست شهرهای یک استان
export const useCities = (provinceId) => {
  return useQuery({
    queryKey: provinceKeys.cities(provinceId),
    queryFn: () => provinceService.getCitiesByProvince(provinceId),
    enabled: !!provinceId,
    staleTime: 10 * 60 * 1000,
  });
};

// ========== هوک‌های استان ==========

// هوک برای ایجاد استان جدید
export const useCreateProvince = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (provinceData) => provinceService.createProvince(provinceData),

    onSuccess: (newProvince) => {
      console.log('✅ Province created successfully:', newProvince);
      
      queryClient.setQueryData(provinceKeys.lists(), (oldData) => {
        if (!oldData) return [newProvince];
        return [...oldData, newProvince];
      });

      queryClient.invalidateQueries({ queryKey: provinceKeys.lists() });
      
      toast.success('استان با موفقیت ایجاد شد');
    },

    onError: (error) => {
      console.error('❌ Error creating province:', error);
      toast.error(error.message || 'خطا در ایجاد استان');
      throw error;
    }
  });
};

// **جدید: هوک برای بروزرسانی استان**
export const useUpdateProvince = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => provinceService.updateProvince(id, data),

    onSuccess: (updatedProvince, variables) => {
      console.log('✅ Province updated successfully:', updatedProvince);
      
      queryClient.setQueryData(provinceKeys.lists(), (oldData) => {
        if (!oldData) return [updatedProvince];
        return oldData.map(province => 
          province.id === variables.id ? { ...province, ...updatedProvince } : province
        );
      });

      queryClient.invalidateQueries({ queryKey: provinceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: provinceKeys.detail(variables.id) });
      
      toast.success('استان با موفقیت بروزرسانی شد');
    },

    onError: (error) => {
      console.error('❌ Error updating province:', error);
      toast.error(error.message || 'خطا در بروزرسانی استان');
      throw error;
    }
  });
};

// **جدید: هوک برای حذف استان**
export const useDeleteProvince = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => provinceService.deleteProvince(id),

    onSuccess: (data, deletedId) => {
      console.log('✅ Province deleted successfully:', deletedId);
      
      queryClient.setQueryData(provinceKeys.lists(), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(province => province.id !== deletedId);
      });

      queryClient.invalidateQueries({ queryKey: provinceKeys.lists() });
      
      toast.success('استان با موفقیت حذف شد', {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
    },

    onError: (error) => {
      console.error('❌ Error deleting province:', error);
      toast.error(error.message || 'خطا در حذف استان', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      throw error;
    }
  });
};

// ========== هوک‌های شهر ==========

// ========== اصلاح هوک useCreateCity ==========
export const useCreateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cityData) => provinceService.createCity(cityData),

    onSuccess: (newCity, variables) => {
      console.log('✅ City created successfully:', newCity);
      
      // **به روز رسانی مستقیم کش شهرها**
      queryClient.setQueryData(
        provinceKeys.cities(newCity.province_id),
        (oldData) => {
          if (!oldData) return [newCity];
          // بررسی اینکه آیا شهر قبلاً وجود دارد (جلوگیری از دplicate)
          const exists = oldData.some(city => city.name === newCity.name);
          if (exists) return oldData;
          return [...oldData, newCity];
        }
      );
      
      // اینوالیدیت برای اطمینان از هماهنگی با سرور (اختیاری)
      queryClient.invalidateQueries({
        queryKey: provinceKeys.cities(newCity.province_id)
      });
      
      toast.success('شهر با موفقیت ایجاد شد');
    },

    onError: (error) => {
      console.error('❌ Error creating city:', error);
      toast.error(error.message || 'خطا در ایجاد شهر');
      throw error;
    }
  });
};

// ========== همچنین اصلاح useUpdateCity برای آپدیت خودکار ==========
export const useUpdateCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => provinceService.updateCity(id, data),

    onSuccess: (updatedCity, variables) => {
      console.log('✅ City updated successfully:', updatedCity);
      
      // به روز رسانی مستقیم کش شهرها
      queryClient.setQueryData(
        provinceKeys.cities(updatedCity.province_id),
        (oldData) => {
          if (!oldData) return [updatedCity];
          return oldData.map(city => 
            city.id === variables.id ? { ...city, ...updatedCity } : city
          );
        }
      );
      
      // اگر استان شهر تغییر کرده، کش استان قدیم را هم به روز کن
      if (variables.data.province_id !== updatedCity.province_id) {
        queryClient.invalidateQueries({
          queryKey: provinceKeys.cities(variables.data.province_id)
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: provinceKeys.cities(updatedCity.province_id)
      });
      
      toast.success('شهر با موفقیت بروزرسانی شد');
    },

    onError: (error) => {
      console.error('❌ Error updating city:', error);
      toast.error(error.message || 'خطا در بروزرسانی شهر');
      throw error;
    }
  });
};

// **جدید: هوک برای بروزرسانی شهر**
// export const useUpdateCity = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, data }) => provinceService.updateCity(id, data),

//     onSuccess: (updatedCity, variables) => {
//       console.log('✅ City updated successfully:', updatedCity);
      
//       queryClient.invalidateQueries({
//         queryKey: provinceKeys.cities(updatedCity.province_id)
//       });
      
//       toast.success('شهر با موفقیت بروزرسانی شد');
//     },

//     onError: (error) => {
//       console.error('❌ Error updating city:', error);
//       toast.error(error.message || 'خطا در بروزرسانی شهر');
//       throw error;
//     }
//   });
// };

// **جدید: هوک برای حذف شهر**
export const useDeleteCity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => provinceService.deleteCity(id),

    onSuccess: (data, deletedId, context) => {
      console.log('✅ City deleted successfully:', deletedId);
      
      // اینوالیدیت کش شهرها
      queryClient.invalidateQueries({
        queryKey: ['provinces', 'cities']
      });
      
      toast.success('شهر با موفقیت حذف شد', {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
    },

    onError: (error) => {
      console.error('❌ Error deleting city:', error);
      toast.error(error.message || 'خطا در حذف شهر', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      throw error;
    }
  });
};