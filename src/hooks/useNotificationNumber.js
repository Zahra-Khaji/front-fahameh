// src/hooks/useNotificationNumber.js
import { useQuery, useMutation } from "@tanstack/react-query";
import notificationService from "../services/notificationService";
import { useQueryClient } from "@tanstack/react-query";

// کلیدهای query برای cache management
export const notificationKeys = {
  all: ["notifications"],
  nextNumber: (projectId, projectTypeId) => [
    ...notificationKeys.all,
    "next",
    projectId,
    projectTypeId,
  ],
  detail: (rfiNumber) => [...notificationKeys.all, "detail", rfiNumber],
  statuses: ["notification-statuses"],
};

// هوک برای گرفتن شماره نوتیفیکیشن بعدی
export const useNotificationNumber = (projectId, projectTypeId) => {
  return useQuery({
    queryKey: notificationKeys.nextNumber(projectId, projectTypeId),
    queryFn: () =>
      notificationService.getNextNotificationNumber(projectId, projectTypeId),
    enabled: !!projectId && !!projectTypeId,
    staleTime: 5 * 60 * 1000,
  });
};

// هوک برای گرفتن اطلاعات کامل نوتیفیکیشن
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
      console.error(
        "❌ useNotificationInfo: Error fetching notification:",
        error
      );
    },
  });
};

// هوک برای گرفتن لیست وضعیت‌های نوتیفیکیشن
export const useNotificationStatuses = () => {
  return useQuery({
    queryKey: notificationKeys.statuses,
    queryFn: () => notificationService.getNotificationStatuses(),
    staleTime: 60 * 60 * 1000,
    cacheTime: 24 * 60 * 60 * 1000,
    onError: (error) => {
      console.error("Error fetching notification statuses:", error);
    },
    placeholderData: {
      1: "Cancel",
      2: "Done",
      3: "Ongoing",
      4: "در حال انجام",
    },
  });
};

// هوک برای آپدیت اطلاعات نوتیفیکیشن
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
  });
};

// هوک جدید برای آپدیت هر ردیف از جدول تاریخ‌های بازرسی
export const useUpdateNotificationRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rfiNumber, rowData }) => {
      return await notificationService.updateNotificationRow(
        rfiNumber,
        rowData
      );
    },
    onSuccess: (data, variables) => {
      console.log(
        "✅ useUpdateNotificationRow: Row update successful:",
        variables.rfiNumber
      );

      // **مهم: اینوالیدیت query برای دریافت داده‌های تازه**
      queryClient.invalidateQueries({
        queryKey: ["notifications", "detail", variables.rfiNumber],
      });

      // **همچنین می‌توانیم queryهای مربوط به گزارش را هم اینوالیدیت کنیم**
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"], // اگر جدول اصلی RFIReport دارید
      });

      // **پیام موفقیت به کامپوننت بازمی‌گردد - اینجا toast نشان ندهیم**
      return data;
    },
    onError: (error, variables) => {
      console.error("❌ useUpdateNotificationRow: Row update failed:", error);
      console.error(
        "❌ useUpdateNotificationRow: Error response:",
        error.response?.data
      );

      // خطا را propagate کنیم تا کامپوننت مدیریت کند
      throw error;
    },
  });
};


// src/hooks/useNotificationNumber.js

// هوک جدید برای آپدیت ردیف جدول نوتیفیکیشن
export const useUpdateNotificationInfoRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rfiNumber, rowData }) => {
      return await notificationService.updateNotificationInfoRow(
        rfiNumber,
        rowData
      );
    },
    onSuccess: (data, variables) => {
      console.log(
        "✅ useUpdateNotificationInfoRow: Notification row update successful:",
        variables.rfiNumber
      );

      // اینوالیدیت query برای دریافت داده‌های تازه
      queryClient.invalidateQueries({
        queryKey: ["notifications", "detail", variables.rfiNumber],
      });

      // اینوالیدیت queryهای مربوط به گزارش
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"],
      });

      return data;
    },
    onError: (error, variables) => {
      console.error("❌ useUpdateNotificationInfoRow: Row update failed:", error);
      throw error;
    },
  });
};











// هوک ترکیبی برای تمام عملیات نوتیفیکیشن
export const useNotifications = () => {
  const updateMutation = useUpdateNotification();
  const updateRowMutation = useUpdateNotificationRow();
  const statusesQuery = useNotificationStatuses();

  return {
    useNotificationNumber,
    useNotificationInfo,
    useNotificationStatuses: () => statusesQuery,
    useUpdateNotification: () => updateMutation,
    useUpdateNotificationRow: () => updateRowMutation,
    useUpdateNotificationInfoRow,

    // helper functions
    formatDateForAPI:
      notificationService.formatDateForAPI.bind(notificationService),
    prepareUpdateData:
      notificationService.prepareUpdateData.bind(notificationService),
  };
};
