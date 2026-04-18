import http from './httpService';

class VendorService {
  // گرفتن لیست وندورها بر اساس نوع پروژه
  async getAllVendors(isForeign = false) {
    try {
      const foreignParam = isForeign ? 'true' : 'false';
      const response = await http.get(`/vendors/${foreignParam}`);
      console.log('Vendors API Response for isForeign:', isForeign, response.data);
      return this.transformVendorsData(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک وندور خاص بر اساس ID (متد قبلی - بدون تغییر)
  async getVendorById(id) {
    try {
      const response = await http.get(`/vendors/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vendor ${id}:`, error);
      throw error;
    }
  }

  // **جدید: متد مخصوص ویرایش وندور - دریافت جزئیات کامل**
  async getVendorDetailForEdit(id) {
    try {
      console.log(`📤 Fetching vendor detail for edit with ID: ${id}`);
      const response = await http.get(`/vendors/detail/${id}`);
      console.log('✅ Vendor detail response:', response.data);
      
      // تبدیل پاسخ به فرمت استاندارد
      return {
        id: response.data.id?.toString(),
        name: response.data.name || "",
        address: response.data.address || "",
        contact_person: response.data.contact_person || "",
        phone: response.data.phone || "",
        email: response.data.email || "",
        over_domestic: response.data.over_domestic || false
      };
    } catch (error) {
      console.error(`❌ Error fetching vendor detail for edit ${id}:`, error);
      
      let errorMessage = "خطا در دریافت اطلاعات وندور";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "وندور مورد نظر یافت نشد";
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

  // ایجاد وندور جدید
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
  
      console.log('📤 Creating vendor with data:', apiData);
      const response = await http.post("/vendors/", apiData);
      console.log('✅ Vendor created successfully:', response.data);
  
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
      console.error("❌ Error creating vendor:", error);
      
      let errorMessage = "خطا در ایجاد وندور";
      
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

  // بروزرسانی وندور بر اساس ID
  async updateVendor(id, vendorData) {
    try {
      const apiData = {
        name: vendorData.name?.trim(),
        over_domestic: vendorData.over_domestic || false,
        address: vendorData.address || "",
        contact_person: vendorData.contact_person || "",
        phone: vendorData.phone || "",
        email: vendorData.email || ""
      };
  
      console.log(`📤 Updating vendor ${id} with data:`, apiData);
      const response = await http.put(`/vendors/${id}`, apiData);
      console.log('✅ Vendor updated successfully:', response.data);
  
      return {
        id: id.toString(),
        name: apiData.name,
        address: apiData.address,
        contact_person: apiData.contact_person,
        phone: apiData.phone,
        email: apiData.email,
        over_domestic: apiData.over_domestic
      };
    } catch (error) {
      console.error(`❌ Error updating vendor ${id}:`, error);
      
      let errorMessage = "خطا در بروزرسانی وندور";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 404) {
          errorMessage = "وندور مورد نظر یافت نشد";
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

  // حذف وندور بر اساس NAME
  async deleteVendor(name) {
    try {
      console.log(`🗑️ Deleting vendor with name: ${name}`);
      const response = await http.delete(`/vendors/${encodeURIComponent(name)}/`);
      console.log('✅ Vendor deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting vendor ${name}:`, error);
      
      let errorMessage = "خطا در حذف وندور";
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 404) {
          errorMessage = "وندور مورد نظر یافت نشد";
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
  transformVendorsData(apiData) {
    if (typeof apiData === 'object' && apiData !== null) {
      return Object.entries(apiData)
        .filter(([id, vendor]) => {
          if (typeof vendor === 'object' && vendor !== null) {
            const name = vendor.name?.toString().trim() || '';
            return name && name !== '' && name !== '-';
          }
          const name = vendor?.toString().trim() || '';
          return name && name !== '' && name !== '-';
        })
        .map(([id, vendor]) => {
          if (typeof vendor === 'object' && vendor !== null) {
            return {
              id: id.toString(),
              name: vendor.name || "",
              address: vendor.address || "",
              contact_person: vendor.contact_person || "",
              phone: vendor.phone || "",
              email: vendor.email || "",
              over_domestic: vendor.over_domestic || false
            };
          }
          return {
            id: id.toString(),
            name: this.cleanVendorName(vendor.toString()),
            address: "",
            contact_person: "",
            phone: "",
            email: "",
            over_domestic: false
          };
        });
    }
    
    console.warn('Invalid vendors data format:', apiData);
    return [];
  }

  // تمیز کردن نام وندور
  cleanVendorName(name) {
    return name
      .trim()
      .replace(/\r\n/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\s+/, '');
  }
}

export default new VendorService();