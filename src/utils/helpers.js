// src/utils/helpers.js
// تابع فرمت تاریخ شمسی
// export const formatPersianDate = (date) => {
//   if (!date) return "-";
//   try {
//     return new Date(date).toLocaleDateString("fa-IR");
//   } catch (error) {
//     console.error("خطا در فرمت تاریخ:", error);
//     return "-";
//   }
// };

// src/utils/helpers.js
// تابع فرمت تاریخ شمسی (بهبود یافته)
export const formatPersianDate = (date) => {
  if (!date) return "-";

  try {
    // اگر تاریخ از react-multi-date-picker باشد
    if (date && typeof date === "object") {
      // بررسی کن آیا شیء تاریخ از react-multi-date-picker هست
      if (date.year && date.month && date.day) {
        return `${date.year}/${String(date.month).padStart(2, "0")}/${String(
          date.day
        ).padStart(2, "0")}`;
      }
      // اگر DateObject باشد
      if (date instanceof Date || date._d) {
        return new Date(date).toLocaleDateString("fa-IR");
      }
    }

    // اگر رشته باشد
    if (typeof date === "string") {
      // اگر رشته تاریخ شمسی باشد (مثل 1403/10/15)
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date)) {
        return date;
      }
      // اگر تاریخ میلادی باشد
      return new Date(date).toLocaleDateString("fa-IR");
    }

    // حالت پیش‌فرض
    return new Date(date).toLocaleDateString("fa-IR");
  } catch (error) {
    console.error("خطا در فرمت تاریخ:", error, date);
    return "-";
  }
};

// src/utils/helpers.js (اضافه کردن تابع جدید)

// تابع برای استخراج عدد خالص از رشته مالی فارسی
export const extractCleanNumber = (financialString) => {
  if (!financialString) return "";

  if (typeof financialString === "number") {
    return financialString.toString();
  }

  if (typeof financialString === "string") {
    // حذف "تومان" و جداکننده‌ها
    let cleanString = financialString
      .replace(/تومان/g, "")
      .replace(/[٬,]/g, "")
      .trim();

    // تبدیل اعداد فارسی به انگلیسی
    cleanString = cleanString.replace(/[۰-۹]/g, (char) => {
      const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
      return persianNumbers.indexOf(char).toString();
    });

    return cleanString;
  }

  return "";
};

// تابع جدید برای لیست تاریخ‌ها:
export const formatPersianDatesList = (datesArray) => {
  if (!datesArray || !Array.isArray(datesArray) || datesArray.length === 0) {
    return [];
  }

  const formattedDates = datesArray
    .map((date) => {
      try {
        if (date && typeof date === "object" && date.year) {
          // اگر تاریخ از react-multi-date-picker هست
          return `${date.year}/${String(date.month).padStart(2, "0")}/${String(
            date.day
          ).padStart(2, "0")}`;
        } else {
          // اگر تاریخ استاندارد JS هست
          return formatPersianDate(date);
        }
      } catch (error) {
        console.error("Error formatting date in array:", error);
        return "";
      }
    })
    .filter((date) => date !== ""); // حذف تاریخ‌های نامعتبر

  return formattedDates;
};

// تابع تبدیل رشته مالی به عدد
export const parseFinancialString = (financialString) => {
  if (!financialString) return 0;

  if (typeof financialString === "number") {
    return financialString;
  }

  if (typeof financialString === "string") {
    const cleanString = financialString
      .replace(/[^۰-۹0-9]/g, "")
      .replace(/[۰-۹]/g, (char) => {
        const persianNumbers = [
          "۰",
          "۱",
          "۲",
          "۳",
          "۴",
          "۵",
          "۶",
          "۷",
          "۸",
          "۹",
        ];
        return persianNumbers.indexOf(char).toString();
      });

    return parseInt(cleanString) || 0;
  }

  return 0;
};

// تابع تبدیل عدد به رشته مالی فارسی
export const formatFinancialNumber = (number) => {
  return number.toLocaleString("fa-IR");
};

// تابع تولید تاریخ‌های بین دو تاریخ
export const getDatesInRange = (startDate, endDate) => {
  const dates = [];

  // اطمینان از اینکه تاریخ‌ها به درستی پارس شده‌اند
  const start = new Date(startDate);
  const end = new Date(endDate);

  // اگر start و end یکی باشند، فقط یک تاریخ برگردون
  if (start.getTime() === end.getTime()) {
    return [start];
  }

  const currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// فرمت بازه تاریخ
export const formatDateRange = (range) => {
  if (!range || range.length < 2) return "-";
  return `${formatPersianDate(range[0])} تا ${formatPersianDate(range[1])}`;
};

export const formatMultipleDates = (dates) => {
  if (!dates || dates.length === 0) return "-";
  if (dates.length === 1) return formatPersianDate(dates[0]);
  return dates.map((date) => formatPersianDate(date)).join("، ");
};

// تابع جدید برای نمایش خلاصه تاریخ‌ها
export const formatDatesSummary = (dates) => {
  if (!dates || dates.length === 0) return "-";
  if (dates.length === 1) return formatPersianDate(dates[0]);
  return `${dates.length} تاریخ انتخاب شده`;
};

// تابع helper برای تبدیل وضعیت انگلیسی به فارسی
// تابع helper برای تبدیل وضعیت انگلیسی به فارسی
// تابع برای دریافت رنگ وضعیت
export const getStatusColor = (status) => {
  const statusStr = String(status || "")
    .toLowerCase()
    .trim();

  // پشتیبانی از مقادیر فارسی و انگلیسی
  if (statusStr === "done" || statusStr === "انجام شده") {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (statusStr === "ongoing" || statusStr === "در حال انجام") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }
  if (
    statusStr === "cancel" ||
    statusStr === "cancelled" ||
    statusStr === "لغو شده"
  ) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  return "bg-gray-100 text-gray-800 border-gray-200";
};

// تابع برای دریافت متن فارسی وضعیت
export const getPersianStatus = (status) => {
  const statusStr = String(status || "")
    .toLowerCase()
    .trim();

  if (statusStr === "done") return "انجام شده";
  if (statusStr === "ongoing") return "در حال انجام";
  if (statusStr === "cancel" || statusStr === "cancelled") return "لغو شده";

  // اگر خود مقدار فارسی بود، همان را برگردان
  if (statusStr === "در حال انجام") return "در حال انجام";
  if (statusStr === "انجام شده") return "انجام شده";
  if (statusStr === "لغو شده") return "لغو شده";

  return status || "نامشخص";
};

// تابع helper برای نمایش نوع پروژه (اگر نیاز دارید)
export const getPersianProjectType = (type) => {
  if (!type) return "";

  const typeMap = {
    "Domestic Goods": "داخلی کالا",
    "Domestic Ship": "داخلی کشتی",
    Foreign: "خارجی",
    "domestic goods": "داخلی کالا",
    "domestic ship": "داخلی کشتی",
    foreign: "خارجی",
  };

  return typeMap[type] || type;
};

// src/utils/helpers.js (آپدیت کامل توابع وضعیت گزارش)

// تابع تبدیل کد وضعیت گزارش به فارسی - فقط بر اساس حروف لاتین
export const getReportStatusInPersian = (statusText = "") => {
  if (!statusText) return "نامشخص";

  // تبدیل به lowercase برای مقایسه آسان‌تر
  const text = String(statusText).trim().toLowerCase();

  // نگاشت مستقیم حروف لاتین به فارسی
  const statusMap = {
    acc: "قابل قبول",
    objection: "کامنت",
    "not recived": "دریافت نشده",
    "not received": "دریافت نشده",
    rej: "ریجکت",

    // برای backward compatibility
    approved: "تائید شده",
    conditional: "مشروط",
    ncr: "گزارش عدم انطباق",
  };

  // جستجوی مستقیم
  if (statusMap[text]) {
    return statusMap[text];
  }

  // جستجوی partial match
  if (text.includes("acc")) return "قابل قبول";
  if (text.includes("objection")) return "کامنت";
  if (text.includes("not") && text.includes("recived")) return "دریافت نشده";
  if (text.includes("not") && text.includes("received")) return "دریافت نشده";
  if (text.includes("rej")) return "ریجکت";

  // اگر هیچکدام پیدا نشد، همان متن اصلی رو برگردون
  return statusText;
};

// تابع تبدیل لیست وضعیت‌ها از API به options برای select
// در helpers.js - تابع transformReportStatuses:

export const transformReportStatuses = (apiData) => {
  // console.log('🔄 Transforming report statuses from:', apiData);

  if (
    !apiData ||
    typeof apiData !== "object" ||
    Object.keys(apiData).length === 0
  ) {
    // وضعیت‌های پیش‌فرض در صورت عدم وجود داده
    // console.log('⚠️ No API data, using defaults');
    return [
      { value: "Acc", label: "قابل قبول", textValue: "Acc" },
      { value: "Objection", label: "کامنت", textValue: "Objection" },
      { value: "not recived", label: "دریافت نشده", textValue: "not recived" },
      { value: "Rej", label: "ریجکت", textValue: "Rej" },
    ];
  }

  const options = Object.entries(apiData).map(([code, text]) => {
    const option = {
      value: text, // استفاده از متن لاتین به عنوان value
      label: getReportStatusInPersian(text),
      textValue: text,
      originalCode: code,
    };
    // console.log('📝 Status option:', option);
    return option;
  });

  // console.log('✅ Final options:', options);
  return options;
};

// تابع پیدا کردن متن انگلیسی بر اساس value
export const getEnglishStatus = (value) => {
  return value || ""; // چون value الان خود متن انگلیسی است
};

// ==================== توابع جدید برای وضعیت نوتیفیکیشن ====================

// تابع تبدیل کد وضعیت نوتیفیکیشن به فارسی
export const getNotificationStatusInPersian = (statusCode, statusText = "") => {
  const statusMap = {
    // با استفاده از کد عددی
    1: "لغو شده",
    2: "انجام شده",
    3: "در حال انجام",
    4: "در حال انجام",

    // با استفاده از متن انگلیسی
    Cancel: "لغو شده",
    Done: "انجام شده",
    Ongoing: "در حال انجام",
    "در حال انجام": "در حال انجام",

    // backward compatibility
    "انجام شده": "انجام شده",
    "در حال انجام": "در حال انجام",
  };

  // اول با کد عددی چک کن
  if (statusMap[statusCode]) {
    return statusMap[statusCode];
  }

  // سپس با متن انگلیسی
  if (statusMap[statusText]) {
    return statusMap[statusText];
  }

  // سپس با متن فارسی
  if (statusMap[statusText]) {
    return statusMap[statusText];
  }

  // اگر پیدا نشد، همان متن اصلی رو برگردون
  return statusText || statusCode || "نامشخص";
};

// تابع تبدیل لیست وضعیت‌های نوتیفیکیشن از API به options برای select
export const transformNotificationStatuses = (apiData) => {
  if (!apiData || typeof apiData !== "object") {
    // وضعیت‌های پیش‌فرض در صورت عدم وجود داده
    return [
      { value: "3", label: "در حال انجام", textValue: "Ongoing" },
      { value: "2", label: "انجام شده", textValue: "Done" },
      { value: "1", label: "لغو شده", textValue: "Cancel" },
    ];
  }

  const options = Object.entries(apiData).map(([code, text]) => ({
    value: code,
    label: getNotificationStatusInPersian(code, text),
    textValue: text,
  }));

  return options;
};

// تابع پیدا کردن متن انگلیسی بر اساس کد برای نوتیفیکیشن
export const getEnglishNotificationStatus = (apiData, code) => {
  if (!apiData || !code) return code;

  // اگر کد عددی باشد
  if (apiData[code]) {
    return apiData[code];
  }

  // backward compatibility: اگر code متن انگلیسی باشد
  const entry = Object.entries(apiData).find(([key, value]) => value === code);
  if (entry) {
    return entry[1];
  }

  return code;
};

// تابع تبدیل متن فارسی به کد عددی برای نوتیفیکیشن
export const getNotificationStatusCode = (apiData, persianStatus) => {
  if (!apiData || !persianStatus) return "3"; // پیش‌فرض: در حال انجام

  const statusMap = {
    "انجام شده": "2",
    "در حال انجام": "3",
    "لغو شده": "1",
  };

  // اول از مپ فارسی استفاده کن
  if (statusMap[persianStatus]) {
    return statusMap[persianStatus];
  }

  // اگر پیدا نشد، در داده‌های API جستجو کن
  const entry = Object.entries(apiData).find(([code, englishText]) => {
    const persianEquivalent = getNotificationStatusInPersian(code, englishText);
    return persianEquivalent === persianStatus;
  });

  return entry ? entry[0] : "3"; // پیش‌فرض: در حال انجام
};

// ==================== توابع جدید برای پردازش اعداد و مقادیر ====================

// تبدیل هر مقداری به عدد
export const toNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    // حذف فرمت‌های فارسی و انگلیسی
    let cleaned = value
      .replace(/[٬,]/g, "") // حذف جداکننده هزارگان فارسی و انگلیسی
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)) // تبدیل اعداد فارسی به انگلیسی
      .replace(/[^\d.]/g, ""); // حذف همه چیز غیر از عدد و نقطه

    // اگر پس از پاکسازی چیزی باقی نماند
    if (cleaned === "") {
      return defaultValue;
    }

    const result = parseFloat(cleaned);
    return isNaN(result) ? defaultValue : result;
  }

  // سایر انواع داده
  const result = Number(value);
  return isNaN(result) ? defaultValue : result;
};

// تبدیل approveManday
export const parseApproveManday = (value) => {
  if (value === "-" || value === null || value === undefined || value === "") {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    // حذف همه کاراکترهای غیرعددی
    const cleaned = value.replace(/[^0-9]/g, "");
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  return 0;
};

// تابع برای استخراج عدد خالص از رشته (برای دستمزد و قیمت)
export const extractNumber = (value) => {
  return toNumber(value, 0);
};

// تابع برای فرمت کردن عدد با جداکننده هزارگان فارسی
export const formatWithCommas = (number) => {
  const num = toNumber(number);
  return num.toLocaleString("fa-IR");
};

// src/utils/helpers.js
export const formatCurrency = (amount, unit = "تومان") => {
  if (!amount && amount !== 0) return "";

  const numStr = amount.toString().replace(/\D/g, "");
  if (!numStr) return "";

  const formattedNumber = new Intl.NumberFormat("fa-IR").format(numStr);

  if (unit === "ریال") {
    return `${formattedNumber} ریال`;
  }

  return `${formattedNumber} تومان`;
};
