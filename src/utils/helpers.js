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
