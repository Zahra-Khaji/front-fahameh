// src/services/vendorService.js
import http from './httpService';

class VendorService {
  // گرفتن لیست وندورها بر اساس نوع پروژه
  async getAllVendors(isForeign = false) {
    try {
      // تبدیل boolean به string برای URL
      const foreignParam = isForeign ? 'true' : 'false';
      const response = await http.get(`/vendors/${foreignParam}`);
      console.log('Vendors API Response for isForeign:', isForeign, response.data);
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

  async createVendor(vendorData) {
    try {
      const apiData = {
        name: vendorData.name?.trim(),
        over_domestic: vendorData.over_domestic || false,
        address: vendorData.address || "",
        contact_person: vendorData.contact_person || "",
        phone: vendorData.phone || "",
        email: vendorData.email || ""
      };
  
      const response = await http.post("/vendors/", apiData);
  
      return {
        id: response.data.id?.toString() || `vendor-${Date.now()}`,
        name: apiData.name,
        address: apiData.address,
        contact_person: apiData.contact_person,
        phone: apiData.phone,
        email: apiData.email,
        over_domestic: apiData.over_domestic
      };
  
    } catch (error) {
      console.error("Error creating vendor:", error);
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