// src/hooks/useRFIReport.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import authService from '../services/authService';

export const useRFIReport = (projectName, enabled = false) => {
  return useQuery({
    queryKey: ['rfiReport', projectName],
    queryFn: async () => {
      if (!projectName) {
        return null;
      }

      try {
        const BASE_URL = "http://192.168.0.4:8001";
        const response = await axios.get(
          `${BASE_URL}/api/rfi/report?project_name=${encodeURIComponent(projectName)}`,
          {
            headers: authService.getAuthHeader(),
            timeout: 10000,
          }
        );

        console.log('RFI Report Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching RFI report:', error);
        
        let errorMessage = 'خطا در دریافت گزارش RFI';
        if (error.response) {
          errorMessage = error.response.data?.detail || 
                        error.response.data?.message || 
                        `خطا: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'سرور پاسخ نمی‌دهد';
        }
        
        throw new Error(errorMessage);
      }
    },
    enabled: enabled && !!projectName,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};