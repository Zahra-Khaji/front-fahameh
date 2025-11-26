// src/hooks/useNotificationNumber.js
import { useQuery } from "@tanstack/react-query";
import notificationService from "../services/notificationService";

export const useNotificationNumber = (projectId, projectTypeId) => {
  return useQuery({
    queryKey: ["notificationNumber", projectId, projectTypeId],
    queryFn: () =>
      notificationService.getNextNotificationNumber(projectId, projectTypeId),
    enabled: !!projectId && !!projectTypeId,
    staleTime: 5 * 60 * 1000,
  });
};
