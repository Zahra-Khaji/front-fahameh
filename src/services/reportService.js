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

  async deleteReport(reportNumber) {
    try {
      const response = await http.delete(
        `/reports/report/?report_no=${encodeURIComponent(reportNumber)}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ ReportService: Error deleting report:", error);
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
      // console.log("📋 Report statuses from API:", response.data);

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

  // در reportService.js - متد را با logging کامل اضافه کنید:
  async getSuggestedReportNo(rfiNumbering, reportNo, revNo = "rev") {
    // اعتبارسنجی
    if (!rfiNumbering || rfiNumbering.trim() === "") {
      console.error("❌ rfiNumbering خالی است");
      throw new Error("rfi_numbering is required");
    }

    if (!reportNo || reportNo.trim() === "") {
      console.error("❌ reportNo خالی است");
      throw new Error("report_no is required");
    }

    try {
      // لاگ کامل URL و پارامترها
      const params = {
        rfi_numbering: rfiNumbering,
        report_no: reportNo,
        rev_no: revNo || "rev",
      };

      // console.log('📤 ارسال درخواست به API با پارامترها:', params);
      // console.log('🌐 URL کامل:', '/reports/suggest_report_no/', params);

      const response = await http.get("/reports/suggest_report_no/", {
        params: params,
      });

      // console.log('✅ دریافت پاسخ از API:', response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ReportService: خطا در دریافت شماره پیشنهادی:", error);
      console.error("❌ جزئیات خطا:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  }

  // اضافه کردن این متد به کلاس ReportService

  // متد برای ذخیره نهایی تغییرات مالی
  async updateFinalFinancial(financialData) {
    try {
      console.log(
        "📊 ReportService.updateFinalFinancial - داده‌های دریافتی:",
        financialData
      );

      const response = await http.put(
        "/manager/update-final-financial",
        financialData
      );

      console.log("✅ پاسخ از سرور:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ReportService.updateFinalFinancial - خطا:", error);
      console.error("❌ جزئیات خطا:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  // در src/services/reportService.js - متد getDailyReportPDF را اصلاح کنید:

  async getDailyReport(year, month, overDomestic, fileType = "excel") {
    try {
      // console.log('📊 ReportService.getDailyReport - پارامترهای ورودی:', {
      //   year,
      //   month,
      //   overDomestic,
      //   fileType,
      //   typeOf_year: typeof year,
      //   typeOf_month: typeof month,
      //   typeOf_overDomestic: typeof overDomestic,
      // });

      // اعتبارسنجی
      if (
        !year ||
        !month
        // || !overDomestic
      ) {
        console.error("❌ پارامترهای ضروری خالی هستند:", {
          year: !!year,
          month: !!month,
          overDomestic: !!overDomestic,
        });
        throw new Error("تمام پارامترها (سال، ماه) الزامی هستند");
      }

      const params = {
        year: year,
        month: month,
        over_domestic: overDomestic,
      };

      // console.log('📤 ارسال درخواست به API با پارامترها:', params);
      // console.log('🌐 URL کامل: /pdf_reports/daily-report/', params);

      // تعیین هدر Accept بر اساس نوع فایل درخواستی
      let acceptHeader;
      if (fileType === "excel") {
        acceptHeader =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (fileType === "pdf") {
        acceptHeader = "application/pdf";
      } else {
        acceptHeader = "*/*"; // هر نوعی
      }

      // console.log('📋 هدر Accept ارسالی:', acceptHeader);

      const response = await http.get("/pdf_reports/daily-report/", {
        params: params,
        responseType: "blob",
        headers: {
          Accept: acceptHeader,
        },
      });

      // console.log('✅ دریافت پاسخ از API - نوع پاسخ:', response.headers['content-type']);
      // console.log('✅ اندازه پاسخ:', response.data.size, 'bytes');
      // console.log('✅ هدرهای پاسخ:', response.headers);

      return {
        blob: response.data,
        contentType:
          response.headers["content-type"] || response.headers["Content-Type"],
        fileName: this.generateFileName(year, month, overDomestic, fileType),
      };
    } catch (error) {
      console.error("❌ ReportService: خطا در دریافت گزارش روزانه:", error);
      console.error("❌ جزئیات خطا:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  // متد جدید برای تولید نام فایل
  generateFileName(year, month, overDomestic, fileType) {
    const cleanProjectType = overDomestic.replace(/\s+/g, "_");
    const cleanMonth = month.replace(/\s+/g, "_");

    let extension;
    if (fileType === "excel") {
      extension = "xlsx";
    } else if (fileType === "pdf") {
      extension = "pdf";
    } else {
      extension = "file";
    }

    return `گزارش_روزانه_${year}_${cleanMonth}_${cleanProjectType}.${extension}`;
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

  async getFinancialSummary(year, month) {
    try {
      console.log("📊 ReportService.getFinancialSummary - پارامترهای ورودی:", {
        year,
        month,
        typeOf_year: typeof year,
        typeOf_month: typeof month,
      });

      // اعتبارسنجی
      if (!year || !month) {
        console.error("❌ پارامترهای ضروری خالی هستند:", {
          year: !!year,
          month: !!month,
        });
        throw new Error("سال و ماه الزامی هستند");
      }

      const params = {
        year: year.toString(),
        month: month,
      };

      // console.log('📤 ارسال درخواست به API با پارامترها:', params);
      // console.log('🌐 URL کامل: /manager/financial-summary/');

      const response = await http.get("/manager/financial-summary/", {
        params: params,
        headers: {
          accept: "application/json",
        },
      });

      // console.log('✅ دریافت پاسخ از API:', response.data);
      return response.data;
    } catch (error) {
      console.error("❌ ReportService: خطا در دریافت خلاصه مالی:", error);
      console.error("❌ جزئیات خطا:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  }

  // اضافه کردن این متد به کلاس ReportService

  // گرفتن صورت وضعیت بازرسین (خلاصه مالی بازرسان)
  async getInspectorFinancialSummary(year, month) {
    try {
      console.log(
        "📊 ReportService.getInspectorFinancialSummary - پارامترها:",
        {
          year,
          month,
        }
      );

      if (!year || !month) {
        throw new Error("سال و ماه الزامی هستند");
      }

      const params = {
        year: year.toString(),
        month: month,
      };

      const response = await http.get("/manager/financial-summary-final", {
        params: params,
        headers: {
          accept: "application/json",
        },
      });

      console.log("✅ دریافت پاسخ از API:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ ReportService: خطا در دریافت صورت وضعیت بازرسین:",
        error
      );
      throw error;
    }
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
