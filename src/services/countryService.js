import http from './httpService';

class CountryService {
  // گرفتن لیست تمام کشورها
  async getAllCountries() {
    try {
      const response = await http.get('/locations/countries');
      console.log('Countries API Response:', response.data);
      return this.transformCountriesData(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw error;
    }
  }

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformCountriesData(apiData) {
    // فرمت پیش‌فرض: { "1": "چین", "2": "هند", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, name]) => ({
        id: id.toString(),
        name: name || 'بدون نام'
      }));
    }
    
    // اگر فرمت متفاوت بود (مثلاً آرایه از آبجکت‌ها)
    if (Array.isArray(apiData)) {
      return apiData.map(country => ({
        id: country.id?.toString() || country.country_id?.toString(),
        name: country.name || country.country_name || 'بدون نام'
      }));
    }
    
    console.warn('Invalid countries data format:', apiData);
    return [];
  }
}

export default new CountryService();