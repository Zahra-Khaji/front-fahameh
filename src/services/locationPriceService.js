import http from "./httpService";

class LocationPriceService {
  // گرفتن لیست تمام تعرفه‌های مکانی
  async getAllLocationPrices() {
    try {
      const response = await http.get("/location_price/");
      //   console.log("Location Prices API Response:", response.data);
      return this.transformLocationPricesData(response.data);
    } catch (error) {
      console.error("Error fetching location prices:", error);
      throw error;
    }
  }

  // گرفتن اطلاعات یک تعرفه مکانی خاص بر اساس ID
  async getLocationPriceById(id) {
    try {
      const response = await http.get(`/location_price/${id}`);
      //   console.log(`Location price details for ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching location price ${id}:`, error);
      throw error;
    }
  }

  // ایجاد تعرفه مکانی جدید
  async createLocationPrice(data) {
    try {
      const apiData = {
        Overlocation: data.Overlocation,
        location: data.location,
        OverDome: data.OverDome,
        Price: parseInt(data.Price) || 0,
        UnitPrice: data.UnitPrice,
      };

      //   console.log("📤 Creating location price with data:", apiData);

      const params = {
        project_name: data.projectName,
        over_dom: data.OverDome,
      };

      const response = await http.post("/location_price/", apiData, { params });
      //   console.log("✅ Location price created successfully:", response.data);

      return {
        id: response.data.id?.toString() || `lp-${Date.now()}`,
        ...apiData,
        ...response.data,
      };
    } catch (error) {
      console.error("❌ Error creating location price:", error);

      let errorMessage = "خطا در ایجاد تعرفه مکانی";

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

  // بروزرسانی تعرفه مکانی
  async updateLocationPrice(id, data) {
    try {
      const apiData = {
        Overlocation: data.Overlocation,
        location: data.location,
        OverDome: data.OverDome,
        Price: parseInt(data.Price) || 0,
        UnitPrice: data.UnitPrice,
      };

      //   console.log(`📤 Updating location price ${id} with data:`, apiData);
      const response = await http.put(`/location_price/${id}`, apiData);
      //   console.log("✅ Location price updated successfully:", response.data);

      return {
        id: id.toString(),
        ...apiData,
        ...response.data,
      };
    } catch (error) {
      console.error(`❌ Error updating location price ${id}:`, error);

      let errorMessage = "خطا در بروزرسانی تعرفه مکانی";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          if (data.detail) {
            errorMessage = data.detail;
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (status === 404) {
          errorMessage = "تعرفه مکانی مورد نظر یافت نشد";
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

  // حذف تعرفه مکانی
  async deleteLocationPrice(id) {
    try {
      console.log(`🗑️ Deleting location price with ID: ${id}`);
      const response = await http.delete(`/location_price/${id}`);
      //   console.log("✅ Location price deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error deleting location price ${id}:`, error);

      let errorMessage = "خطا در حذف تعرفه مکانی";

      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          errorMessage = "تعرفه مکانی مورد نظر یافت نشد";
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
  transformLocationPricesData(apiData) {
    if (Array.isArray(apiData)) {
      return apiData.map((item) => ({
        id: item.ID?.toString() || item.id?.toString(),
        ID: item.ID,
        IDOM: item.IDOM,
        IDP: item.IDP,
        location: item.location || item.Overlocation,
        Price: item.Price,
        Overlocation: item.Overlocation,
        OverDome: item.OverDome,
        UnitPrice: item.UnitPrice,
        projectName: "",
      }));
    }

    console.warn("Invalid location prices data format:", apiData);
    return [];
  }
}

export default new LocationPriceService();
