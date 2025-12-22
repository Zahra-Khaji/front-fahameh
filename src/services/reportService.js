// src/services/reportService.js
import http from "./httpService";
import DateObject from "react-date-object";

class ReportService {
  // ثبت گزارش جدید در دیتابیس

  async createReport(reportData) {
    try {
      console.log("🎯 ReportService: Sending POST request to /reports");
      console.log("📋 ReportService: Request data:", reportData);

      const response = await http.post("/reports", reportData);

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

  // جدید: گرفتن اطلاعات گزارش بر اساس شماره RFI
// src/services/reportService.js
// جدید: گرفتن اطلاعات گزارش بر اساس شماره RFI و شماره گزارش
async getReportInfo(rfiNumbering, reportNumber = null) {
  try {
    console.log("🎯 ReportService: Fetching report for RFI:", rfiNumbering, "Report No:", reportNumber);
    
    let url = `/reports/${rfiNumbering}`;
    
    // اگر شماره گزارش داریم، به query string اضافه کنیم
    if (reportNumber && reportNumber.trim() !== '') {
      url += `?report_number=${encodeURIComponent(reportNumber)}`;
    }

    const response = await http.get(url);

    console.log("✅ ReportService: API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ ReportService: Error fetching report:", error);
    console.error("❌ ReportService: Error URL:", error.config?.url);
    
    if (error.response) {
      console.error("❌ ReportService: Error status:", error.response.status);
      console.error("❌ ReportService: Error data:", error.response.data);
    }
    throw error;
  }
}

  // جدید: آپدیت گزارش موجود
  async updateReport(reportData) {
    try {
      console.log("🎯 ReportService: Updating report:", reportData);

      const response = await http.put("/reports", reportData);

      console.log("✅ ReportService: Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ReportService: Error updating report:", error);

      if (error.response) {
        console.error("❌ ReportService: Error status:", error.response.status);
        console.error("❌ ReportService: Error data:", error.response.data);
      }
      throw error;
    }
  }

  // جدید: تبدیل داده‌های API به فرمت مورد نیاز
  transformReportData(apiData) {
    console.log("📦 Transforming report data:", apiData);

    if (!apiData) {
      return null;
    }

    return {
      reportNumber: apiData.Report_No || "",
      revNumber: apiData.RevNO || "",
      status: apiData.Doc_Status || "",
      corrections: apiData.Remark || "",
      issueDate: apiData.IssueDate || null,
      receivedDate: apiData.ReportReceivedDate || null,
      approvedDays: apiData.App_manday_1stPrice || "",
      unitNumber: apiData.UnitNo || "",
      vendorName: apiData.VendorName || "",
      irn: apiData.IRNNO || "",
      srn: apiData.SRNNO || "",
      user: apiData.User || "",
      dateShamsi: apiData.DateShamsi || "",
      rfiNumbering: apiData.RFI_Numbering || "",
      firstPrice: apiData.FirstPrice || "",
      idre: apiData.IDRE || "",
    };
  }

  // جدید: آماده‌سازی داده برای آپدیت
  // در reportService.js در تابع prepareReportUpdateData:
  prepareReportUpdateData(formData, rfiNumbering) {
    const updateData = {
      rfi_numbering: rfiNumbering, // تغییر: حروف کوچک
      report_no: formData.reportNumber, // تغییر: با underline
      rev_no: formData.revNumber || "", // تغییر: با underline
      Doc_Status: formData.status,
      Remark: formData.corrections || "",
      IssueDate: formData.issueDate || new Date().toISOString().split("T")[0],
      ReportReceivedDate: this.formatDateForAPI(formData.receivedDate),
      App_manday_1stPrice: parseInt(formData.approvedDays) || 0,
      UnitNo: formData.unitNumber || "",
      VendorName: formData.vendorName || "",
      IRNNO: formData.irn || "",
      SRNNo: formData.srn || "", // تغییر: حرف N بزرگ
      user: formData.user || "",
      DateShamsi: formData.dateShamsi || "",
    };

    console.log("📤 Prepared report update data:", updateData);
    return updateData;
  }

  // جدید: فرمت تاریخ برای ارسال به API
  formatDateForAPI(date) {
    if (!date) return null;

    // اگر DateObject هست
    if (date instanceof DateObject && date.format) {
      const persianDate = date.format("YYYY-MM-DD");
      console.log("📅 Persian date for API:", persianDate);
      return persianDate;
    }

    // اگر Date هست
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }

    // اگر رشته هست
    if (typeof date === "string") {
      if (date.includes("/")) {
        const parts = date.split("/");
        if (parts.length === 3) {
          return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(
            2,
            "0"
          )}`;
        }
      }
      return date;
    }

    console.warn("⚠️ Unknown date format for report:", date);
    return null;
  }
}

export default new ReportService();
