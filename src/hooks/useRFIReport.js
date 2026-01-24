// src/hooks/useRFIReport.js
import { useQuery } from '@tanstack/react-query';
import rfiService from '../services/rfiService';

export const useRFIReport = (projectName, projectType = '', enabled = false) => {
  return useQuery({
    queryKey: ['rfiReport', projectName, projectType],
    queryFn: () => rfiService.getRFIReport(projectName, projectType),
    enabled: enabled && !!projectName,
    retry: 1,
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    onError: (error) => {
      console.error('خطا در هوک useRFIReport:', error.message);
    },
  });
};