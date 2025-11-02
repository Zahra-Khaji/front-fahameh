// src/data/staticData.js
export const provinces = [
  { id: "1", name: "تهران" },
  { id: "2", name: "اصفهان" },
  { id: "3", name: "فارس" },
  { id: "4", name: "خراسان رضوی" },
  { id: "5", name: "آذربایجان شرقی" },
];

export const citiesByProvince = {
  1: [
    { id: "1-1", name: "تهران" },
    { id: "1-2", name: "شهریار" },
    { id: "1-3", name: "ری" },
    { id: "1-4", name: "اسلامشهر" },
  ],
  2: [
    { id: "2-1", name: "اصفهان" },
    { id: "2-2", name: "کاشان" },
    { id: "2-3", name: "نجف آباد" },
    { id: "2-4", name: "خمینی شهر" },
  ],
  3: [
    { id: "3-1", name: "شیراز" },
    { id: "3-2", name: "مرودشت" },
    { id: "3-3", name: "کازرون" },
  ],
  4: [
    { id: "4-1", name: "مشهد" },
    { id: "4-2", name: "نیشابور" },
    { id: "4-3", name: "سبزوار" },
  ],
  5: [
    { id: "5-1", name: "تبریز" },
    { id: "5-2", name: "مراغه" },
    { id: "5-3", name: "مرند" },
  ],
};

export const sellers = [
  { id: "1", name: "برزین" },
  { id: "2", name: "مجتمع صنعتی آریا" },
  { id: "3", name: "کارخانجات پیشتاز" },
  { id: "4", name: "صنایع مدرن پارس" },
];

export const inspectors = [
  {
    id: "1",
    name: "مهندس محمدی",
    location: "تهران",
    phone: "۰۹۱۲۳۴۵۶۷۸۹",
    email: "mohammadi@example.com",
    expertise: "کنترل کیفیت مصالح",
    fee: "۱,۲۰۰,۰۰۰ تومان",
  },
  {
    id: "2",
    name: "مهندس رضایی",
    location: "اصفهان",
    phone: "۰۹۱۲۹۸۷۶۵۴۳",
    email: "rezaei@example.com",
    expertise: "بازرسی فنی سازه",
    fee: "۹۵۰,۰۰۰ تومان",
  },
  {
    id: "3",
    name: "مهندس کریمی",
    location: "فارس",
    phone: "۰۹۳۶۵۴۳۲۱۰۹",
    email: "karimi@example.com",
    expertise: "نظارت اجرایی",
    fee: "۱,۵۰۰,۰۰۰ تومان",
  },
];

// در src/data/staticData.js - اصلاح approvalStatuses
export const approvalStatuses = [
  {
    value: "under_inspection",
    label: "در حال بازرسی",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    value: "approved",
    label: "تأیید شده",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    value: "rejected",
    label: "عدم تأیید",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    value: "pending",
    label: "در انتظار",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  {
    value: "conditional",
    label: "تأیید مشروط",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
];

export const reportStatusOptions = [
  {
    value: "under_inspection",
    label: "در حال بازرسی",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  }, // تغییر به "در حال بازرسی"
  {
    value: "approved",
    label: "تأیید شده",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    value: "rejected",
    label: "رد شده",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    value: "needs_correction",
    label: "نیاز به اصلاحات",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

export const projects = [
  { id: "1", name: "پروژه برزین" },
  { id: "2", name: "پروژه کنگان" },
  { id: "3", name: "پروژه پل ساوه" },
];
