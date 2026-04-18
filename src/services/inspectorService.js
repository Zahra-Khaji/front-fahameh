import http from './httpService';

class InspectorService {
  // گرفتن لیست تمام بازرس‌ها
 // گرفتن لیست تمام بازرس‌ها - اضافه کردن پارامتر isActive
 async getAllInspectors(isActive = true) {
  try {
    const response = await http.get('/inspectors/', {
      params: {
        is_active: isActive
      }
    });
    console.log(`Inspectors API Response (is_active=${isActive}):`, response.data);
    return this.transformInspectorsData(response.data);
  } catch (error) {
    console.error('Error fetching inspectors:', error);
    throw error;
  }
}

  // گرفتن اطلاعات یک بازرس خاص
  async getInspectorById(id) {
    try {
      const response = await http.get(`/inspectors/${id}`);
      console.log(`Inspector details API Response for ID ${id}:`, response.data);
      return this.transformInspectorDetails(response.data, id);
    } catch (error) {
      console.error(`Error fetching inspector ${id}:`, error);
      throw error;
    }
  }

  // ایجاد بازرس جدید
  async createInspector(data) {
    try {
      console.log('📤 Creating inspector with data:', data);
      const response = await http.post('/inspectors/', data);
      console.log('✅ Inspector created successfully:', response.data);
      
      // تبدیل پاسخ به فرمت استاندارد
      return {
        id: response.data.id || response.data.ID,
        ...data,
        ...response.data
      };
    } catch (error) {
      console.error('❌ Error creating inspector:', error);
      
      let errorMessage = "خطا در ایجاد بازرس";
      
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

  // **جدید: بروزرسانی بازرس**
  async updateInspector(id, data) {
    try {
      console.log(`📤 Updating inspector ${id} with data:`, data);
      const response = await http.put(`/inspectors/${id}`, data);
      console.log('✅ Inspector updated successfully:', response.data);
      
      return {
        id: id,
        ...data,
        ...response.data
      };
    } catch (error) {
      console.error(`❌ Error updating inspector ${id}:`, error);
      
      let errorMessage = "خطا در بروزرسانی بازرس";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 404) {
          errorMessage = "بازرس مورد نظر یافت نشد";
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

  // **جدید: حذف بازرس**
  async deleteInspector(id) {
    try {
      console.log(`🗑️ Deleting inspector with ID: ${id}`);
      const response = await http.delete(`/inspectors/${id}`);
      console.log('✅ Inspector deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting inspector ${id}:`, error);
      
      let errorMessage = "خطا در حذف بازرس";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "بازرس مورد نظر یافت نشد";
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

  // تبدیل داده‌های دریافتی از API به فرمت مورد نیاز کامپوننت
  transformInspectorsData(apiData) {
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData).map(([id, inspector]) => {
        // اگر inspector یک شیء است (با فیلدهای مختلف)
        if (typeof inspector === 'object' && inspector !== null) {
          return {
            id: id.toString(),
            name: inspector.Inspector_Name || inspector.name || "بدون نام",
            Inspector_Name: inspector.Inspector_Name || inspector.name,
            PersonnelCode: inspector.PersonnelCode || "",
            Inspector_Discipline: inspector.Inspector_Discipline || "",
            Inspector_Email: inspector.Inspector_Email || "",
            Inspector_phone_no: inspector.Inspector_phone_no || "",
            Location_Coverd: inspector.Location_Coverd || "",
            status: inspector.status || "Active",
            Price: inspector.Price || "",
            OVRDom: inspector.OVRDom || "Domestic",
            Price1403: inspector.Price1403 || ""
          };
        }
        
        // اگر فقط یک string است (برای سازگاری با نسخه قبلی)
        return {
          id: id.toString(),
          name: inspector || "بدون نام",
          Inspector_Name: inspector || "بدون نام",
          PersonnelCode: "",
          Inspector_Discipline: "",
          Inspector_Email: "",
          Inspector_phone_no: "",
          Location_Coverd: "",
          status: "Active",
          Price: "",
          OVRDom: "Domestic",
          Price1403: ""
        };
      });
    }
    
    console.warn('Invalid inspectors data format:', apiData);
    return [];
  }

  // تبدیل داده‌های جزئیات بازرس
  transformInspectorDetails(apiData, inspectorId) {
    if (typeof apiData === 'object' && apiData !== null) {
      return {
        id: inspectorId.toString(),
        name: apiData.Inspector_Name || '',
        Inspector_Name: apiData.Inspector_Name || '',
        PersonnelCode: apiData.PersonnelCode || '',
        Inspector_Discipline: apiData.Inspector_Discipline || '',
        Inspector_Email: apiData.Inspector_Email || '',
        Inspector_phone_no: apiData.Inspector_phone_no || '',
        Location_Coverd: apiData.Location_Coverd || '',
        status: apiData.status || 'Active',
        Price: apiData.Price || '',
        OVRDom: apiData.OVRDom || 'Domestic',
        Price1403: apiData.Price1403 || '',
        location: apiData.Location_Coverd || '',
        phone: apiData.Inspector_phone_no || '',
        email: apiData.Inspector_Email || '',
        expertise: apiData.Inspector_Discipline || '',
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
      Inspector_Name: '',
      PersonnelCode: '',
      Inspector_Discipline: '',
      Inspector_Email: '',
      Inspector_phone_no: '',
      Location_Coverd: '',
      status: 'Active',
      Price: '',
      OVRDom: 'Domestic',
      Price1403: '',
      location: '',
      phone: '',
      email: '',
      expertise: '',
      fee: ''
    };
  }
}

export default new InspectorService();