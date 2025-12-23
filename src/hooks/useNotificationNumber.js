// src/hooks/useNotificationNumber.js
import { useQuery, useMutation } from "@tanstack/react-query";
import notificationService from "../services/notificationService";

// کلیدهای query برای cache management
export const notificationKeys = {
  all: ['notifications'],
  nextNumber: (projectId, projectTypeId) => [...notificationKeys.all, 'next', projectId, projectTypeId],
  detail: (rfiNumber) => [...notificationKeys.all, 'detail', rfiNumber],
  statuses: ['notification-statuses'], // کلید جدید برای وضعیت‌ها
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

// هوک جدید برای گرفتن لیست وضعیت‌های نوتیفیکیشن
export const useNotificationStatuses = () => {
  return useQuery({
    queryKey: notificationKeys.statuses,
    queryFn: () => notificationService.getNotificationStatuses(),
    staleTime: 60 * 60 * 1000, // 1 ساعت
    cacheTime: 24 * 60 * 60 * 1000, // 24 ساعت
    onError: (error) => {
      console.error("Error fetching notification statuses:", error);
    },
    placeholderData: {
      '1': 'Cancel',
      '2': 'Done',
      '3': 'Ongoing',
      '4': 'در حال انجام'
    }
  });
};

// هوک جدید برای آپدیت اطلاعات نوتیفیکیشن
export const useUpdateNotification = () => {
  return useMutation({
    mutationFn: async ({ timeTableRows, rfiDatesRows, statusesData }) => {
      const updateData = notificationService.prepareUpdateData(
        timeTableRows, 
        rfiDatesRows,
        statusesData
      );
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
  const statusesQuery = useNotificationStatuses();
  
  return {
    useNotificationNumber,
    useNotificationInfo,
    useNotificationStatuses: () => statusesQuery,
    useUpdateNotification: () => updateMutation,
    
    // helper functions
    formatDateForAPI: notificationService.formatDateForAPI.bind(notificationService),
    prepareUpdateData: notificationService.prepareUpdateData.bind(notificationService)
  };
};