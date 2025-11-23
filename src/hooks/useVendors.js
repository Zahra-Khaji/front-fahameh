// src/hooks/useVendors.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vendorService from '../services/vendorService';

// کلیدهای query
export const vendorKeys = {
  all: ['vendors'],
  lists: () => [...vendorKeys.all, 'list'],
  list: (filters) => [...vendorKeys.lists(), { filters }],
  details: () => [...vendorKeys.all, 'detail'],
  detail: (id) => [...vendorKeys.details(), id],
};

// هوک برای گرفتن لیست وندورها
export const useVendors = () => {
  return useQuery({
    queryKey: vendorKeys.lists(),
    queryFn: () => vendorService.getAllVendors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

// هوک برای گرفتن اطلاعات یک وندور خاص
export const useVendor = (id) => {
  return useQuery({
    queryKey: vendorKeys.detail(id),
    queryFn: () => vendorService.getVendorById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};