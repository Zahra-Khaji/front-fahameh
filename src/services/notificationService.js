// src/services/notificationService.js
import http from './httpService';

class NotificationService {
  // گرفتن شماره نوتیفیکیشن بعدی از بک‌اند
  async getNextNotificationNumber(projectId, projectTypeId) {
    try {
      const response = await http.get('/next-rfi-full', { // حذف api/ از اول
        params: {
          idp: projectId,
          in_out: projectTypeId
        }
      });
      
      console.log('Next notification API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching next notification number:', error);
      throw error;
    }
  }
}

export default new NotificationService();