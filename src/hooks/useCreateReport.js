// src/hooks/useCreateReport.js
import { useMutation, useQuery } from '@tanstack/react-query';
import reportService from '../services/reportService';

// کلیدهای query برای cache management
export const reportKeys = {
  all: ['reports'],
  detail: (rfiNumbering) => [...reportKeys.all, 'detail', rfiNumbering],
};

// هوک برای گرفتن اطلاعات گزارش
export const useReportInfo = (rfiNumbering) => {
  return useQuery({
    queryKey: reportKeys.detail(rfiNumbering),
    queryFn: async () => {
      try {
        console.log('🎯 useReportInfo: Fetching for RFI:', rfiNumbering);
        const data = await reportService.getReportInfo(rfiNumbering);
        console.log('✅ useReportInfo: Raw data received:', data);
        
        const transformed = reportService.transformReportData(data);
        console.log('✅ useReportInfo: Transformed data:', transformed);
        
        return transformed;
      } catch (error) {
        console.error('❌ useReportInfo: Error in queryFn:', error);
        
        // اگر 404 بود (گزارش وجود ندارد) null برگردان
        if (error.response?.status === 404) {
          console.log('📭 No report found for RFI:', rfiNumbering);
          return null;
        }
        throw error;
      }
    },
    enabled: !!rfiNumbering && rfiNumbering.trim() !== '' && rfiNumbering !== '************',
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('❌ useReportInfo: Error fetching report:', error);
    }
  });
};

// هوک اصلی برای ثبت گزارش (موجود)
export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (reportData) => {
      console.log('🎯 useCreateReport: Mutation started with:', reportData);
      const result = await reportService.createReport(reportData);
      console.log('✅ useCreateReport: Mutation completed:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ useCreateReport: onSuccess called with:', data);
    },
    onError: (error) => {
      console.error('❌ useCreateReport: onError called with:', error);
      console.error('❌ useCreateReport: Error response:', error.response?.data);
    },
    onSettled: (data, error) => {
      console.log('🔵 useCreateReport: onSettled called', { data, error });
    }
  });
};

// هوک جدید برای آپدیت گزارش
export const useUpdateReport = () => {
  return useMutation({
    mutationFn: async ({ reportData, rfiNumbering }) => {
      console.log('🎯 useUpdateReport: Updating report for RFI:', rfiNumbering);
      const updateData = reportService.prepareReportUpdateData(reportData, rfiNumbering);
      console.log('📤 useUpdateReport: Sending data:', updateData);
      
      const result = await reportService.updateReport(updateData);
      console.log('✅ useUpdateReport: Update successful:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('✅ useUpdateReport: onSuccess for RFI:', variables.rfiNumbering);
    },
    onError: (error, variables) => {
      console.error('❌ useUpdateReport: Update failed for RFI:', variables.rfiNumbering);
      console.error('❌ useUpdateReport: Error:', error);
    }
  });
};