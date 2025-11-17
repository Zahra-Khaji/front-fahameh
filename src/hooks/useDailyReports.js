// src/hooks/useDailyReports.js
import { useState, useEffect } from "react";
import { calculateFinancialSummary } from "../utils/financialCalculations";

export const useDailyReports = (previousData, initialDailyReports = []) => {
  const [dailyReports, setDailyReports] = useState([]);

  // Initialize daily reports
  useEffect(() => {
    if (initialDailyReports.length > 0) {
      setDailyReports(initialDailyReports);
      return;
    }

    const defaultInspector = previousData?.inspectorInfo?.inspectorName || "";
    const defaultFee = previousData?.inspectorInfo?.fee || "";

    // پیدا کردن وضعیت گزارش از مرحله سوم
    const getReportStatus = () => {
      // اول از reportStatus مستقیم
      if (previousData?.reportStatus) {
        return previousData.reportStatus;
      }

      // سپس از اولین گزارش در reports
      if (previousData?.reports && previousData.reports.length > 0) {
        return previousData.reports[0].status;
      }

      // در نهایت مقدار پیش‌فرض
      return "under_inspection";
    };

    const defaultApprovalStatus = getReportStatus();

    // گرفتن بازه زمانی واقعی از نوتیفیکیشن - حالت MULTIPLE
    const getRealInspectionDates = () => {
      if (
        previousData?.notifications &&
        previousData.notifications.length > 0
      ) {
        const notification = previousData.notifications[0];
        if (
          notification.inspectionRange &&
          Array.isArray(notification.inspectionRange)
        ) {
          // حالت MULTIPLE: استفاده مستقیم از تاریخ‌های انتخاب شده
          console.log("تاریخ‌های انتخاب شده در نوتیفیکیشن:", notification.inspectionRange);
          return notification.inspectionRange;
        }
      }

      if (
        previousData?.inspectionRange &&
        Array.isArray(previousData.inspectionRange)
      ) {
        // حالت MULTIPLE: استفاده مستقیم از تاریخ‌های انتخاب شده
        console.log("تاریخ‌های انتخاب شده در inspectionRange:", previousData.inspectionRange);
        return previousData.inspectionRange;
      }

      // Fallback به تاریخ‌های نمونه
      console.log("استفاده از تاریخ‌های پیش‌فرض");
      return [new Date("2024-10-13"), new Date("2024-10-15")];
    };

    const realInspectionDates = getRealInspectionDates();

    console.log("تاریخ‌های نهایی برای جدول:", realInspectionDates);
    console.log("وضعیت گزارش استفاده شده:", defaultApprovalStatus);

    // ایجاد گزارش برای هر تاریخ انتخاب شده در حالت MULTIPLE
    const reports = realInspectionDates.map((date, index) => ({
      id: Date.now() + index,
      inspectionDate: date,
      approvalStatus: defaultApprovalStatus,
      inspectorName: defaultInspector,
      inspectorFee: defaultFee,
      secondInspectorName: "",
      secondInspectorFee: "",
    }));

    setDailyReports(reports);
  }, [previousData, initialDailyReports]);

  const updateDailyReport = (reportId, field, value) => {
    setDailyReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, [field]: value } : report
      )
    );
  };

  const validateForm = () => {
    return dailyReports.every(
      (report) =>
        report.approvalStatus && report.inspectorName && report.inspectorFee
    );
  };

  const summary = calculateFinancialSummary(dailyReports, previousData);

  return {
    dailyReports,
    updateDailyReport,
    summary,
    validateForm,
  };
};