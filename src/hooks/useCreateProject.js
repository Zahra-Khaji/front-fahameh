// src/hooks/useCreateProject.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import projectService from '../services/projectService';
import { projectKeys } from './useProjects';

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectData) => projectService.createProject(projectData),
    
    onSuccess: (newProject) => {
      console.log('Project created successfully:', newProject);
      
      // آپدیت کش لیست پروژه‌ها
      queryClient.setQueryData(projectKeys.lists(), (oldData) => {
        if (!oldData) return [newProject];
        return [...oldData, newProject];
      });
      
      // همچنین می‌توانیم refetch کنیم تا از سرور داده تازه بگیریم
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Error creating project:', error);
      // می‌توانیم خطا را به کامپوننت پاس بدهیم
    }
  });
};