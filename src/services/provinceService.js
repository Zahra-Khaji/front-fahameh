// src/services/provinceService.js
import http from './httpService';

class ProvinceService {
  // گرفتن لیست تمام استان‌ها
  async getAllProvinces() {
    try {
      const response = await http.get('/provinces');
      console.log('Provinces API Response:', response.data);
      return this.transformProvincesData(response.data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  }

  // گرفتن لیست شهرهای یک استان
  async getCitiesByProvince(provinceId) {
    try {
      const response = await http.get(`/cities/?province_id=${provinceId}`); // آدرس اصلاح شد
      console.log(`Cities API Response for province ${provinceId}:`, response.data);
      return this.transformCitiesData(response.data);
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      throw error;
    }
  }

  // تبدیل داده‌های استان‌ها
  transformProvincesData(apiData) {
    // فرمت: { "1": "تهران", "2": "اصفهان", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    console.warn('Invalid provinces data format:', apiData);
    return [];
  }

  // تبدیل داده‌های شهرها
  transformCitiesData(apiData) {
    // فرض می‌کنیم فرمت شهرها هم مثل استان‌ها باشه: { "1": "تهران", "2": "شهریار", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    console.warn('Invalid cities data format:', apiData);
    return [];
  }
}

export default new ProvinceService();