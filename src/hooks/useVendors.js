// src/hooks/useVendors.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import vendorService from "../services/vendorService";

// کلیدهای query
export const vendorKeys = {
  all: ["vendors"],
  lists: () => [...vendorKeys.all, "list"],
  list: (isForeign) => [...vendorKeys.lists(), { isForeign }], // اضافه کردن isForeign به key
  details: () => [...vendorKeys.all, "detail"],
  detail: (id) => [...vendorKeys.details(), id],
};

// هوک برای گرفتن لیست وندورها بر اساس نوع پروژه
export const useVendors = (isForeign = false) => {
  return useQuery({
    queryKey: vendorKeys.list(isForeign), // استفاده از isForeign در queryKey
    queryFn: () => vendorService.getAllVendors(isForeign),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    enabled: isForeign !== undefined, // فقط وقتی isForeign مشخص است fetch کن
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

// هوک برای ایجاد وندور جدید
export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorData) => vendorService.createVendor(vendorData),

    onSuccess: (newVendor, vendorData) => {
      console.log("✅ Vendor created successfully:", newVendor);

      // **بررسی isForeign از داده‌های ارسال شده**
      const isForeign = vendorData.over_domestic || false;

      // آپدیت کش لیست وندورها بر اساس نوع پروژه
      queryClient.setQueryData(vendorKeys.list(isForeign), (oldData) => {
        if (!oldData) return [newVendor];
        return [...oldData, newVendor];
      });

      // اینوالیدیت برای دریافت داده تازه از سرور
      queryClient.invalidateQueries({
        queryKey: vendorKeys.lists(),
      });

      // اینوالیدیت لیست خاص بر اساس isForeign
      queryClient.invalidateQueries({
        queryKey: vendorKeys.list(isForeign),
      });

      console.log("🔄 Cache updated for isForeign:", isForeign);
    },

    onError: (error) => {
      console.error("❌ Error creating vendor:", error);
      // نمایش toast خطا در کامپوننت انجام می‌شود
    },
  });
};

// هوک ترکیبی برای همه عملیات وندور
export const useVendorOperations = () => {
  const createVendor = useCreateVendor();

  return {
    // Query operations
    useVendors,
    useVendor,

    // Mutation operations
    createVendor: createVendor.mutate,
    createVendorAsync: createVendor.mutateAsync,
    createVendorStatus: {
      isLoading: createVendor.isLoading,
      isError: createVendor.isError,
      error: createVendor.error,
      isSuccess: createVendor.isSuccess,
    },
  };
};
