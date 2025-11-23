// src/services/vendorService.js
import http from './httpService';

class VendorService {
  // گرفتن لیست تمام وندورها
  async getAllVendors() {
    try {
      const response = await http.get('/vendors');
      console.log('Vendors API Response:', response.data);
      return this.transformVendorsData(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک وندور خاص
  async getVendorById(id) {
    try {
      const response = await http.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vendor ${id}:`, error);
      throw error;
    }
  }

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformVendorsData(apiData) {
    // فرمت جدید: { "1": "", "2": "-", "3": " Asal Ara", "4": " Daghigh\r\nKaveh", ... }
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData)
        .filter(([id, name]) => {
          // فیلتر کردن مقادیر خالی و نامعتبر
          const trimmedName = name?.toString().trim();
          return trimmedName && 
                 trimmedName !== '' && 
                 trimmedName !== '-' && 
                 !trimmedName.startsWith('**') &&
                 !/^\d/.test(trimmedName); // حذف مواردی که با عدد شروع می‌شوند
        })
        .map(([id, name]) => ({
          id: id.toString(),
          name: this.cleanVendorName(name.toString())
        }));
    }
    
    console.warn('Invalid vendors data format:', apiData);
    return [];
  }

  // تمیز کردن نام وندور
  cleanVendorName(name) {
    return name
      .trim()
      .replace(/\r\n/g, ' ') // جایگزینی خطوط جدید با فاصله
      .replace(/\s+/g, ' ') // حذف فاصله‌های اضافی
      .replace(/^\s+/, ''); // حذف فاصله از ابتدا
  }
}

export default new VendorService();