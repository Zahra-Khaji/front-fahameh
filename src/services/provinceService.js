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
      const response = await http.get(`/locations/cities/?province_id=${provinceId}`);
      console.log(`Cities API Response for province ${provinceId}:`, response.data);
      return this.transformCitiesData(response.data);
    } catch (error) {
      console.error(`Error fetching cities for province ${provinceId}:`, error);
      throw error;
    }
  }

  // ایجاد استان جدید
  async createProvince(provinceData) {
    try {
      const apiData = {
        name: provinceData.name?.trim()
      };
  
      console.log('📤 Creating province with data:', apiData);
      const response = await http.post('/locations/provinces', apiData);
      console.log('✅ Province created successfully:', response.data);
  
      return {
        id: response.data.id?.toString() || `province-${Date.now()}`,
        name: apiData.name
      };
    } catch (error) {
      console.error('❌ Error creating province:', error);
      
      let errorMessage = "خطا در ایجاد استان";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // **جدید: بروزرسانی استان**
  async updateProvince(id, provinceData) {
    try {
      const apiData = {
        name: provinceData.name?.trim()
      };
  
      console.log(`📤 Updating province ${id} with data:`, apiData);
      const response = await http.put(`/locations/provinces/${id}`, apiData);
      console.log('✅ Province updated successfully:', response.data);
  
      return {
        id: id.toString(),
        name: apiData.name
      };
    } catch (error) {
      console.error(`❌ Error updating province ${id}:`, error);
      
      let errorMessage = "خطا در بروزرسانی استان";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 404) {
          errorMessage = "استان مورد نظر یافت نشد";
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // **جدید: حذف استان**
  async deleteProvince(id) {
    try {
      console.log(`🗑️ Deleting province with ID: ${id}`);
      const response = await http.delete(`/locations/provinces/${id}`);
      console.log('✅ Province deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting province ${id}:`, error);
      
      let errorMessage = "خطا در حذف استان";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "استان مورد نظر یافت نشد";
        } else if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // ایجاد شهر جدید
  async createCity(cityData) {
    try {
      const apiData = {
        name: cityData.name?.trim(),
        province_id: Number(cityData.province_id)
      };
  
      console.log('📤 Creating city with data:', apiData);
      const response = await http.post('/locations/cities', apiData);
      console.log('✅ City created successfully:', response.data);
  
      return {
        id: response.data.id?.toString() || `city-${Date.now()}`,
        name: apiData.name,
        province_id: apiData.province_id
      };
    } catch (error) {
      console.error('❌ Error creating city:', error);
      
      let errorMessage = "خطا در ایجاد شهر";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // **جدید: بروزرسانی شهر**
  async updateCity(id, cityData) {
    try {
      const apiData = {
        name: cityData.name?.trim(),
        province_id: Number(cityData.province_id)
      };
  
      console.log(`📤 Updating city ${id} with data:`, apiData);
      const response = await http.put(`/locations/cities/${id}`, apiData);
      console.log('✅ City updated successfully:', response.data);
  
      return {
        id: id.toString(),
        name: apiData.name,
        province_id: apiData.province_id
      };
    } catch (error) {
      console.error(`❌ Error updating city ${id}:`, error);
      
      let errorMessage = "خطا در بروزرسانی شهر";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "شهر مورد نظر یافت نشد";
        } else if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // **جدید: حذف شهر**
  async deleteCity(id) {
    try {
      console.log(`🗑️ Deleting city with ID: ${id}`);
      const response = await http.delete(`/locations/cities/${id}`);
      console.log('✅ City deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting city ${id}:`, error);
      
      let errorMessage = "خطا در حذف شهر";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "شهر مورد نظر یافت نشد";
        } else if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 401) {
          errorMessage = "دسترسی غیرمجاز";
        } else if (status === 500) {
          errorMessage = "خطای سرور";
        }
      }
      
      const customError = new Error(errorMessage);
      customError.originalError = error;
      throw customError;
    }
  }

  // تبدیل داده‌های استان‌ها
  transformProvincesData(apiData) {
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