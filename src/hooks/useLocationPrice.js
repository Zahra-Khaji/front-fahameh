import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import locationPriceService from "../services/locationPriceService";
import toast from "react-hot-toast";

// کلیدهای query
export const locationPriceKeys = {
  all: ["locationPrices"],
  lists: () => [...locationPriceKeys.all, "list"],
  list: (filters) => [...locationPriceKeys.lists(), { filters }],
  details: () => [...locationPriceKeys.all, "detail"],
  detail: (id) => [...locationPriceKeys.details(), id],
};

// هوک برای گرفتن لیست تعرفه‌های مکانی
export const useLocationPrices = () => {
  return useQuery({
    queryKey: locationPriceKeys.lists(),
    queryFn: () => locationPriceService.getAllLocationPrices(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// هوک برای گرفتن اطلاعات یک تعرفه مکانی خاص
export const useLocationPrice = (id) => {
  return useQuery({
    queryKey: locationPriceKeys.detail(id),
    queryFn: () => locationPriceService.getLocationPriceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// هوک برای ایجاد تعرفه مکانی جدید
export const useCreateLocationPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => locationPriceService.createLocationPrice(data),
    onSuccess: (newItem) => {
    //   console.log("✅ Location price created successfully:", newItem);
      
      queryClient.setQueryData(locationPriceKeys.lists(), (oldData) => {
        if (!oldData) return [newItem];
        return [...oldData, newItem];
      });
      
      queryClient.invalidateQueries({ queryKey: locationPriceKeys.lists() });
      
      toast.success("تعرفه مکانی با موفقیت ایجاد شد");
    },
    onError: (error) => {
      console.error("❌ Error creating location price:", error);
      toast.error(error.message || "خطا در ایجاد تعرفه مکانی");
      throw error;
    }
  });
};

// هوک برای بروزرسانی تعرفه مکانی
export const useUpdateLocationPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => locationPriceService.updateLocationPrice(id, data),
    onSuccess: (updatedItem, variables) => {
    //   console.log("✅ Location price updated successfully:", updatedItem);
      
      queryClient.setQueryData(locationPriceKeys.lists(), (oldData) => {
        if (!oldData) return [updatedItem];
        return oldData.map(item => 
          item.id === variables.id ? { ...item, ...updatedItem } : item
        );
      });
      
      queryClient.invalidateQueries({ queryKey: locationPriceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationPriceKeys.detail(variables.id) });
      
      toast.success("تعرفه مکانی با موفقیت بروزرسانی شد");
    },
    onError: (error) => {
      console.error("❌ Error updating location price:", error);
      toast.error(error.message || "خطا در بروزرسانی تعرفه مکانی");
      throw error;
    }
  });
};

// هوک برای حذف تعرفه مکانی
export const useDeleteLocationPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => locationPriceService.deleteLocationPrice(id),
    onSuccess: (data, deletedId) => {
    //   console.log("✅ Location price deleted successfully:", deletedId);
      
      queryClient.setQueryData(locationPriceKeys.lists(), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(item => item.id !== deletedId);
      });
      
      queryClient.invalidateQueries({ queryKey: locationPriceKeys.lists() });
      
      toast.success("تعرفه مکانی با موفقیت حذف شد", {
        duration: 3000,
        position: "top-center",
        icon: "✅",
      });
    },
    onError: (error) => {
      console.error("❌ Error deleting location price:", error);
      toast.error(error.message || "خطا در حذف تعرفه مکانی", {
        duration: 4000,
        position: "top-center",
        icon: "❌",
      });
      throw error;
    }
  });
};