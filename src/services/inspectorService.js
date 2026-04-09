// src/services/inspectorService.js
import http from './httpService';

class InspectorService {
  // گرفتن لیست تمام بازرس‌ها
  async getAllInspectors() {
    try {
      const response = await http.get('/inspectors');
      return this.transformInspectorsData(response.data);
    } catch (error) {
      console.error('Error fetching inspectors:', error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک بازرس خاص
  async getInspectorById(id) {
    try {
      // const response = await http.get(`/inspector/?inspector_id=${id}`);
      const response = await http.get(`/inspectors/${id}`);
      console.log(`Inspector details API Response for ID ${id}:`, response.data);
      return this.transformInspectorDetails(response.data, id);
    } catch (error) {
      console.error(`Error fetching inspector ${id}:`, error);
      throw error;
    }
  }

  async createInspector(data) {
    try {
      const response = await http.post('/inspectors', data);
      return response.data;
    } catch (error) {
      console.error('Error creating inspector:', error);
      throw error;
    }
  }
  

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformInspectorsData(apiData) {
    // apiData = { "2": "صدری مهدی", "3": "علیزاده فرشید", ... }
    return Object.entries(apiData).map(([id, name]) => ({
      id: id.toString(),
      name: name,
      location: '',
      phone: '',
      email: '',
      expertise: '',
      fee: ''
    }));
  }

  // تبدیل داده‌های جزئیات بازرس - بر اساس فرمت واقعی API
  transformInspectorDetails(apiData, inspectorId) {
    // فرمت واقعی API:
    // {
    //   "Inspector_Name": "صدری مهدی",
    //   "PersonnelCode": null,
    //   "Inspector_Email": "m.sadri@fahameh.com", 
    //   "Inspector_phone_no": "09190330704",
    //   "Location_Coverd": "تهران و کرج",
    //   "status": "active",
    //   "Price": 11000000
    // }
    
    if (typeof apiData === 'object' && apiData !== null) {
      return {
        id: inspectorId.toString(),
        name: apiData.Inspector_Name || '',
        location: apiData.Location_Coverd || '',
        phone: apiData.Inspector_phone_no || '',
        email: apiData.Inspector_Email || '',
        expertise: 'بازرس فنی', // از API دریافت نمی‌شود
        fee: apiData.Price ? `${this.formatNumber(apiData.Price)} تومان` : ''
      };
    }
    
    console.warn('Invalid inspector details format:', apiData);
    return this.getEmptyInspectorDetails(inspectorId);
  }

  // فرمت کردن اعداد به فارسی
  formatNumber(number) {
    return new Intl.NumberFormat('fa-IR').format(number);
  }

  // ایجاد آبجکت خالی برای بازرس
  getEmptyInspectorDetails(inspectorId) {
    return {
      id: inspectorId.toString(),
      name: '',
      location: '',
      phone: '',
      email: '',
      expertise: '',
      fee: ''
    };
  }
}

export default new InspectorService();