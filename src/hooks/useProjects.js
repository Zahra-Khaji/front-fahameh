// src/hooks/useProjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';

// کلیدهای query
export const projectKeys = {
  all: ['projects'],
  lists: () => [...projectKeys.all, 'list'],
  list: (filters) => [...projectKeys.lists(), { filters }],
  details: () => [...projectKeys.all, 'detail'],
  detail: (id) => [...projectKeys.details(), id],
};

// هوک برای گرفتن لیست پروژه‌ها
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: () => projectService.getAllProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// هوک برای گرفتن اطلاعات یک پروژه خاص
export const useProject = (id) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id, // فقط وقتی id وجود دارد اجرا شود
    staleTime: 5 * 60 * 1000,
  });
};