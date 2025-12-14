// src/services/notificationService.js
import http from './httpService';

class NotificationService {
  // گرفتن شماره نوتیفیکیشن بعدی از بک‌اند
  async getNextNotificationNumber(projectId, projectTypeId) {
    try {
      // const response = await http.get('/next-rfi-full', {
      //   params: {
      //     idp: projectId,
      //     in_out: projectTypeId
      //   }
      // }
      
      // )
      const response = await http.get(`/projects/${projectId}/rfi/next?in_out=${projectTypeId}`);
      
      ;
      
      console.log('Next notification API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching next notification number:', error);
      throw error;
    }
  }

  // گرفتن اطلاعات کامل نوتیفیکیشن بر اساس شماره RFI
  async getNotificationInfo(rfiNumber) {
    try {
      console.log("🎯 NotificationService: Fetching notification for RFI:", rfiNumber);
      
      // const response = await http.get(`/notification?rfi_number=${rfiNumber}`);
      const response = await http.get(`/notifications/${rfiNumber}`);
      
      console.log("✅ NotificationService: API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ NotificationService: Error fetching notification:", error);
      console.error("❌ NotificationService: Error URL:", error.config?.url);
      throw error;
    }
  }

  // آپدیت اطلاعات نوتیفیکیشن
  async updateNotificationInfo(notificationData) {
    try {
      console.log("🎯 NotificationService: Updating notification:", notificationData);
      
      const response = await http.put("/notification", notificationData);
      
      console.log("✅ NotificationService: Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ NotificationService: Error updating notification:", error);
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
      rfiDates: firstItem.RFI_Dates || []
    };
  }

  // ساخت داده‌های قابل ارسال برای آپدیت
  prepareUpdateData(timeTableRows, rfiDatesRows) {
    return {
      notifications: timeTableRows.map(row => ({
        RFI_Numbering: row.notificationNumber,
        RFI_Status: row.status === 'انجام شده' ? 'Done' : 'Ongoing',
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
        approved_Duration: row.approvedDuration
      })),
      rfi_dates: rfiDatesRows.map(row => ({
        RFI_Date: this.formatDateForAPI(row.inspectionDate),
        ApproveManday: row.approvalStatus,
        Inspector_Name: row.inspectorName,
        InspectorPrice: parseFloat(row.fee?.replace(/[^0-9.]/g, '')) || 0
      }))
    };
  }

  // فرمت تاریخ برای ارسال به API
  formatDateForAPI(date) {
    if (!date) return null;
    
    if (date instanceof Date) {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }
    
    if (date.format) {
      const formatted = date.format("YYYY-MM-DD");
      return formatted.replace(/\//g, '-'); // تبدیل / به -
    }
    
    return date;
  }
}

export default new NotificationService();