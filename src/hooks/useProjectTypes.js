// src/hooks/useProjectTypes.js
import { useQuery } from '@tanstack/react-query';
import projectTypeService from '../services/projectTypeService';

// کلیدهای query
export const projectTypeKeys = {
  all: ['projectTypes'],
  lists: () => [...projectTypeKeys.all, 'list'],
  list: (filters) => [...projectTypeKeys.lists(), { filters }],
};

// هوک برای گرفتن لیست انواع پروژه
export const useProjectTypes = () => {
  return useQuery({
    queryKey: projectTypeKeys.lists(),
    queryFn: () => projectTypeService.getAllProjectTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};