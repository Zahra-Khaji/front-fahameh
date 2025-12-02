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

  // **افزودن وندور جدید**
  async createVendor(vendorData) {
    try {
      console.log('📤 Creating new vendor:', vendorData);
      
      // داده‌های ارسالی به API (فقط name)
      const apiData = {
        name: vendorData.name.trim()
      };

      console.log('📤 Sending to /create_new_vendor:', apiData);
      
      const response = await http.post('/create_new_vendor', apiData);
      console.log('✅ Vendor created successfully:', response.data);
      
      // پاسخ API: { "message": "Created new vendor successfully", "data": 4007 }
      const newVendorId = response.data.data || `vendor-${Date.now()}`;
      
      return {
        id: newVendorId.toString(),
        name: vendorData.name.trim(),
        address: vendorData.address || '',
        phone: vendorData.phone || '',
        email: vendorData.email || '',
        isTemp: false
      };
    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      
      // مدیریت خطا
      let errorMessage = 'خطا در ایجاد وندور';
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400 || status === 409) {
          if (data.detail) {
            // خطای تکراری بودن
            if (data.detail.includes('already exists') || data.detail.includes('تکراری')) {
              errorMessage = `نام وندور "${vendorData.name}" تکراری است. لطفاً نام دیگری انتخاب کنید.`;
            } else {
              errorMessage = data.detail;
            }
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = 'دسترسی غیرمجاز. لطفاً دوباره وارد شوید.';
        } else if (status === 500) {
          errorMessage = 'خطای سرور. لطفاً دوباره تلاش کنید.';
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      customError.vendorData = vendorData;
      
      throw customError;
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