// src/hooks/useRFIReport.js
import { useQuery } from '@tanstack/react-query';
import rfiService from '../services/rfiService';

export const useRFIReport = (projectName, enabled = false) => {
  return useQuery({
    queryKey: ['rfiReport', projectName],
    queryFn: () => rfiService.getRFIReport(projectName),
    enabled: enabled && !!projectName,
    retry: 1,
    staleTime: 30 * 1000, // 30 ثانیه (کاهش از 5 دقیقه)
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true, // فعال کردن refetch روی فوکوس پنجره
    refetchOnMount: true, // فعال کردن refetch روی mount
    refetchOnReconnect: true, // فعال کردن refetch روی reconnect
    onError: (error) => {
      console.error('خطا در هوک useRFIReport:', error.message);
    },
  });
};