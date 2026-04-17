import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaUserTie, 
  FaIdCard, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaTag, 
  FaMoneyBillWave, 
  FaGlobe,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";
import { useCreateInspector, useUpdateInspector } from "../../hooks/useInspectors";
import Button from "../ui/Button";
import { showSuccessToast, showErrorToast, showLoadingToast } from "../../utils/toastConfig";
import toast from 'react-hot-toast';


const AddInspectorModal = ({ isOpen, onClose, onAddInspector, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    Inspector_Name: "",
    PersonnelCode: "",
    Inspector_Discipline: "",
    Inspector_Email: "",
    Inspector_phone_no: "",
    Location_Coverd: "",
    status: "Active",
    Price: "",
    OVRDom: "Domestic",
    Price1403: ""
  });
  
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createInspector, isLoading: isCreating } = useCreateInspector();
  const { mutate: updateInspector, isLoading: isUpdating } = useUpdateInspector();

  // ریست فرم وقتی مدال باز می‌شود یا initialData تغییر می‌کند
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // حالت ویرایش - پر کردن فرم با داده‌های موجود
        setFormData({
          Inspector_Name: initialData.Inspector_Name || initialData.name || "",
          PersonnelCode: initialData.PersonnelCode || "",
          Inspector_Discipline: initialData.Inspector_Discipline || "",
          Inspector_Email: initialData.Inspector_Email || initialData.email || "",
          Inspector_phone_no: initialData.Inspector_phone_no || initialData.phone || "",
          Location_Coverd: initialData.Location_Coverd || initialData.location || "",
          status: initialData.status || "Active",
          Price: initialData.Price || "",
          OVRDom: initialData.OVRDom || "Domestic",
          Price1403: initialData.Price1403 || ""
        });
      } else {
        // حالت ایجاد جدید - ریست فرم
        setFormData({
          Inspector_Name: "",
          PersonnelCode: "",
          Inspector_Discipline: "",
          Inspector_Email: "",
          Inspector_phone_no: "",
          Location_Coverd: "",
          status: "Active",
          Price: "",
          OVRDom: "Domestic",
          Price1403: ""
        });
      }
      setLocalError("");
    }
  }, [isOpen, isEdit, initialData]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (!formData.Inspector_Name.trim()) {
      return "نام بازرس الزامی است";
    }
    
    if (formData.Inspector_Name.trim().length < 2) {
      return "نام بازرس باید حداقل ۲ حرف داشته باشد";
    }
    
    if (formData.Inspector_phone_no && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(formData.Inspector_phone_no)) {
      if (formData.Inspector_phone_no.trim() !== "") {
        return "شماره تماس معتبر نیست";
      }
    }
    
    if (formData.Inspector_Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Inspector_Email)) {
      if (formData.Inspector_Email.trim() !== "") {
        return "ایمیل معتبر نیست";
      }
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      // showErrorToast(validationError);
      return;
    }
    
    setLocalError("");
    setIsSubmitting(true);
    
    // آماده سازی داده برای API
    const apiData = {
      Inspector_Name: formData.Inspector_Name.trim(),
      PersonnelCode: formData.PersonnelCode.trim() || null,
      Inspector_Discipline: formData.Inspector_Discipline.trim() || null,
      Inspector_Email: formData.Inspector_Email.trim() || null,
      Inspector_phone_no: formData.Inspector_phone_no.trim() || null,
      Location_Coverd: formData.Location_Coverd.trim() || null,
      status: formData.status,
      Price: formData.Price ? parseInt(formData.Price) : null,
      OVRDom: formData.OVRDom,
      Price1403: formData.Price1403 ? parseInt(formData.Price1403) : null
    };
    
    console.log('📤 Sending inspector data to API:', apiData);
    
    if (isEdit && initialData?.id) {
      // حالت ویرایش
      const loadingToast = showLoadingToast('در حال بروزرسانی بازرس...');
      
      updateInspector(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedInspector) => {
            toast.dismiss(loadingToast);
            // showSuccessToast(`بازرس "${formData.Inspector_Name}" با موفقیت بروزرسانی شد`);
            
            if (onAddInspector) {
              onAddInspector(updatedInspector);
            }
            
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error('❌ Error updating inspector:', error);
            
            let errorMessage = 'خطا در بروزرسانی بازرس';
            if (error?.response?.data?.detail) {
              errorMessage = error.response.data.detail;
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            setLocalError(errorMessage);
            // showErrorToast(errorMessage);
            setIsSubmitting(false);
          }
        }
      );
    } else {
      // حالت ایجاد جدید
      const loadingToast = showLoadingToast('در حال ایجاد بازرس جدید...');
      
      createInspector(apiData, {
        onSuccess: (newInspector) => {
          toast.dismiss(loadingToast);
          // showSuccessToast(`بازرس "${formData.Inspector_Name}" با موفقیت ایجاد شد`);
          
          if (onAddInspector) {
            onAddInspector(newInspector);
          }
          
          setTimeout(() => {
            setFormData({
              Inspector_Name: "",
              PersonnelCode: "",
              Inspector_Discipline: "",
              Inspector_Email: "",
              Inspector_phone_no: "",
              Location_Coverd: "",
              status: "Active",
              Price: "",
              OVRDom: "Domestic",
              Price1403: ""
            });
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Error creating inspector:', error);
          
          let errorMessage = 'خطا در ایجاد بازرس';
          if (error?.response?.data?.detail) {
            errorMessage = error.response.data.detail;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          setLocalError(errorMessage);
          // showErrorToast(errorMessage);
          setIsSubmitting(false);
        }
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating && !isUpdating) {
      setFormData({
        Inspector_Name: "",
        PersonnelCode: "",
        Inspector_Discipline: "",
        Inspector_Email: "",
        Inspector_phone_no: "",
        Location_Coverd: "",
        status: "Active",
        Price: "",
        OVRDom: "Domestic",
        Price1403: ""
      });
      setLocalError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaUserTie className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? 'ویرایش بازرس' : 'افزودن بازرس جدید'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            title="بستن"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* نمایش خطا */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start">
                <FaExclamationTriangle className="h-5 w-5 text-red-400 ml-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <strong className="font-semibold">خطا:</strong>
                  <p className="mt-1">{localError}</p>
                </div>
              </div>
            </div>
          )}

          {/* نام بازرس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaUserTie className="ml-1 text-blue-500" />
              نام بازرس *
            </label>
            <input
              type="text"
              name="Inspector_Name"
              value={formData.Inspector_Name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="نام کامل بازرس"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* کد پرسنلی */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaIdCard className="ml-1 text-purple-500" />
              کد پرسنلی
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="text"
              name="PersonnelCode"
              value={formData.PersonnelCode}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="کد پرسنلی"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* تخصص */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaTag className="ml-1 text-orange-500" />
              تخصص
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="text"
              name="Inspector_Discipline"
              value={formData.Inspector_Discipline}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="تخصص (مثال: Civil, Mechanical)"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaEnvelope className="ml-1 text-green-500" />
              ایمیل
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="email"
              name="Inspector_Email"
              value={formData.Inspector_Email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@domain.com"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* شماره تماس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaPhone className="ml-1 text-yellow-500" />
              شماره تماس
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="tel"
              name="Inspector_phone_no"
              value={formData.Inspector_phone_no}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="شماره تماس"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* محدوده پوشش */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-1 text-red-500" />
              محدوده پوشش
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="text"
              name="Location_Coverd"
              value={formData.Location_Coverd}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="محدوده پوشش (مثال: تهران، کرج)"
              disabled={isLoading}
            />
          </div>

          {/* وضعیت */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaGlobe className="ml-1 text-indigo-500" />
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="Active">فعال</option>
              <option value="Inactive">غیرفعال</option>
            </select>
          </div>

          {/* نوع (داخلی/خارجی) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaGlobe className="ml-1 text-cyan-500" />
              نوع
            </label>
            <select
              name="OVRDom"
              value={formData.OVRDom}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <option value="Domestic">داخلی</option>
              <option value="Foreign">خارجی</option>
            </select>
          </div>

          {/* هزینه (قیمت) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMoneyBillWave className="ml-1 text-green-600" />
            دستمزد
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="number"
              name="Price"
              value={formData.Price}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="مبلغ به تومان"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* قیمت ۱۴۰۳ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMoneyBillWave className="ml-1 text-teal-500" />
              دستمزد ۱۴۰۳
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="number"
              name="Price1403"
              value={formData.Price1403}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              // placeholder="مبلغ به تومان"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={isLoading || !formData.Inspector_Name.trim()}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : (isEdit ? 'بروزرسانی بازرس' : 'ثبت بازرس')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInspectorModal;