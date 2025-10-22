// src/components/InspectionForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FaCheck, 
  FaExclamationTriangle, 
  FaUserTie,
  FaClipboardList
} from 'react-icons/fa';

// ساخت schema با Zod (همان قبلی)
// ساخت schema با Zod
const inspectionSchema = z.object({
  projectInfo: z.object({
    projectName: z.string().min(1, 'نام پروژه الزامی است'),
    province: z.string().min(1, 'انتخاب استان الزامی است'),
    city: z.string().min(1, 'انتخاب شهر الزامی است'),
    seller: z.string().min(1, 'انتخاب وندور الزامی است'),
  }),
  inspectorInfo: z.object({
    inspectorName: z.string().min(1, 'انتخاب بازرس الزامی است'),
    inspectorLocation: z.string().min(1, 'موقعیت بازرس الزامی است'), // تغییر به location
    phoneNumber: z.string().min(1, 'شماره تماس الزامی است'),
    email: z.string().email('ایمیل معتبر نیست').min(1, 'ایمیل الزامی است'),
    expertise: z.string().min(1, 'تخصص الزامی است'),
    fee: z.string().min(1, 'دستمزد الزامی است'),
  }),
});

// داده‌های نمونه (همان قبلی)
const provinces = [
  { id: '1', name: 'تهران' },
  { id: '2', name: 'اصفهان' },
  { id: '3', name: 'فارس' },
  { id: '4', name: 'خراسان رضوی' },
  { id: '5', name: 'آذربایجان شرقی' },
];

const citiesByProvince = {
  '1': [
    { id: '1-1', name: 'تهران' },
    { id: '1-2', name: 'شهریار' },
    { id: '1-3', name: 'ری' },
    { id: '1-4', name: 'اسلامشهر' },
  ],
  '2': [
    { id: '2-1', name: 'اصفهان' },
    { id: '2-2', name: 'کاشان' },
    { id: '2-3', name: 'نجف آباد' },
    { id: '2-4', name: 'خمینی شهر' },
  ],
  '3': [
    { id: '3-1', name: 'شیراز' },
    { id: '3-2', name: 'مرودشت' },
    { id: '3-3', name: 'کازرون' },
  ],
  '4': [
    { id: '4-1', name: 'مشهد' },
    { id: '4-2', name: 'نیشابور' },
    { id: '4-3', name: 'سبزوار' },
  ],
  '5': [
    { id: '5-1', name: 'تبریز' },
    { id: '5-2', name: 'مراغه' },
    { id: '5-3', name: 'مرند' },
  ],
};

const sellers = [
  { id: '1', name: 'برزین' },
  { id: '2', name: 'مجتمع صنعتی آریا' },
  { id: '3', name: 'کارخانجات پیشتاز' },
  { id: '4', name: 'صنایع مدرن پارس' },
];

// در InspectionForm.jsx - بخش inspectors رو اینطور تصحیح کنید:

const inspectors = [
  { 
    id: '1', 
    name: 'مهندس محمدی', 
    location: 'تهران', // تغییر از position به location
    phone: '۰۹۱۲۳۴۵۶۷۸۹', 
    email: 'mohammadi@example.com',
    expertise: 'کنترل کیفیت مصالح', 
    fee: '۱,۲۰۰,۰۰۰ تومان' 
  },
  { 
    id: '2', 
    name: 'مهندس رضایی', 
    location: 'اصفهان', // تغییر از position به location
    phone: '۰۹۱۲۹۸۷۶۵۴۳', 
    email: 'rezaei@example.com',
    expertise: 'بازرسی فنی سازه', 
    fee: '۹۵۰,۰۰۰ تومان' 
  },
  { 
    id: '3', 
    name: 'مهندس کریمی', 
    location: 'فارس', // تغییر از position به location
    phone: '۰۹۳۶۵۴۳۲۱۰۹', 
    email: 'karimi@example.com',
    expertise: 'نظارت اجرایی', 
    fee: '۱,۵۰۰,۰۰۰ تومان' 
  },
  { 
    id: '4', 
    name: 'مهندس احمدی', 
    location: 'خراسان رضوی', // اضافه کردن بازرس جدید
    phone: '۰۹۱۲۱۱۱۲۲۳۳', 
    email: 'ahmadi@example.com',
    expertise: 'بازرسی تأسیسات', 
    fee: '۱,۱۰۰,۰۰۰ تومان' 
  },
  { 
    id: '5', 
    name: 'مهندس حسینی', 
    location: 'آذربایجان شرقی', // اضافه کردن بازرس جدید
    phone: '۰۹۳۳۴۴۵۵۶۶۷', 
    email: 'hosseini@example.com',
    expertise: 'بازرسی الکتریکال', 
    fee: '۱,۳۰۰,۰۰۰ تومان' 
  },
];

const InspectionForm = ({ onComplete }) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      projectInfo: {
        projectName: '',
        province: '',
        city: '',
        seller: '',
      },
      inspectorInfo: {
        inspectorName: '',
        inspectorLocation: '', // تغییر به location
        phoneNumber: '',
        email: '',
        expertise: '',
        fee: '',
      },
    },
  });

  const currentProvince = watch('projectInfo.province');

  // مدیریت تغییر استان
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setValue('projectInfo.province', provinceId);
    setValue('projectInfo.city', '');
  };

  // مدیریت تغییر بازرس
// مدیریت تغییر بازرس
const handleInspectorChange = (e) => {
  const inspectorId = e.target.value;
  setSelectedInspectorId(inspectorId);
  
  const selectedInspectorData = inspectors.find(insp => insp.id === inspectorId);
  if (selectedInspectorData) {
    setValue('inspectorInfo.inspectorName', selectedInspectorData.name);
    setValue('inspectorInfo.inspectorLocation', selectedInspectorData.location); // تغییر به location
    setValue('inspectorInfo.phoneNumber', selectedInspectorData.phone);
    setValue('inspectorInfo.email', selectedInspectorData.email);
    setValue('inspectorInfo.expertise', selectedInspectorData.expertise);
    setValue('inspectorInfo.fee', selectedInspectorData.fee);
  } else {
    setValue('inspectorInfo.inspectorName', '');
    setValue('inspectorInfo.inspectorLocation', ''); // تغییر به location
    setValue('inspectorInfo.phoneNumber', '');
    setValue('inspectorInfo.email', '');
    setValue('inspectorInfo.expertise', '');
    setValue('inspectorInfo.fee', '');
  }
};

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    onComplete(data);
  };

  const onError = (errors) => {
    console.log('Form Errors:', errors);
    const firstError = Object.values(errors).find((error) => error);
    if (firstError) {
      setErrorMessage('لطفاً تمام فیلدهای الزامی را پر کنید');
      setShowErrorPopup(true);
    }
  };

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-3 px-4"> {/* تغییر ارتفاع */}
      <div className="max-w-5xl mx-auto">
        {/* هدر جمع و جورتر */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl px-3 py-2.5 text-white text-center mb-3 shadow-lg"> {/* کاهش padding */}
          <div className="flex items-center justify-center mb-0.5">
            <FaClipboardList className="text-xl ml-2" /> {/* کاهش سایز آیکون */}
            <h1 className="text-lg font-bold">سامانه درخواست بازرسی</h1> {/* کاهش سایز فونت */}
          </div>
          <p className="text-blue-100 text-xs">فرم ثبت درخواست بازرسی فنی و کیفیت</p>
           {/* کاهش سایز فونت */}
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="p-4"> {/* کاهش padding */}
            {/* گروه اول: اطلاعات درخواست بازرسی */}
            <div className="border border-blue-100 rounded-lg px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 mb-4"> {/* کاهش padding و margin */}
              <div className="flex items-center mb-3"> {/* کاهش margin */}
                <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full ml-2"></div> {/* کاهش ارتفاع */}
                <FaClipboardList className="text-blue-600 text-xs ml-1" /> {/* کاهش سایز آیکون */}
                <h2 className="text-sm font-bold text-gray-800"> {/* کاهش سایز فونت */}
                  اطلاعات درخواست بازرسی
                </h2>
              </div>
              
              <div className="space-y-3"> {/* کاهش فاصله */}
                {/* سطر اول: نام پروژه */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1"> {/* کاهش سایز فونت و margin */}
                    نام پروژه *
                  </label>
                  <input
                    type="text"
                    {...register('projectInfo.projectName')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                    placeholder="نام پروژه را وارد کنید"
                  />
                  {errors.projectInfo?.projectName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center"> {/* کاهش سایز فونت */}
                      <FaExclamationTriangle className="ml-1 text-xs" />
                      {errors.projectInfo.projectName.message}
                    </p>
                  )}
                </div>

                {/* سطر دوم: استان، شهر، وندور */}
                <div className="grid grid-cols-3 gap-3"> {/* کاهش gap */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      استان *
                    </label>
                    <select
                      {...register('projectInfo.province')}
                      onChange={handleProvinceChange}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                    >
                      <option value="">انتخاب استان</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.projectInfo?.province && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationTriangle className="ml-1 text-xs" />
                        {errors.projectInfo.province.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      شهر *
                    </label>
                    <select
                      {...register('projectInfo.city')}
                      disabled={!currentProvince}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white disabled:bg-gray-100"
                    >
                      <option value="">انتخاب شهر</option>
                      {currentProvince && citiesByProvince[currentProvince]?.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    {errors.projectInfo?.city && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationTriangle className="ml-1 text-xs" />
                        {errors.projectInfo.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      وندور *
                    </label>
                    <select
                      {...register('projectInfo.seller')}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                    >
                      <option value="">انتخاب وندور</option>
                      {sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))}
                    </select>
                    {errors.projectInfo?.seller && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationTriangle className="ml-1 text-xs" />
                        {errors.projectInfo.seller.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* گروه دوم: اطلاعات بازرس */}
            <div className="border border-blue-100 rounded-lg px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center mb-3">
                <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full ml-2"></div>
                <FaUserTie className="text-blue-600 text-xs ml-1" />
                <h2 className="text-sm font-bold text-gray-800">
                  اطلاعات بازرس
                </h2>
              </div>
              
              <div className="space-y-3">
                {/* سطر اول: نام بازرس */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    نام بازرس *
                  </label>
                  <select
                    value={selectedInspectorId}
                    onChange={handleInspectorChange}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
                  >
                    <option value="">انتخاب بازرس</option>
                    {inspectors.map(inspector => (
                      <option key={inspector.id} value={inspector.id}>
                        {inspector.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="hidden"
                    {...register('inspectorInfo.inspectorName')}
                  />
                  {errors.inspectorInfo?.inspectorName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="ml-1 text-xs" />
                      {errors.inspectorInfo.inspectorName.message}
                    </p>
                  )}
                </div>

                {/* سطر دوم: موقعیت، تماس، تخصص، ایمیل، دستمزد */}
                <div className="grid grid-cols-5 gap-2"> {/* کاهش gap */}
                
<div>
  <label className="block text-xs font-semibold text-gray-700 mb-1">
    موقعیت (استان) *
  </label>
  <input
    type="text"
    {...register('inspectorInfo.inspectorLocation')} // تغییر به inspectorLocation
    readOnly
    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-blue-50 cursor-not-allowed text-gray-600"
  />
</div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      شماره تماس *
                    </label>
                    <input
                      type="text"
                      {...register('inspectorInfo.phoneNumber')}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-blue-50 cursor-not-allowed text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      تخصص *
                    </label>
                    <input
                      type="text"
                      {...register('inspectorInfo.expertise')}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-blue-50 cursor-not-allowed text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      ایمیل *
                    </label>
                    <input
                      type="email"
                      {...register('inspectorInfo.email')}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-blue-50 cursor-not-allowed text-gray-600"
                    />
                    {errors.inspectorInfo?.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationTriangle className="ml-1 text-xs" />
                        {errors.inspectorInfo.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      دستمزد *
                    </label>
                    <input
                      type="text"
                      {...register('inspectorInfo.fee')}
                      readOnly
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg bg-blue-50 cursor-not-allowed text-gray-600 font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* دکمه ثبت جمع و جورتر */}
            <div className="flex justify-center pt-3"> {/* کاهش padding */}
              <button
                type="submit"
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-lg hover:shadow transform hover:-translate-y-0.5 font-semibold text-sm flex items-center" /* کاهش سایز */
              >
                <FaCheck className="ml-2 text-xs" /> {/* کاهش سایز آیکون */}
                ادامه به مرحله بعد
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* پوپاپ خطا (کاهش سایز) */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs w-full text-center"> {/* کاهش padding */}
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-2"> {/* کاهش سایز */}
              <FaExclamationTriangle className="w-5 h-5 text-white" /> {/* کاهش سایز آیکون */}
            </div>
            <h3 className="text-xs font-bold text-gray-800 mb-1">خطا در ثبت</h3> {/* کاهش سایز فونت */}
            <p className="text-gray-600 text-xs mb-3">{errorMessage}</p> {/* کاهش سایز فونت */}
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:from-red-600 hover:to-red-700 transition duration-200 font-semibold text-xs" /* کاهش سایز */
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionForm;