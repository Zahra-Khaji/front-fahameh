// src/hooks/useRFIReport.js
import { useQuery } from "@tanstack/react-query";
import rfiService from "../services/rfiService";

export const useRFIReport = (projectName, enabled = false) => {
  return useQuery({
    queryKey: ["rfiReport", projectName],
    queryFn: () => rfiService.getRFIReport(projectName),
    enabled: enabled && !!projectName,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (React Query v5)
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("خطا در هوک useRFIReport:", error.message);
    },
  });
};

// هوک برای دریافت آمار RFI
export const useRFIStats = (projectName) => {
  return useQuery({
    queryKey: ["rfiStats", projectName],
    queryFn: () => rfiService.getRFIStats(projectName),
    enabled: !!projectName,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// هوک برای دریافت آخرین RFI‌ها
export const useRecentRFIs = (limit = 10) => {
  return useQuery({
    queryKey: ["recentRFIs", limit],
    queryFn: () => rfiService.getRecentRFIs(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// هوک برای جستجوی RFI
export const useRFISearch = (filters = {}, enabled = true) => {
  return useQuery({
    queryKey: ["rfiSearch", filters],
    queryFn: () => rfiService.searchRFI(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: 2 * 60 * 1000,
  });
};
