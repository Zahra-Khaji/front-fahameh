// src/hooks/useFormState.js
import { useState } from 'react';

export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [lists, setLists] = useState({
    notifications: [],
    reports: [],
    dailyReports: []
  });

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const addToList = (listName, item) => {
    setLists(prev => ({
      ...prev,
      [listName]: [item, ...prev[listName]]
    }));
  };

  const updateListItem = (listName, itemId, updates) => {
    setLists(prev => ({
      ...prev,
      [listName]: prev[listName].map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  };

  const removeFromList = (listName, itemId) => {
    setLists(prev => ({
      ...prev,
      [listName]: prev[listName].filter(item => item.id !== itemId)
    }));
  };

  return {
    formData,
    lists,
    updateFormData,
    addToList,
    updateListItem,
    removeFromList,
    setLists
  };
};