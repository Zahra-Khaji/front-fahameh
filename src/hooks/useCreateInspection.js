// src/hooks/useCreateInspection.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import inspectionService from '../services/inspectionService';

export const useCreateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inspectionData) => {
      console.log('🎯 useCreateInspection: Mutation started with:', inspectionData);
      const result = await inspectionService.createInspectionNote(inspectionData);
      console.log('✅ useCreateInspection: Mutation completed:', result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log('✅ useCreateInspection: onSuccess called with:', data);
      
      // **اضافه کردن invalidate queries برای RFI report**
      // این باعث می‌شود داده‌های RFI report دوباره از سرور fetch شوند
      queryClient.invalidateQueries({ 
        queryKey: ['rfiReport'],
        refetchType: 'all' // force refetch همه instances
      });
      
      // همچنین اگر پروژه خاصی داریم، آن را هم invalidate کنیم
      const projectName = variables?.projectInfo?.projectName || variables?.IDP;
      if (projectName) {
        console.log(`🔄 Invalidating RFI report cache for project: ${projectName}`);
        queryClient.invalidateQueries({ 
          queryKey: ['rfiReport', projectName.toString()],
          refetchType: 'active' // فقط اگر query active است refetch شود
        });
      }
      
      // همچنین می‌توانیم queries مربوط به آمار را هم invalidate کنیم
      queryClient.invalidateQueries({ queryKey: ['rfiStats'] });
      
      // اگر آخرین RFI‌ها را دارید، آن را هم invalidate کنید
      queryClient.invalidateQueries({ queryKey: ['recentRFIs'] });
      
      console.log('🔄 useCreateInspection: All related queries invalidated');
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