// src/hooks/useAuth.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }) => {
      // اول لاگین می‌کنیم
      const loginResponse = await authService.login(username, password);
      
      // سپس اطلاعات کاربر رو می‌گیریم
      const userData = await authService.getCurrentUser();
      
      // ذخیره اطلاعات کاربر با متد جدید
      authService.setUserData(userData);
      
      return {
        loginData: loginResponse,
        userData: userData
      };
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      queryClient.invalidateQueries(['auth']);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries(['auth']);
      window.location.href = '/login';
    },
  });
};

// هوک جدید برای دریافت اطلاعات کاربر
export const useUser = () => {
  const user = authService.getUserData();
  const isLoggedIn = authService.isLoggedIn();
  
  return {
    user,
    isLoggedIn,
    isLoading: false // اگر نیاز به loading state دارید می‌توانید اضافه کنید
  };
};

// هوک برای بررسی نقش کاربر
export const useUserRole = () => {
  return authService.getUserRole();
};

// هوک برای بررسی دسترسی
export const useHasRole = (requiredRole) => {
  return authService.hasRole(requiredRole);
};

// هوک برای بررسی چندین نقش
export const useHasAnyRole = (requiredRoles) => {
  return authService.hasAnyRole(requiredRoles);
};