// src/services/reportService.js
import http from "./httpService";

class ReportService {
  // ثبت گزارش جدید در دیتابیس
  async createReport(reportData) {
    try {
      console.log("🎯 ReportService: Sending request to /api/create_report");
      console.log("📋 ReportService: Request data:", reportData);

      const response = await http.post("/create_report", reportData);

      console.log("✅ ReportService: API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ReportService: Error creating report:", error);
      console.error("❌ ReportService: Error URL:", error.config?.url);
      console.error(
        "❌ ReportService: Full URL:",
        error.config?.baseURL + error.config?.url
      );
      throw error;
    }
  }
}

export default new ReportService();