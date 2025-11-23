// src/hooks/useUser.js
import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userData = authService.getUserData();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // گوش دادن به تغییرات در localStorage (اختیاری)
    const handleStorageChange = () => {
      loadUser();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateUser = (userData) => {
    authService.setUserData(userData);
    setUser(userData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return { 
    user, 
    loading, 
    updateUser, 
    logout,
    isAuthenticated: !!user
  };
};