// src/services/inspectionService.js
import http from "./httpService";

class InspectionService {
  // ثبت اطلاعات بازرسی و نوتیفیکیشن در دیتابیس
  async createInspectionNote(inspectionData) {
    try {
      console.log("🎯 InspectionService: Sending request to /api/create_note");

     
      const response = await http.post("/notifications/", inspectionData);

      console.log("✅ InspectionService: API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ InspectionService: Error creating inspection note:",
        error
      );
      console.error("❌ InspectionService: Error URL:", error.config?.url);
      console.error(
        "❌ InspectionService: Full URL:",
        error.config?.baseURL + error.config?.url
      );
      throw error;
    }
  }
}

export default new InspectionService();
