// src/hooks/useCreateProject.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import projectService from '../services/projectService';
import { projectKeys } from './useProjects';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData) => projectService.createProject(projectData),
    
    onSuccess: (newProject) => {
      console.log('✅ Project created successfully:', newProject);
      
      // آپدیت کش لیست پروژه‌ها
      queryClient.setQueryData(projectKeys.lists(), (oldData) => {
        if (!oldData) return [newProject];
        return [...oldData, newProject];
      });
      
      // اینوالیدیت برای دریافت داده تازه از سرور
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // نمایش toast موفقیت (اگر در کامپوننت نمایش نداده باشیم)
      // toast.success(`پروژه "${newProject.name}" با موفقیت ایجاد شد`);
    },
    
    onError: (error) => {
      console.error('❌ Error creating project:', error);
      // نمایش toast خطا در کامپوننت انجام می‌شود
    }
  });
};