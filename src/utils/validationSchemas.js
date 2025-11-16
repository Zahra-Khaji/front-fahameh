// src/utils/validationSchemas.js
import { z } from "zod";

export const inspectionSchema = z.object({
  projectInfo: z.object({
    projectName: z.string().min(1, "نام پروژه الزامی است"),
    projectType: z.string().min(1, "نوع پروژه الزامی است"),
    province: z.string().min(1, "انتخاب استان الزامی است"),
    city: z.string().min(1, "انتخاب شهر الزامی است"),
    vendor: z.string().min(1, "انتخاب وندور الزامی است"),
  }),
  inspectorInfo: z.object({
    inspectorName: z.string().min(1, "انتخاب بازرس الزامی است"),
    inspectorLocation: z.string().min(1, "موقعیت بازرس الزامی است"),
    phoneNumber: z.string().min(1, "شماره تماس الزامی است"),
    email: z.string().email("ایمیل معتبر نیست").min(1, "ایمیل الزامی است"),
    expertise: z.string().min(1, "تخصص الزامی است"),
    fee: z.string().min(1, "دستمزد الزامی است"),
  }),
});

export const notificationSchema = z.object({
  notificationNumber: z.number().min(1, "شماره ثبت الزامی است"),
  sendDate: z.date({ required_error: "تاریخ ارسال الزامی است" }),
  inspectionRange: z.array(z.date()).length(2, "بازه بازرسی الزامی است"),
});

export const reportSchema = z.object({
  reportNumber: z.number().min(1, "شماره گزارش الزامی است"),
  status: z.string().min(1, "وضعیت الزامی است"),
  corrections: z.string().optional(),
  receiveDate: z.date({ required_error: "تاریخ دریافت الزامی است" }),
});
