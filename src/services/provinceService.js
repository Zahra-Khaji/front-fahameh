// src/services/provinceService.js
import http from './httpService';

class ProvinceService {
  // گرفتن لیست تمام استان‌ها
  async getAllProvinces() {
    try {
      const response = await http.get('/locations/provinces');
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
      const response = await http.get(`/locations/cities/?province_id=${provinceId}`); // آدرس اصلاح شد
      console.log(`Cities API Response for province ${provinceId}:`, response.data);
      return this.transformCitiesData(response.data);
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      throw error;
    }
  }

  async createProvince(provinceData) {
    try {
      const apiData = {
        name: provinceData.name?.trim()
      };
  
      const response = await http.post('/locations/provinces', apiData);
  
      return {
        id: response.data.id?.toString() || `province-${Date.now()}`,
        name: apiData.name
      };
  
    } catch (error) {
      console.error('Error creating province:', error);
      throw error;
    }
  }

  async createCity(cityData) {
    try {
      const apiData = {
        name: cityData.name?.trim(),
        province_id: Number(cityData.province_id)
      };
  
      const response = await http.post('/locations/cities', apiData);
  
      return {
        id: response.data.id?.toString() || `city-${Date.now()}`,
        name: apiData.name,
        province_id: apiData.province_id
      };
  
    } catch (error) {
      console.error('Error creating city:', error);
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