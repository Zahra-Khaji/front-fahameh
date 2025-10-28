// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';

export const useNotifications = (initialNotifications = [], onListChange) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [lastNotificationNumber, setLastNotificationNumber] = useState(1000);

  useEffect(() => {
    if (initialNotifications.length > 0) {
      setNotifications(initialNotifications);
      const maxNumber = Math.max(...initialNotifications.map(n => n.number));
      setLastNotificationNumber(maxNumber);
    }
  }, [initialNotifications]);

  const addNotification = (notification) => {
    const newNotifications = [notification, ...notifications];
    setNotifications(newNotifications);
    setLastNotificationNumber(notification.number);
    
    if (onListChange?.addToList) {
      onListChange.addToList('notifications', notification);
    }
  };

  const updateNotification = (notificationId, updates) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, ...updates } : notif
    );
    setNotifications(updatedNotifications);
    
    if (onListChange?.updateListItem) {
      onListChange.updateListItem('notifications', notificationId, updates);
    }
  };

  const deleteNotification = (notificationId) => {
    const filteredNotifications = notifications.filter(notif => notif.id !== notificationId);
    setNotifications(filteredNotifications);
    
    if (onListChange?.removeFromList) {
      onListChange.removeFromList('notifications', notificationId);
    }
  };

  return {
    notifications,
    lastNotificationNumber,
    addNotification,
    updateNotification,
    deleteNotification
  };
};