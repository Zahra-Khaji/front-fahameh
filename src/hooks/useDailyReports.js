// src/hooks/useDailyReports.js
import { useState, useEffect } from "react";
import { getDatesInRange } from "../utils/helpers";
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

    // گرفتن بازه زمانی واقعی از نوتیفیکیشن
    const getRealInspectionRange = () => {
      if (
        previousData?.notifications &&
        previousData.notifications.length > 0
      ) {
        const notification = previousData.notifications[0];
        if (
          notification.inspectionRange &&
          Array.isArray(notification.inspectionRange)
        ) {
          return notification.inspectionRange;
        }
      }

      if (
        previousData?.inspectionRange &&
        Array.isArray(previousData.inspectionRange)
      ) {
        return previousData.inspectionRange;
      }

      // Fallback به تاریخ‌های نمونه
      return [new Date("2024-10-13"), new Date("2024-10-15")];
    };

    const realInspectionRange = getRealInspectionRange();

    // منطق جدید: اگر یک تاریخ انتخاب شده، فقط همون تاریخ رو در نظر بگیر
    let dates = [];

    if (realInspectionRange.length === 1) {
      // فقط یک تاریخ انتخاب شده
      dates = [realInspectionRange[0]];
    } else if (realInspectionRange.length === 2) {
      // بازه زمانی انتخاب شده
      dates = getDatesInRange(realInspectionRange[0], realInspectionRange[1]);
    } else {
      // حالت پیش‌فرض
      dates = getDatesInRange(new Date("2024-10-13"), new Date("2024-10-15"));
    }

    console.log("تاریخ‌های تولید شده برای جدول:", dates);
    console.log("وضعیت گزارش استفاده شده:", defaultApprovalStatus);

    const reports = dates.map((date, index) => ({
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
