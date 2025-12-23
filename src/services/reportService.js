// src/services/reportService.js
import http from "./httpService";
import DateObject from "react-date-object";

class ReportService {
  // ثبت گزارش جدید در دیتابیس

  async createReport(reportData) {
    try {
      const response = await http.post("/reports", reportData);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // جدید: گرفتن اطلاعات گزارش بر اساس شماره RFI و شماره گزارش
  async getReportInfo(rfiNumbering, reportNumber = null) {
    try {
      let url = `/reports/${rfiNumbering}`;

      // اگر شماره گزارش داریم، به query string اضافه کنیم
      if (reportNumber && reportNumber.trim() !== "") {
        url += `?report_number=${encodeURIComponent(reportNumber)}`;
      }

      const response = await http.get(url);

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

  // src/services/reportService.js

  async updateReport(rfiNumbering, reportData) {
    // تغییر: دو پارامتر
    try {
      // ساخت URL با rfiNumbering در path
      const url = `/reports/${encodeURIComponent(rfiNumbering)}`;

      const response = await http.put(url, reportData);

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
  async getReportStatuses() {
    try {
      const response = await http.get("/lookups/report-statuses");

      // لاگ برای دیباگ
      console.log("📋 Report statuses from API:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching report statuses:", error);

      // در صورت خطا، وضعیت‌های پیش‌فرض را برگردان
      return {
        5: "approved",
        10: "Objection",
      };
    }
  }
  // اصلاح تابع prepareReportUpdateData:
  prepareReportUpdateData(formData) {
    // rfiNumbering حذف شد چون در URL می‌رود
    const updateData = {
      report_no: formData.reportNumber,
      rev_no: formData.revNumber || "",
      Doc_Status: formData.status,
      Remark: formData.corrections || "",
      IssueDate: formData.issueDate || new Date().toISOString().split("T")[0],
      ReportReceivedDate: this.formatDateForAPI(formData.receivedDate),
      App_manday_1stPrice: parseInt(formData.approvedDays) || 0,
      UnitNo: formData.unitNumber || "",
      VendorName: formData.vendorName || "",
      IRNNO: formData.irn || "",
      SRNNo: formData.srn || "",
      user: formData.user || "",
      DateShamsi: formData.dateShamsi || "",
    };

    return updateData;
  }

  // جدید: تبدیل داده‌های API به فرمت مورد نیاز
  transformReportData(apiData) {
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

    return updateData;
  }

  // جدید: فرمت تاریخ برای ارسال به API
  formatDateForAPI(date) {
    if (!date) return null;

    // اگر DateObject هست
    if (date instanceof DateObject && date.format) {
      const persianDate = date.format("YYYY-MM-DD");

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
