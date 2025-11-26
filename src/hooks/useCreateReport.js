// src/hooks/useCreateReport.js
import { useMutation } from '@tanstack/react-query';
import reportService from '../services/reportService';

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