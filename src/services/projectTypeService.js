// src/services/projectTypeService.js
import http from './httpService';

class ProjectTypeService {
  // گرفتن لیست انواع پروژه
  async getAllProjectTypes() {
    try {
      const response = await http.get('/in-out');
      console.log('Project Types API Response:', response.data);
      return this.transformProjectTypesData(response.data);
    } catch (error) {
      console.error('Error fetching project types:', error);
      throw error;
    }
  }

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformProjectTypesData(apiData) {
    // فرمت: { "0": "خارجی", "1": "داخلی کالا", "2": "داخلی کشتی" }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    console.warn('Invalid project types data format:', apiData);
    return [];
  }
}

export default new ProjectTypeService();