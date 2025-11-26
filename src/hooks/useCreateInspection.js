// src/hooks/useCreateInspection.js
import { useMutation } from '@tanstack/react-query';
import inspectionService from '../services/inspectionService';

export const useCreateInspection = () => {
  return useMutation({
    mutationFn: async (inspectionData) => {
      console.log('🎯 useCreateInspection: Mutation started with:', inspectionData);
      const result = await inspectionService.createInspectionNote(inspectionData);
      console.log('✅ useCreateInspection: Mutation completed:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ useCreateInspection: onSuccess called with:', data);
    },
    onError: (error) => {
      console.error('❌ useCreateInspection: onError called with:', error);
      console.error('❌ useCreateInspection: Error response:', error.response?.data);
    },
    onSettled: (data, error) => {
      console.log('🔵 useCreateInspection: onSettled called', { data, error });
    }
  });
};