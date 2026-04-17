import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaBuilding, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaGlobe,
  FaSpinner,
  FaExclamationTriangle
} from "react-icons/fa";
import { useCreateVendor, useUpdateVendor } from "../../hooks/useVendors";
import Button from "../ui/Button";
import { showSuccessToast, showErrorToast, showLoadingToast } from "../../utils/toastConfig";
import toast from 'react-hot-toast';


const AddVendorModal = ({ isOpen, onClose, onAddVendor, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    over_domestic: false
  });
  
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createVendor, isLoading: isCreating } = useCreateVendor();
  const { mutate: updateVendor, isLoading: isUpdating } = useUpdateVendor();

  // ریست فرم وقتی مدال باز می‌شود یا initialData تغییر می‌کند
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // حالت ویرایش - پر کردن فرم با داده‌های موجود
        setFormData({
          name: initialData.name || "",
          address: initialData.address || "",
          contact_person: initialData.contact_person || "",
          phone: initialData.phone || "",
          email: initialData.email || "",
          over_domestic: initialData.over_domestic || false
        });
      } else {
        // حالت ایجاد جدید - ریست فرم
        setFormData({
          name: "",
          address: "",
          contact_person: "",
          phone: "",
          email: "",
          over_domestic: false
        });
      }
      setLocalError("");
    }
  }, [isOpen, isEdit, initialData]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "نام وندور الزامی است";
    }
    
    if (formData.name.trim().length < 2) {
      return "نام وندور باید حداقل ۲ حرف داشته باشد";
    }
    
    if (formData.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(formData.phone)) {
      if (formData.phone.trim() !== "") {
        return "شماره تماس معتبر نیست";
      }
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      if (formData.email.trim() !== "") {
        return "ایمیل معتبر نیست";
      }
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
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
      name: formData.name.trim(),
      over_domestic: formData.over_domestic,
      address: formData.address.trim() || null,
      contact_person: formData.contact_person.trim() || null,
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null
    };
    
    console.log('📤 Sending vendor data to API:', apiData);
    
    if (isEdit && initialData?.id) {
      // حالت ویرایش
      const loadingToast = showLoadingToast('در حال بروزرسانی وندور...');
      
      updateVendor(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedVendor) => {
            toast.dismiss(loadingToast);
            // showSuccessToast(`وندور "${formData.name}" با موفقیت بروزرسانی شد`);
            
            if (onAddVendor) {
              onAddVendor(updatedVendor);
            }
            
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error('❌ Error updating vendor:', error);
            
            let errorMessage = 'خطا در بروزرسانی وندور';
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
      const loadingToast = showLoadingToast('در حال ایجاد وندور جدید...');
      
      createVendor(apiData, {
        onSuccess: (newVendor) => {
          toast.dismiss(loadingToast);
          // showSuccessToast(`وندور "${formData.name}" با موفقیت ایجاد شد`);
          
          if (onAddVendor) {
            onAddVendor(newVendor);
          }
          
          setTimeout(() => {
            setFormData({
              name: "",
              address: "",
              contact_person: "",
              phone: "",
              email: "",
              over_domestic: false
            });
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Error creating vendor:', error);
          
          let errorMessage = 'خطا در ایجاد وندور';
          
          // مدیریت خطای تکراری بودن نام وندور
          if (error?.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string' && detail.includes('already exists')) {
              errorMessage = `وندور "${formData.name}" قبلاً ثبت شده است. لطفاً نام دیگری انتخاب کنید.`;
            } else {
              errorMessage = detail;
            }
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
        name: "",
        address: "",
        contact_person: "",
        phone: "",
        email: "",
        over_domestic: false
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
            <FaBuilding className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? 'ویرایش وندور' : 'افزودن وندور جدید'}
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

          {/* نام وندور */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaBuilding className="ml-1 text-blue-500" />
              نام وندور *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام کامل وندور"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* شخص رابط */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaUser className="ml-1 text-purple-500" />
              شخص رابط
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام شخص رابط"
              disabled={isLoading}
            />
          </div>

          {/* شماره تماس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaPhone className="ml-1 text-green-500" />
              شماره تماس
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="شماره تماس"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaEnvelope className="ml-1 text-yellow-500" />
              ایمیل
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@domain.com"
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* آدرس */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-1 text-red-500" />
              آدرس
              <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              placeholder="آدرس کامل"
              disabled={isLoading}
              rows={2}
            />
          </div>

          {/* وندور خارجی - چک‌باکس */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="over_domestic"
                checked={formData.over_domestic}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <FaGlobe className="text-cyan-500" />
                وندور خارجی
              </span>
            </label>
            <p className="text-xs text-gray-400 mt-1 mr-6">
              در صورت فعال بودن، این وندور به عنوان وندور خارجی در نظر گرفته می‌شود
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={isLoading || !formData.name.trim()}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : (isEdit ? 'بروزرسانی وندور' : 'ثبت وندور')}
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

export default AddVendorModal;