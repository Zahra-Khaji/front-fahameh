// src/services/notificationService.js
import http from "./httpService";

class NotificationService {
  // گرفتن شماره نوتیفیکیشن بعدی از بک‌اند
  async getNextNotificationNumber(projectId, projectTypeId) {
    try {
      const response = await http.get(
        `/projects/${projectId}/rfi/next?in_out=${projectTypeId}`
      );
      // console.log('Next notification API response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching next notification number:", error);
      throw error;
    }
  }

  // گرفتن اطلاعات کامل نوتیفیکیشن بر اساس شماره RFI
  async getNotificationInfo(rfiNumber) {
    try {
      // console.log("🎯 NotificationService: Fetching notification for RFI:", rfiNumber);
      const response = await http.get(`/notifications/${rfiNumber}`);
      // console.log("✅ NotificationService: API response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ NotificationService: Error fetching notification:",
        error
      );
      console.error("❌ NotificationService: Error URL:", error.config?.url);
      throw error;
    }
  }

  // گرفتن لیست وضعیت‌های نوتیفیکیشن
  async getNotificationStatuses() {
    try {
      // console.log("🎯 NotificationService: Fetching notification statuses");
      const response = await http.get("/notifications/statuses");
      // console.log("✅ NotificationService: Statuses response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ NotificationService: Error fetching statuses:", error);

      // در صورت خطا، وضعیت‌های پیش‌فرض را برگردان
      return {
        1: "Cancel",
        2: "Done",
        3: "Ongoing",
        4: "در حال انجام",
      };
    }
  }

  // src/services/notificationService.js

  // متد جدید برای آپدیت هر ردیف از جدول نوتیفیکیشن
  async updateNotificationInfoRow(rfiNumber, rowData) {
    try {
      // console.log("🎯 Updating notification info row for RFI:", rfiNumber);
      // console.log("📦 Row data received:", rowData);

      // ساخت payload مطابق API
      const payload = {
        NotificationNo: rowData.notificationNumber,
        RFI_Status: rowData.rfiStatus || rowData.statusEnglish || "Ongoing",
        Inspector_Type: rowData.inspectorType || "فریلنسر",
        Goods_Description: rowData.goodsDescription || "",
        RFI_Recived_Date: this.formatDateForAPI(rowData.receivedDate),
        InspectionLocation: rowData.location || "",
        InspectionDate: this.formatDateForAPI(rowData.inspectionDate),
        VendorName: rowData.vendorName || "",
        approved_Duration: rowData.approvedDuration || "0",
        Inspector_Name: rowData.inspectorName || "",
        Remark: rowData.remark || "",
        FolderNo: String(rowData.folderNumber || ""),
      };

      // console.log("📤 Final payload for API:", payload);

      // درخواست PUT با rfiNumber در query parameter
      const response = await http.put(
        `/notifications/notification/?rfi_number=${rfiNumber}`,
        payload
      );

      // console.log("✅ Notification info update successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Notification info update failed:", error);
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      }
      throw error;
    }
  }

  // src/services/notificationService.js
// متد جدید برای حذف یک تاریخ خاص از نوتیفیکیشن
async deleteNotificationDate(rfiNumbering, date_) {
  try {
    console.log("🗑️ Deleting notification date for RFI:", rfiNumbering, "Date:", date_);
    
    // ساخت URL مطابق API مورد نظر
    const response = await http.delete(
      `/notifications/one_date/?rfi_numbering=${encodeURIComponent(rfiNumbering)}&date_=${encodeURIComponent(date_)}`
    );
    
    console.log("✅ Notification date deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting notification date:", error);
    if (error.response) {
      console.error("❌ Response status:", error.response.status);
      console.error("❌ Response data:", error.response.data);
    }
    throw error;
  }
}

  // src/services/notificationService.js

  // اضافه کردن متد جدید برای آپدیت ردیف‌های جدول تاریخ‌های بازرسی
  async updateNotificationRow(rfiNumber, rowData) {
    try {
      // console.log("🎯 Updating notification row for RFI:", rfiNumber);
      // console.log("📦 Row data received:", rowData);

      // اطمینان حاصل کنیم که مقادیر عددی هستند
      const payload = {
        ApproveManday: parseInt(rowData.approveManday) || 0,
        IDRD: parseInt(rowData.idrd) || 0,
        InspectorPrice: parseFloat(rowData.fee) || 0,
      };

      // console.log("📤 Final payload for API:", payload);

      // **تغییر مهم: ارسال درخواست PUT به آدرس جدید**
      // rfiNumber در path قرار می‌گیرد
      const response = await http.put(`/notifications/${rfiNumber}`, payload);

      // console.log("✅ Update successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Update failed:", error);
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      }
      throw error;
    }
  }

    // متد جدید: حذف نوتیفیکیشن
    async deleteNotification(rfiNumbering) {
      try {
        // console.log("🗑️ Deleting notification:", rfiNumbering);
        const response = await http.delete(
          `/notifications/notification/?rfi_numbering=${encodeURIComponent(rfiNumbering)}`
        );
        // console.log("✅ Notification deleted successfully:", response.data);
        return response.data;
      } catch (error) {
        console.error("❌ Error deleting notification:", error);
        if (error.response) {
          console.error("❌ Response status:", error.response.status);
          console.error("❌ Response data:", error.response.data);
        }
        throw error;
      }
    }

  // آپدیت اطلاعات نوتیفیکیشن
  async updateNotificationInfo(notificationData) {
    try {
      // console.log("🎯 NotificationService: Updating notification:", notificationData);
      const response = await http.put("/notification", notificationData);
      // console.log("✅ NotificationService: Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ NotificationService: Error updating notification:",
        error
      );
      throw error;
    }
  }

  // تبدیل داده‌های API به فرمت مورد نیاز کامپوننت
  transformNotificationData(apiData) {
    if (!apiData || apiData.length === 0) {
      return { timeTable: null, rfiDates: [] };
    }

    const firstItem = apiData[0];
    return {
      timeTable: firstItem.TimeTable || null,
      rfiDates: firstItem.RFI_Dates || [],
    };
  }

  // ساخت داده‌های قابل ارسال برای آپدیت
  prepareUpdateData(timeTableRows, rfiDatesRows, statusesData) {
    return {
      notifications: timeTableRows.map((row) => {
        // تبدیل وضعیت فارسی به انگلیسی
        let englishStatus = "Ongoing"; // پیش‌فرض
        if (statusesData && row.statusCode) {
          englishStatus =
            statusesData[row.statusCode] || row.statusEnglish || "Ongoing";
        } else if (row.statusEnglish) {
          englishStatus = row.statusEnglish;
        }

        return {
          RFI_Numbering: row.notificationNumber,
          RFI_Status: englishStatus, // استفاده از متن انگلیسی
          Inspector_Type: row.inspectorType,
          Remark: row.description,
          RFI_Recived_Date: this.formatDateForAPI(row.receivedDate),
          InspectionLocation: row.location,
          InspectionDate: this.formatDateForAPI(row.inspectionDate),
          VendorName: row.vendorName,
          Inspection_Duration: row.duration,
          Inspector_Name: row.inspectorName,
          FolderNo: row.folderNumber,
          Material: row.material,
          Goods_Description: row.goodsDescription,
          QTY_3rdpartinspector: row.qty3rdPartyInspector,
          approved_Duration: row.approvedDuration,
        };
      }),
      rfi_dates: rfiDatesRows.map((row) => ({
        RFI_Date: this.formatDateForAPI(row.inspectionDate),
        ApproveManday:
          row.approveManday === "-" ? null : parseInt(row.approveManday) || 0,
        Inspector_Name: row.inspectorName,
        InspectorPrice: parseFloat(row.fee?.replace(/[^0-9.]/g, "")) || 0,
      })),
    };
  }

  // فرمت تاریخ برای ارسال به API
  formatDateForAPI(date) {
    if (!date) return null;

    if (date instanceof Date) {
      return date.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    if (date.format) {
      const formatted = date.format("YYYY-MM-DD");
      return formatted.replace(/\//g, "-"); // تبدیل / به -
    }

    return date;
  }
}

export default new NotificationService();
