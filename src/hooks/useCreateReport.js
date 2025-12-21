// src/hooks/useCreateReport.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // اضافه کردن useQueryClient
import reportService from "../services/reportService";

// کلیدهای query برای cache management
export const reportKeys = {
  all: ["reports"],
  detail: (rfiNumbering) => [...reportKeys.all, "detail", rfiNumbering],
};

// هوک برای گرفتن اطلاعات گزارش
export const useReportInfo = (rfiNumbering) => {
  return useQuery({
    queryKey: reportKeys.detail(rfiNumbering),
    queryFn: async () => {
      try {
        console.log("🎯 useReportInfo: Fetching for RFI:", rfiNumbering);
        const data = await reportService.getReportInfo(rfiNumbering);
        console.log("✅ useReportInfo: Raw data received:", data);

        const transformed = reportService.transformReportData(data);
        console.log("✅ useReportInfo: Transformed data:", transformed);

        return transformed;
      } catch (error) {
        console.error("❌ useReportInfo: Error in queryFn:", error);

        // اگر 404 بود (گزارش وجود ندارد) null برگردان
        if (error.response?.status === 404) {
          console.log("📭 No report found for RFI:", rfiNumbering);
          return null;
        }
        throw error;
      }
    },
    enabled:
      !!rfiNumbering &&
      rfiNumbering.trim() !== "" &&
      rfiNumbering !== "************",
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error("❌ useReportInfo: Error fetching report:", error);
    },
  });
};

// هوک جدید برای ثبت گزارش جدید (POST)
export const useCreateNewReport = () => {
  const queryClient = useQueryClient(); // اضافه کردن queryClient

  return useMutation({
    mutationFn: async ({ reportData, rfiNumbering }) => {
      console.log(
        "🎯 useCreateNewReport: Creating new report for RFI:",
        rfiNumbering
      );

      // فرمت تاریخ برای ارسال به API
      const formatDateForAPI = (dateStr) => {
        if (!dateStr) return null;
        if (dateStr.includes("/")) {
          const [year, month, day] = dateStr.split("/");
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
        return dateStr;
      };

      const apiData = {
        rfi_numbering: rfiNumbering, // حروف کوچک
        report_no: reportData.reportNumber, // با underline
        rev_no: reportData.revNumber || "", // با underline
        Doc_Status: reportData.status, // با حروف بزرگ
        Remark: reportData.corrections || "",
        App_manday_1stPrice: parseInt(reportData.approvedDays) || 0,
        UnitNo: reportData.unitNumber || "",
        VendorName: reportData.vendorName || "",
        IRNNO: reportData.irn || "",
        SRNNo: reportData.srn || "",
        user: reportData.user || "",
        IssueDate:
          reportData.issueDate || new Date().toISOString().split("T")[0], // با حروف بزرگ
      };

      console.log("📤 useCreateNewReport: Sending POST data:", apiData);
      const result = await reportService.createReport(apiData);
      console.log("✅ useCreateNewReport: Create successful:", result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log(
        "✅ useCreateNewReport: onSuccess for RFI:",
        variables.rfiNumbering
      );

      // اینوالیدیت queryهای RFIReportTable
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"], // کلید اصلی که useRFIReport استفاده می‌کند
      });

      // همچنین اینوالیدیت query جزئیات این گزارش
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(variables.rfiNumbering),
      });

      console.log("🔄 RFI Report queries invalidated");
    },
    onError: (error, variables) => {
      console.error(
        "❌ useCreateNewReport: Create failed for RFI:",
        variables.rfiNumbering
      );
      console.error("❌ useCreateNewReport: Error:", error);
    },
  });
};

// هوک برای آپدیت گزارش موجود (PUT)
export const useUpdateReport = () => {
  const queryClient = useQueryClient(); // اضافه کردن queryClient

  return useMutation({
    mutationFn: async ({ reportData, rfiNumbering }) => {
      console.log("🎯 useUpdateReport: Updating report for RFI:", rfiNumbering);
      const updateData = reportService.prepareReportUpdateData(
        reportData,
        rfiNumbering
      );
      console.log("📤 useUpdateReport: Sending PUT data:", updateData);

      const result = await reportService.updateReport(updateData);
      console.log("✅ useUpdateReport: Update successful:", result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log(
        "✅ useUpdateReport: onSuccess for RFI:",
        variables.rfiNumbering
      );

      // اینوالیدیت queryهای RFIReportTable
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"], // کلید اصلی که useRFIReport استفاده می‌کند
      });

      // همچنین اینوالیدیت query جزئیات این گزارش
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(variables.rfiNumbering),
      });

      console.log("🔄 RFI Report queries invalidated");
    },
    onError: (error, variables) => {
      console.error(
        "❌ useUpdateReport: Update failed for RFI:",
        variables.rfiNumbering
      );
      console.error("❌ useUpdateReport: Error:", error);
    },
  });
};

// هوک قدیمی برای backward compatibility
export const useCreateReport = () => {
  const queryClient = useQueryClient(); // اضافه کردن queryClient

  return useMutation({
    mutationFn: async (reportData) => {
      console.log("🎯 useCreateReport: Mutation started with:", reportData);
      const result = await reportService.createReport(reportData);
      console.log("✅ useCreateReport: Mutation completed:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("✅ useCreateReport: onSuccess called with:", data);

      // اینوالیدیت queryهای RFIReportTable برای backward compatibility
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"],
      });
    },
    onError: (error) => {
      console.error("❌ useCreateReport: onError called with:", error);
      console.error(
        "❌ useCreateReport: Error response:",
        error.response?.data
      );
    },
    onSettled: (data, error) => {
      console.log("🔵 useCreateReport: onSettled called", { data, error });
    },
  });
};
