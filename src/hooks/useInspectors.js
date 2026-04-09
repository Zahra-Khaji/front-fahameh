// src/hooks/useInspectors.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inspectorService from '../services/inspectorService';

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// هوک برای گرفتن اطلاعات یک بازرس خاص
export const useInspector = (id) => {
  return useQuery({
    queryKey: inspectorKeys.detail(id),
    queryFn: () => inspectorService.getInspectorById(id),
    enabled: !!id, // فقط وقتی id وجود دارد اجرا شود
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateInspector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inspectorService.createInspector(data),
    onSuccess: () => {
      queryClient.invalidateQueries(inspectorKeys.lists());
    },
  });
};
