import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inspectorService from '../services/inspectorService';
import toast from 'react-hot-toast';

// کلیدهای query
export const inspectorKeys = {
  all: ['inspectors'],
  lists: () => [...inspectorKeys.all, 'list'],
  list: (filters) => [...inspectorKeys.lists(), { filters }],
  details: () => [...inspectorKeys.all, 'detail'],
  detail: (id) => [...inspectorKeys.details(), id],
};

// هوک برای گرفتن لیست بازرس‌ها
export const useInspectors = () => {
  return useQuery({
    queryKey: inspectorKeys.lists(),
    queryFn: () => inspectorService.getAllInspectors(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// هوک برای گرفتن اطلاعات یک بازرس خاص
export const useInspector = (id) => {
  return useQuery({
    queryKey: inspectorKeys.detail(id),
    queryFn: () => inspectorService.getInspectorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// هوک برای ایجاد بازرس جدید
export const useCreateInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inspectorService.createInspector(data),
    onSuccess: (newInspector) => {
      console.log('✅ Inspector created successfully:', newInspector);
      
      // بروزرسانی کش لیست بازرس‌ها
      queryClient.setQueryData(inspectorKeys.lists(), (oldData) => {
        if (!oldData) return [newInspector];
        return [...oldData, newInspector];
      });
      
      queryClient.invalidateQueries({ queryKey: inspectorKeys.lists() });
      
      toast.success('بازرس با موفقیت ایجاد شد');
    },
    onError: (error) => {
      console.error('❌ Error creating inspector:', error);
      toast.error(error.message || 'خطا در ایجاد بازرس');
      throw error;
    }
  });
};

// **جدید: هوک برای بروزرسانی بازرس**
export const useUpdateInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => inspectorService.updateInspector(id, data),
    onSuccess: (updatedInspector, variables) => {
      console.log('✅ Inspector updated successfully:', updatedInspector);
      
      // بروزرسانی کش لیست بازرس‌ها
      queryClient.setQueryData(inspectorKeys.lists(), (oldData) => {
        if (!oldData) return [updatedInspector];
        return oldData.map(inspector => 
          inspector.id === variables.id ? { ...inspector, ...updatedInspector } : inspector
        );
      });
      
      queryClient.invalidateQueries({ queryKey: inspectorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inspectorKeys.detail(variables.id) });
      
      toast.success('بازرس با موفقیت بروزرسانی شد');
    },
    onError: (error) => {
      console.error('❌ Error updating inspector:', error);
      toast.error(error.message || 'خطا در بروزرسانی بازرس');
      throw error;
    }
  });
};

// **جدید: هوک برای حذف بازرس**
export const useDeleteInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => inspectorService.deleteInspector(id),
    onSuccess: (data, deletedId) => {
      console.log('✅ Inspector deleted successfully:', deletedId);
      
      // حذف بازرس از کش
      queryClient.setQueryData(inspectorKeys.lists(), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(inspector => inspector.id !== deletedId);
      });
      
      queryClient.invalidateQueries({ queryKey: inspectorKeys.lists() });
      
      toast.success('بازرس با موفقیت حذف شد', {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
    },
    onError: (error) => {
      console.error('❌ Error deleting inspector:', error);
      toast.error(error.message || 'خطا در حذف بازرس', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      throw error;
    }
  });
};