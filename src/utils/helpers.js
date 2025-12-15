// src/utils/helpers.js
// تابع فرمت تاریخ شمسی
export const formatPersianDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("fa-IR");
  } catch (error) {
    console.error("خطا در فرمت تاریخ:", error);
    return "-";
  }
};

// تابع جدید برای لیست تاریخ‌ها:
export const formatPersianDatesList = (datesArray) => {
  if (!datesArray || !Array.isArray(datesArray) || datesArray.length === 0) {
    return [];
  }
  
  const formattedDates = datesArray.map(date => {
    try {
      if (date && typeof date === 'object' && date.year) {
        // اگر تاریخ از react-multi-date-picker هست
        return `${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}`;
      } else {
        // اگر تاریخ استاندارد JS هست
        return formatPersianDate(date);
      }
    } catch (error) {
      console.error('Error formatting date in array:', error);
      return '';
    }
  }).filter(date => date !== ''); // حذف تاریخ‌های نامعتبر
  
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
  return dates.map(date => formatPersianDate(date)).join('، ');
};

// تابع جدید برای نمایش خلاصه تاریخ‌ها
export const formatDatesSummary = (dates) => {
  if (!dates || dates.length === 0) return "-";
  if (dates.length === 1) return formatPersianDate(dates[0]);
  return `${dates.length} تاریخ انتخاب شده`;
};


// تابع helper برای تبدیل وضعیت انگلیسی به فارسی
// تابع helper برای تبدیل وضعیت انگلیسی به فارسی
export const getPersianStatus = (status) => {
  if (!status) return '';
  
  const statusStr = String(status).toLowerCase().trim();
  
  if (statusStr.includes('done') || statusStr.includes('انجام')) {
    return 'انجام شده';
  } 
  if (statusStr.includes('ongoing') || statusStr.includes('در حال')) {
    return 'در حال انجام';
  }
  if (statusStr.includes('cancel') || statusStr.includes('لغو')) {
    return 'لغو شده';
  }
  
  // اگر وضعیت ناشناخته بود، خودش را برگردان
  return status;
};

// تابع helper برای کلاس رنگ وضعیت
export const getStatusColor = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800';
  
  const statusLower = status.toLowerCase();
  
  if (statusLower === 'done') {
    return 'bg-green-100 text-green-800';
  } else if (statusLower === 'ongoing') {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusLower.includes('cancel')) {
    return 'bg-red-100 text-red-800';
  }
  
  return 'bg-gray-100 text-gray-800';
};

// تابع helper برای نمایش نوع پروژه (اگر نیاز دارید)
export const getPersianProjectType = (type) => {
  if (!type) return '';
  
  const typeMap = {
    'Domestic Goods': 'داخلی کالا',
    'Domestic Ship': 'داخلی کشتی',
    'Foreign': 'خارجی',
    'domestic goods': 'داخلی کالا',
    'domestic ship': 'داخلی کشتی',
    'foreign': 'خارجی'
  };
  
  return typeMap[type] || type;
};
