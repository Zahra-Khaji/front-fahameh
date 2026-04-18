import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import projectService from "../services/projectService";
import toast from 'react-hot-toast';


// کلیدهای query
// export const projectKeys = {
//   all: ["projects"],
//   lists: () => [...projectKeys.all, "list"],
//   list: (filters) => [...projectKeys.lists(), { filters }],
//   details: () => [...projectKeys.all, "detail"],
//   detail: (id) => [...projectKeys.details(), id],
// };
export const projectKeys = {
  all: ["projects"],
  lists: () => [...projectKeys.all, "list"],
  list: (filters, onlyActive = true) => [...projectKeys.lists(), { filters, onlyActive }],
  details: () => [...projectKeys.all, "detail"],
  detail: (id) => [...projectKeys.details(), id],
};

// هوک برای گرفتن لیست پروژه‌ها
// export const useProjects = () => {
//   return useQuery({
//     queryKey: projectKeys.lists(),
//     queryFn: () => projectService.getAllProjects(),
//     staleTime: 5 * 60 * 1000,
//     cacheTime: 10 * 60 * 1000,
//   });
// };
export const useProjects = (onlyActive = true) => {
  return useQuery({
    queryKey: projectKeys.list(undefined, onlyActive),
    queryFn: () => projectService.getAllProjects(onlyActive),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// هوک برای گرفتن آخرین IRN
export const useLastIRN = (projectName, projectType) => {
  return useQuery({
    queryKey: ["lastIRN", projectName, projectType],
    queryFn: () => projectService.getLastIRN(projectName, projectType),
    enabled: !!projectName && !!projectType,
    staleTime: 2 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error("Error in useLastIRN hook:", error);
    },
  });
};

// هوک برای گرفتن اطلاعات یک پروژه خاص
export const useProject = (id) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectService.getProjectById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// **جدید: هوک برای بروزرسانی پروژه**
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => projectService.updateProject(id, data),
    onSuccess: (updatedProject, variables) => {
      console.log('✅ Project updated successfully:', updatedProject);
      
      // بروزرسانی کش لیست پروژه‌ها
      queryClient.setQueryData(projectKeys.lists(), (oldData) => {
        if (!oldData) return [updatedProject];
        return oldData.map(project => 
          project.id === variables.id ? { ...project, ...updatedProject } : project
        );
      });
      
      // اینوالیدیت برای دریافت داده تازه
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
    },
    onError: (error) => {
      console.error('❌ Error updating project:', error);
      throw error;
    }
  });
};

// **جدید: هوک برای حذف پروژه**
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => projectService.deleteProject(id),
    onSuccess: (data, deletedId) => {
      console.log('✅ Project deleted successfully:', deletedId);
      
      // حذف پروژه از کش
      queryClient.setQueryData(projectKeys.lists(), (oldData) => {
        if (!oldData) return [];
        return oldData.filter(project => project.id !== deletedId);
      });
      
      // اینوالیدیت کش برای اطمینان
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // نمایش toast موفقیت
      toast.success('پروژه با موفقیت حذف شد', {
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
    },
    onError: (error) => {
      console.error('❌ Error deleting project:', error);
      
      // نمایش toast خطا
      toast.error(error.message || 'خطا در حذف پروژه', {
        duration: 4000,
        position: 'top-center',
        icon: '❌',
      });
      throw error;
    }
  });
}