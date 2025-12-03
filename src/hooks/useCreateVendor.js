// src/hooks/useCreateVendor.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import vendorService from '../services/vendorService';
import { vendorKeys } from './useVendors';

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorData) => vendorService.createVendor(vendorData),
    
    onSuccess: (newVendor) => {
      console.log('✅ Vendor created successfully:', newVendor);
      
      // آپدیت کش لیست وندورها
      queryClient.setQueryData(vendorKeys.lists(), (oldData) => {
        if (!oldData) return [newVendor];
        return [...oldData, newVendor];
      });
      
      // اینوالیدیت برای دریافت داده تازه از سرور
      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      // نمایش toast موفقیت در کامپوننت انجام می‌شود
    },
    
    onError: (error) => {
      console.error('❌ Error creating vendor:', error);
      // نمایش toast خطا در کامپوننت انجام می‌شود
    }
  });
};