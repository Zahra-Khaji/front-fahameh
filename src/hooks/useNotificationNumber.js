// src/hooks/useNotificationNumber.js
import { useQuery, useMutation } from "@tanstack/react-query";
import notificationService from "../services/notificationService";

// کلیدهای query برای cache management
export const notificationKeys = {
  all: ['notifications'],
  nextNumber: (projectId, projectTypeId) => [...notificationKeys.all, 'next', projectId, projectTypeId],
  detail: (rfiNumber) => [...notificationKeys.all, 'detail', rfiNumber],
};

// هوک برای گرفتن شماره نوتیفیکیشن بعدی (موجود)
export const useNotificationNumber = (projectId, projectTypeId) => {
  return useQuery({
    queryKey: notificationKeys.nextNumber(projectId, projectTypeId),
    queryFn: () =>
      notificationService.getNextNotificationNumber(projectId, projectTypeId),
    enabled: !!projectId && !!projectTypeId,
    staleTime: 5 * 60 * 1000,
  });
};

// هوک جدید برای گرفتن اطلاعات کامل نوتیفیکیشن
export const useNotificationInfo = (rfiNumber) => {
  return useQuery({
    queryKey: notificationKeys.detail(rfiNumber),
    queryFn: async () => {
      const data = await notificationService.getNotificationInfo(rfiNumber);
      return notificationService.transformNotificationData(data);
    },
    enabled: !!rfiNumber,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error('❌ useNotificationInfo: Error fetching notification:', error);
    }
  });
};

// هوک جدید برای آپدیت اطلاعات نوتیفیکیشن
export const useUpdateNotification = () => {
  return useMutation({
    mutationFn: async ({ timeTableRows, rfiDatesRows }) => {
      const updateData = notificationService.prepareUpdateData(timeTableRows, rfiDatesRows);
      return await notificationService.updateNotificationInfo(updateData);
    },
    onSuccess: (data) => {
      console.log('✅ useUpdateNotification: Update successful:', data);
    },
    onError: (error) => {
      console.error('❌ useUpdateNotification: Update failed:', error);
      console.error('❌ useUpdateNotification: Error response:', error.response?.data);
    }
  });
};

// هوک ترکیبی برای تمام عملیات نوتیفیکیشن
export const useNotifications = () => {
  const updateMutation = useUpdateNotification();
  
  return {
    useNotificationNumber,
    useNotificationInfo,
    useUpdateNotification: () => updateMutation,
    
    // helper functions
    formatDateForAPI: notificationService.formatDateForAPI.bind(notificationService),
    prepareUpdateData: notificationService.prepareUpdateData.bind(notificationService)
  };
};