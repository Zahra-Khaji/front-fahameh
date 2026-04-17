import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaCity, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { useCreateCity, useUpdateCity, useProvinces } from "../../hooks/useProvinces";
import Button from "../ui/Button";
import { showSuccessToast, showErrorToast, showLoadingToast } from "../../utils/toastConfig";
import toast from 'react-hot-toast';

const AddCityModal = ({ 
  isOpen, 
  onClose, 
  onAddCity, 
  initialData = null, 
  isEdit = false, 
  provinces = [],
  selectedProvinceId = ""  // اضافه شده: استان انتخاب شده از BaseDataForm
}) => {
  const { data: provincesData } = useProvinces();
  const allProvinces = provinces.length > 0 ? provinces : (provincesData || []);
  
  const [formData, setFormData] = useState({
    name: "",
    province_id: ""
  });
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createCity, isLoading: isCreating } = useCreateCity();
  const { mutate: updateCity, isLoading: isUpdating } = useUpdateCity();

  // پیدا کردن نام استان انتخاب شده برای نمایش
  const selectedProvinceName = allProvinces.find(
    p => p.id === (isEdit ? formData.province_id : selectedProvinceId)
  )?.name || "";

  // ریست فرم وقتی مدال باز می‌شود یا initialData تغییر می‌کند
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // حالت ویرایش - پر کردن فرم با داده‌های موجود
        setFormData({
          name: initialData.name || "",
          province_id: initialData.province_id || ""
        });
      } else {
        // حالت ایجاد جدید - استفاده از selectedProvinceId از BaseDataForm
        setFormData({
          name: "",
          province_id: selectedProvinceId
        });
      }
      setLocalError("");
    }
  }, [isOpen, isEdit, initialData, selectedProvinceId]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "نام شهر الزامی است";
    }
    
    if (formData.name.trim().length < 2) {
      return "نام شهر باید حداقل ۲ حرف داشته باشد";
    }
    
    if (!formData.province_id) {
      return "انتخاب استان الزامی است";
    }
    
    return null;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    
    setLocalError("");
    setIsSubmitting(true);
    
    // آماده سازی داده برای API
    const apiData = {
      name: formData.name.trim(),
      province_id: parseInt(formData.province_id)
    };
    
    console.log('📤 Sending city data to API:', apiData);
    
    if (isEdit && initialData?.id) {
      // حالت ویرایش
      const loadingToast = showLoadingToast('در حال بروزرسانی شهر...');
      
      updateCity(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedCity) => {
            toast.dismiss(loadingToast);
            
            if (onAddCity) {
              onAddCity(updatedCity);
            }
            
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error('❌ Error updating city:', error);
            
            let errorMessage = 'خطا در بروزرسانی شهر';
            
            if (error?.response?.data?.detail) {
              const detail = error.response.data.detail;
              if (typeof detail === 'string' && detail.includes('already exists')) {
                errorMessage = `شهر "${formData.name.trim()}" قبلاً در این استان ثبت شده است.`;
              } else {
                errorMessage = detail;
              }
            } else if (error?.message) {
              errorMessage = error.message;
            }
            
            setLocalError(errorMessage);
            setIsSubmitting(false);
          }
        }
      );
    } else {
      // حالت ایجاد جدید
      const loadingToast = showLoadingToast('در حال ایجاد شهر جدید...');
      
      createCity(apiData, {
        onSuccess: (newCity) => {
          toast.dismiss(loadingToast);
          
          if (onAddCity) {
            onAddCity(newCity);
          }
          
          setTimeout(() => {
            setFormData({ name: "", province_id: "" });
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Error creating city:', error);
          
          let errorMessage = 'خطا در ایجاد شهر';
          
          if (error?.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string' && detail.includes('already exists')) {
              errorMessage = `شهر "${formData.name.trim()}" قبلاً در این استان ثبت شده است.`;
            } else {
              errorMessage = detail;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          setLocalError(errorMessage);
          setIsSubmitting(false);
        }
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating && !isUpdating) {
      setFormData({ name: "", province_id: "" });
      setLocalError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaCity className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? 'ویرایش شهر' : 'افزودن شهر جدید'}
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

          {/* نمایش استان (غیرقابل ویرایش) - فقط در حالت ایجاد جدید */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaMapMarkerAlt className="ml-1 text-purple-500" />
                استان
              </label>
              <div className="w-full px-3 py-2.5 text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                {selectedProvinceName || (selectedProvinceId ? "در حال بارگذاری..." : "استانی انتخاب نشده است")}
              </div>
              {/* فیلد مخفی برای ذخیره province_id */}
              <input
                type="hidden"
                name="province_id"
                value={formData.province_id}
              />
            </div>
          )}

          {/* انتخاب استان - فقط در حالت ویرایش (امکان تغییر استان) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaMapMarkerAlt className="ml-1 text-purple-500" />
                استان *
              </label>
              <select
                name="province_id"
                value={formData.province_id}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              >
                <option value="">انتخاب استان</option>
                {allProvinces?.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* نام شهر */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCity className="ml-1 text-blue-500" />
              نام شهر *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام شهر را وارد کنید"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={isLoading || !formData.name.trim() || (!isEdit && !formData.province_id)}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : (isEdit ? 'بروزرسانی شهر' : 'ثبت شهر')}
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

export default AddCityModal;