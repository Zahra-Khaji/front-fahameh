// src/hooks/useCreateReport.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import reportService from "../services/reportService";
import { toast } from "react-hot-toast";

// کلیدهای query برای cache management
export const reportKeys = {
  all: ["reports"],
  detail: (rfiNumbering, reportNumber = null) => [
    ...reportKeys.all,
    "detail",
    rfiNumbering,
    reportNumber,
  ],
  // اضافه کردن کلید برای وضعیت‌ها
  statuses: ["report-statuses"],
};

// هوک برای گرفتن اطلاعات گزارش
// src/hooks/useCreateReport.js
// در تابع useReportInfo:

// src/hooks/useCreateReport.js
export const useReportInfo = (rfiNumbering, reportNumber = null) => {
  return useQuery({
    queryKey: ["report-info", rfiNumbering, reportNumber],
    queryFn: () => reportService.getReportInfo(rfiNumbering, reportNumber),
    enabled: !!(
      reportNumber &&
      reportNumber !== "************" &&
      reportNumber.trim() !== ""
    ), // اینجا باید reportNumber باشه
    staleTime: 5 * 60 * 1000,
    retry: 1,
    onError: (error) => {
      console.error("Error fetching report info:", error);
    },
  });
};

// هوک جدید برای ثبت گزارش جدید (POST)
export const useCreateNewReport = () => {
  const queryClient = useQueryClient(); // اضافه کردن queryClient

  return useMutation({
    mutationFn: async ({ reportData, rfiNumbering }) => {
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

      const result = await reportService.createReport(apiData);

      return result;
    },
    onSuccess: (data, variables) => {
      // اینوالیدیت queryهای RFIReportTable
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"], // کلید اصلی که useRFIReport استفاده می‌کند
      });

      // همچنین اینوالیدیت query جزئیات این گزارش
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(variables.rfiNumbering),
      });

      // 3. اینوالیدیت query عمومی report-info
      queryClient.invalidateQueries({
        queryKey: ["report-info"],
      });

      // **4. اینوالیدیت queryهای lastIRN (اضافه شد)**
      // این کار باعث می‌شود useLastIRN دوباره fetch شود
      queryClient.invalidateQueries({
        queryKey: ["lastIRN"],
      });
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportData, rfiNumbering }) => {
      const updateData = reportService.prepareReportUpdateData(reportData);

      const result = await reportService.updateReport(rfiNumbering, updateData);

      return result;
    },
    onSuccess: (data, variables) => {
      // نمایش toast موفقیت
      toast.success("✅ گزارش با موفقیت بروزرسانی شد", {
        position: "top-center",
        duration: 3000,
        icon: "✅",
        style: {
          background: "#10b981",
          color: "white",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          direction: "rtl",
          textAlign: "right",
        },
      });

      // **مهم: اینوالیدیت تمام queryهای مرتبط**

      // 1. اینوالیدیت query اصلی گزارش
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"],
      });

      // 2. اینوالیدیت query جزئیات این گزارش خاص
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(
          variables.rfiNumbering,
          variables.reportData.reportNumber
        ),
      });

      // 3. اینوالیدیت query عمومی report-info
      queryClient.invalidateQueries({
        queryKey: ["report-info"],
      });

      queryClient.invalidateQueries({
        queryKey: ["lastIRN"],
      });

      // 4. همچنین cache را به صورت دستی آپدیت کن
      queryClient.setQueryData(
        reportKeys.detail(
          variables.rfiNumbering,
          variables.reportData.reportNumber
        ),
        (oldData) => {
          if (!oldData) return data;
          return {
            ...oldData,
            ...variables.reportData,
            Report_No: variables.reportData.reportNumber,
            Remark: variables.reportData.corrections,
            Doc_Status: variables.reportData.status,
            App_manday_1stPrice: variables.reportData.approvedDays,
            UnitNo: variables.reportData.unitNumber,
            VendorName: variables.reportData.vendorName,
            IRNNO: variables.reportData.irn,
            SRNNo: variables.reportData.srn,
          };
        }
      );
    },
    onError: (error, variables) => {
      console.error(
        "❌ useUpdateReport: Update failed for RFI:",
        variables.rfiNumbering
      );
      console.error("❌ useUpdateReport: Error:", error);

      // نمایش toast خطا
      toast.error(
        `❌ خطا در بروزرسانی گزارش: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-center",
          duration: 4000,
          icon: "❌",
          style: {
            background: "#ef4444",
            color: "white",
            borderRadius: "10px",
            padding: "16px",
            fontSize: "14px",
            direction: "rtl",
            textAlign: "right",
          },
        }
      );
    },
  });
};

// هوک جدید: حذف گزارش
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportNumber) => {
      if (!reportNumber || reportNumber.trim() === "") {
        throw new Error("شماره گزارش برای حذف الزامی است");
      }

      const result = await reportService.deleteReport(reportNumber);
      return result;
    },
    onSuccess: (data, reportNumber) => {
      // نمایش toast موفقیت
      toast.success(`با موفقیت حذف شد`, {
        position: "top-center",
        duration: 3000,
        icon: "✅",
        style: {
          background: "#10b981",
          color: "white",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          direction: "rtl",
          textAlign: "right",
        },
      });

      // اینوالیدیت queryهای مرتبط
      queryClient.invalidateQueries({
        queryKey: ["rfiReport"],
      });

      queryClient.invalidateQueries({
        queryKey: ["report-info"],
      });

      queryClient.invalidateQueries({
        queryKey: ["lastIRN"],
      });
    },
    onError: (error, reportNumber) => {
      console.error(
        `❌ useDeleteReport: Delete failed for report: ${reportNumber}`,
        error
      );

      // نمایش toast خطا
      toast.error(
        `❌ خطا در حذف گزارش: ${
          error.response?.data?.message || error.message
        }`,
        {
          position: "top-center",
          duration: 4000,
          icon: "❌",
          style: {
            background: "#ef4444",
            color: "white",
            borderRadius: "10px",
            padding: "16px",
            fontSize: "14px",
            direction: "rtl",
            textAlign: "right",
          },
        }
      );
    },
  });
};

// هوک قدیمی برای backward compatibility
export const useCreateReport = () => {
  const queryClient = useQueryClient(); // اضافه کردن queryClient

  return useMutation({
    mutationFn: async (reportData) => {
      const result = await reportService.createReport(reportData);

      return result;
    },
    onSuccess: (data) => {
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
    onSettled: (data, error) => {},
  });
};

// هوک برای دریافت لیست وضعیت‌های گزارش

export const useReportStatuses = () => {
  return useQuery({
    queryKey: reportKeys.statuses,
    queryFn: () => reportService.getReportStatuses(),
    staleTime: 60 * 60 * 1000, // 1 ساعت
    cacheTime: 24 * 60 * 60 * 1000, // 24 ساعت
    onError: (error) => {
      console.error("Error fetching report statuses:", error);
    },
    // fallback data در صورت خطا
    placeholderData: {
      5: "approved",
      10: "Objection",
    },
  });
};

// در src/hooks/useCreateReport.js - بعد از هوکهای موجود اضافه کنید

// هوک جدید برای دریافت گزارش روزانه PDF
// در src/hooks/useCreateReport.js - هوک useDailyReportPDF را اصلاح کنید:

// هوک جدید برای دریافت گزارش روزانه (Excel/PDF)
export const useDailyReport = (fileType = "excel") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, month, overDomestic }) => {
      // اعتبارسنجی اولیه
      if (!year || !month || !overDomestic) {
        throw new Error("لطفاً تمام فیلدها را پر کنید");
      }

      // تبدیل month به نام فارسی ماه اگر عدد باشد
      let monthName = month;
      if (typeof month === "number" || /^\d+$/.test(month)) {
        const monthNames = [
          "فروردین",
          "اردیبهشت",
          "خرداد",
          "تیر",
          "مرداد",
          "شهریور",
          "مهر",
          "آبان",
          "آذر",
          "دی",
          "بهمن",
          "اسفند",
        ];
        const monthNum = parseInt(month);
        if (monthNum >= 1 && monthNum <= 12) {
          monthName = monthNames[monthNum - 1];
        }
      }

      const result = await reportService.getDailyReport(
        year.toString(),
        monthName,
        overDomestic,
        fileType
      );

      return result;
    },
    onSuccess: (data, variables) => {
      // شناسایی نوع فایل بر اساس Content-Type
      const contentType = data.contentType;
      let fileExtension = "xlsx";

      if (contentType.includes("spreadsheetml.sheet")) {
        fileExtension = "xlsx";
      } else if (contentType.includes("pdf")) {
        fileExtension = "pdf";
      }

      // ایجاد فایل با extension صحیح
      const url = window.URL.createObjectURL(data.blob);
      const link = document.createElement("a");
      link.href = url;

      // اضافه کردن extension به نام فایل اگر وجود ندارد
      let fileName = data.fileName;
      if (!fileName.toLowerCase().endsWith(`.${fileExtension}`)) {
        const baseName = fileName.split(".")[0];
        fileName = `${baseName}.${fileExtension}`;
      }

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // نمایش toast موفقیت
      toast.success("گزارش با موفقیت دانلود شد", {
        position: "top-center",
        duration: 3000,
        icon: "✅",
        style: {
          background: "#10b981",
          color: "white",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          direction: "rtl",
          textAlign: "right",
        },
      });
    },
    onError: (error) => {
      console.error("❌ useDailyReport: خطا در دریافت گزارش:", error);

      let errorMessage = "خطا در دریافت گزارش";
      if (error.response?.status === 404) {
        errorMessage = "گزارشی برای تاریخ و نوع پروژه انتخابی یافت نشد";
      } else if (error.response?.status === 400) {
        errorMessage = "پارامترهای ورودی نامعتبر هستند";
      } else if (error.response?.status === 415) {
        errorMessage = "نوع فایل درخواستی پشتیبانی نمی‌شود";
      } else if (error.message.includes("تمام پارامترها")) {
        errorMessage = "لطفاً تمام فیلدها را پر کنید";
      }

      toast.error(errorMessage, {
        position: "top-center",
        duration: 4000,
        icon: "❌",
        style: {
          background: "#ef4444",
          color: "white",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          direction: "rtl",
          textAlign: "right",
        },
      });
    },
    onMutate: () => {
      // نمایش loading state
      toast.loading("در حال دریافت گزارش...", {
        position: "top-center",
        duration: 1000,
        icon: "⏳",
        style: {
          background: "#3b82f6",
          color: "white",
          borderRadius: "10px",
          padding: "16px",
          fontSize: "14px",
          direction: "rtl",
          textAlign: "right",
        },
      });
    },
  });
};

// هوک backward compatibility با نام قدیمی
export const useDailyReportPDF = () => {
  return useDailyReport("excel");
};

// هوک جدید برای دریافت شماره گزارش پیشنهادی

// در useCreateReport.js - هوک را به این شکل اصلاح کنید:
export const useSuggestedReportNo = (
  rfiNumbering,
  reportNo,
  revNo,
  enabled = false
) => {
  return useQuery({
    queryKey: ["suggested-report-no", rfiNumbering, reportNo, revNo],
    queryFn: async () => {
      // console.log('🎯 useSuggestedReportNo - پارامترهای دریافتی:', {
      //   rfiNumbering,
      //   reportNo,
      //   revNo
      // });

      if (!rfiNumbering || !reportNo) {
        throw new Error("پارامترهای ضروری مفقود هستند");
      }

      const result = await reportService.getSuggestedReportNo(
        rfiNumbering,
        reportNo,
        revNo
      );
      // console.log('✅ useSuggestedReportNo - نتیجه:', result);
      return result;
    },
    enabled: enabled && !!rfiNumbering && !!reportNo,
    staleTime: 0,
    cacheTime: 0,
    retry: false, // غیرفعال کردن retry برای دیباگ
  });
};
