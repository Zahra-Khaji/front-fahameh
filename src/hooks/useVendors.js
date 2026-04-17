import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import vendorService from "../services/vendorService";
import toast from 'react-hot-toast';

// کلیدهای query
export const vendorKeys = {
  all: ["vendors"],
  lists: () => [...vendorKeys.all, "list"],
  list: (isForeign) => [...vendorKeys.lists(), { isForeign }],
  details: () => [...vendorKeys.all, "detail"],
  detail: (id) => [...vendorKeys.details(), id],
};

// هوک برای گرفتن لیست وندورها بر اساس نوع پروژه
export const useVendors = (isForeign = false) => {
  return useQuery({
    queryKey: vendorKeys.list(isForeign),
    queryFn: () => vendorService.getAllVendors(isForeign),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    enabled: isForeign !== undefined,
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

      const isForeign = vendorData.over_domestic || false;

      queryClient.setQueryData(vendorKeys.list(isForeign), (oldData) => {
        if (!oldData) return [newVendor];
        return [...oldData, newVendor];
      });

      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.list(isForeign) });
      
      toast.success('وندور با موفقیت ایجاد شد');
    },

    onError: (error) => {
      console.error("❌ Error creating vendor:", error);
      toast.error(error.message || 'خطا در ایجاد وندور');
      throw error;
    },
  });
};

// **جدید: هوک برای بروزرسانی وندور**
export const useUpdateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => vendorService.updateVendor(id, data),

    onSuccess: (updatedVendor, variables) => {
      console.log("✅ Vendor updated successfully:", updatedVendor);

      const isForeign = updatedVendor.over_domestic || false;

      // بروزرسانی کش لیست وندورها
      queryClient.setQueryData(vendorKeys.list(isForeign), (oldData) => {
        if (!oldData) return [updatedVendor];
        return oldData.map(vendor => 
          vendor.id === variables.id ? { ...vendor, ...updatedVendor } : vendor
        );
      });

      // همچنین لیست مخالف را هم آپدیت کن (اگر isForeign تغییر کرده باشد)
      const oppositeIsForeign = !isForeign;
      queryClient.setQueryData(vendorKeys.list(oppositeIsForeign), (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(vendor => vendor.id !== variables.id);
      });

      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(variables.id) });
      
      toast.success('وندور با موفقیت بروزرسانی شد');
    },

    onError: (error) => {
      console.error("❌ Error updating vendor:", error);
      toast.error(error.message || 'خطا در بروزرسانی وندور');
      throw error;
    },
  });
};

// **جدید: هوک برای حذف وندور (بر اساس NAME)**
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorName) => vendorService.deleteVendor(vendorName),

    onSuccess: (data, deletedName) => {
      console.log("✅ Vendor deleted successfully:", deletedName);

      // حذف وندور از هر دو کش (داخلی و خارجی)
      queryClient.setQueryData(vendorKeys.list(true), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(vendor => vendor.name !== deletedName);
      });
      
      queryClient.setQueryData(vendorKeys.list(false), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(vendor => vendor.name !== deletedName);
      });

      queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      
      toast.success('وندور با موفقیت حذف شد', {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
    },

    onError: (error) => {
      console.error("❌ Error deleting vendor:", error);
      toast.error(error.message || 'خطا در حذف وندور', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      throw error;
    },
  });
};

// هوک ترکیبی برای همه عملیات وندور
export const useVendorOperations = () => {
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

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
    
    updateVendor: updateVendor.mutate,
    updateVendorAsync: updateVendor.mutateAsync,
    updateVendorStatus: {
      isLoading: updateVendor.isLoading,
      isError: updateVendor.isError,
      error: updateVendor.error,
      isSuccess: updateVendor.isSuccess,
    },
    
    deleteVendor: deleteVendor.mutate,
    deleteVendorAsync: deleteVendor.mutateAsync,
    deleteVendorStatus: {
      isLoading: deleteVendor.isLoading,
      isError: deleteVendor.isError,
      error: deleteVendor.error,
      isSuccess: deleteVendor.isSuccess,
    },
  };
};