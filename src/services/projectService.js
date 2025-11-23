// src/services/projectService.js
import http from './httpService';

class ProjectService {
  // گرفتن لیست تمام پروژه‌ها
  async getAllProjects() {
    try {
      const response = await http.get('/projects');
      console.log('Projects API Response:', response.data);
      return this.transformProjectsData(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک پروژه خاص
  async getProjectById(id) {
    try {
      const response = await http.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformProjectsData(apiData) {
    // فرمت: { "4": "چهلستون", "5": "عمران ساحل بندرپارسیان", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    // اگر داده نامعتبر هست
    console.warn('Invalid projects data format:', apiData);
    return [];
  }
}

export default new ProjectService();