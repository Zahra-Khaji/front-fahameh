// src/services/rfiService.js
import http from './httpService';
import authService from './authService';

class RFIService {
  // دریافت گزارش RFI بر اساس نام پروژه
  async getRFIReport(projectName) {
    if (!projectName) {
      throw new Error('نام پروژه الزامی است');
    }

    try {
      console.log('در حال دریافت گزارش RFI برای پروژه:', projectName);

      const response = await http.get(
        `/reports/rfi/?project_name=${encodeURIComponent(projectName)}`,
        {
          headers: authService.getAuthHeader(),
          timeout: 10000,
        }
      );

      console.log('گزارش RFI دریافت شد:', response.data);
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت گزارش RFI:', error);
      
      let errorMessage = 'خطا در دریافت گزارش RFI';
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      error.response.data?.message || 
                      `خطا: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'سرور پاسخ نمی‌دهد';
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // دریافت اطلاعات یک RFI خاص
  async getRFIById(rfiId) {
    if (!rfiId) {
      throw new Error('شناسه RFI الزامی است');
    }

    try {
      console.log('در حال دریافت اطلاعات RFI با شناسه:', rfiId);

      const response = await http.get(
        `/reports/rfi/${rfiId}`,
        {
          headers: authService.getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error(`خطا در دریافت RFI با شناسه ${rfiId}:`, error);
      throw error;
    }
  }

  // ایجاد RFI جدید
  async createRFI(rfiData) {
    try {
      console.log('در حال ایجاد RFI جدید:', rfiData);

      const response = await http.post(
        '/reports/rfi/',
        rfiData,
        {
          headers: {
            ...authService.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('RFI با موفقیت ایجاد شد:', response.data);
      return response.data;
    } catch (error) {
      console.error('خطا در ایجاد RFI:', error);
      
      let errorMessage = 'خطا در ایجاد RFI';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'داده‌های ارسالی نامعتبر است';
        } else if (error.response.status === 409) {
          errorMessage = 'RFI با این مشخصات قبلاً ثبت شده است';
        }
        errorMessage = error.response.data?.detail || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  }

  // بروزرسانی RFI
  async updateRFI(rfiId, updateData) {
    try {
      console.log(`در حال بروزرسانی RFI با شناسه ${rfiId}:`, updateData);

      const response = await http.put(
        `/reports/rfi/${rfiId}`,
        updateData,
        {
          headers: {
            ...authService.getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`خطا در بروزرسانی RFI ${rfiId}:`, error);
      throw error;
    }
  }

  // حذف RFI
  async deleteRFI(rfiId) {
    try {
      console.log('در حال حذف RFI با شناسه:', rfiId);

      const response = await http.delete(
        `/reports/rfi/${rfiId}`,
        {
          headers: authService.getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error(`خطا در حذف RFI ${rfiId}:`, error);
      throw error;
    }
  }

  // جستجوی RFI با فیلترهای مختلف
  async searchRFI(filters = {}) {
    try {
      console.log('در حال جستجوی RFI با فیلترها:', filters);

      // ساخت query string از فیلترها
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = `/reports/rfi/search/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await http.get(url, {
        headers: authService.getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error('خطا در جستجوی RFI:', error);
      throw error;
    }
  }

  // دریافت آمار RFI
  async getRFIStats(projectName = null) {
    try {
      console.log('در حال دریافت آمار RFI برای پروژه:', projectName);

      const url = projectName 
        ? `/reports/rfi/stats/?project_name=${encodeURIComponent(projectName)}`
        : '/reports/rfi/stats/';

      const response = await http.get(url, {
        headers: authService.getAuthHeader(),
      });

      return response.data;
    } catch (error) {
      console.error('خطا در دریافت آمار RFI:', error);
      throw error;
    }
  }

  // دریافت آخرین RFI‌ها
  async getRecentRFIs(limit = 10) {
    try {
      console.log('در حال دریافت آخرین RFI‌ها:', limit);

      const response = await http.get(
        `/reports/rfi/recent/?limit=${limit}`,
        {
          headers: authService.getAuthHeader(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('خطا در دریافت آخرین RFI‌ها:', error);
      throw error;
    }
  }
}

// ایجاد یک instance از سرویس
const rfiService = new RFIService();

export default rfiService;