import React, { useState, useEffect } from "react";
import { 
  FaTimes, 
  FaMapMarkerAlt, 
  FaSpinner, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { useCreateProvince, useUpdateProvince } from "../../hooks/useProvinces";
import Button from "../ui/Button";
import { showSuccessToast, showErrorToast, showLoadingToast } from "../../utils/toastConfig";
import toast from 'react-hot-toast';


const AddProvinceModal = ({ isOpen, onClose, onAddProvince, initialData = null, isEdit = false }) => {
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createProvince, isLoading: isCreating } = useCreateProvince();
  const { mutate: updateProvince, isLoading: isUpdating } = useUpdateProvince();

  // ریست فرم وقتی مدال باز می‌شود یا initialData تغییر می‌کند
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // حالت ویرایش - پر کردن فرم با داده‌های موجود
        setName(initialData.name || "");
      } else {
        // حالت ایجاد جدید - ریست فرم
        setName("");
      }
      setLocalError("");
    }
  }, [isOpen, isEdit, initialData]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    if (!name.trim()) {
      return "نام استان الزامی است";
    }
    
    if (name.trim().length < 2) {
      return "نام استان باید حداقل ۲ حرف داشته باشد";
    }
    
    return null;
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
      name: name.trim()
    };
    
    console.log('📤 Sending province data to API:', apiData);
    
    if (isEdit && initialData?.id) {
      // حالت ویرایش
      const loadingToast = showLoadingToast('در حال بروزرسانی استان...');
      
      updateProvince(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedProvince) => {
            toast.dismiss(loadingToast);
            // showSuccessToast(`استان "${name.trim()}" با موفقیت بروزرسانی شد`);
            
            if (onAddProvince) {
              onAddProvince(updatedProvince);
            }
            
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error('❌ Error updating province:', error);
            
            let errorMessage = 'خطا در بروزرسانی استان';
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
      const loadingToast = showLoadingToast('در حال ایجاد استان جدید...');
      
      createProvince(apiData, {
        onSuccess: (newProvince) => {
          toast.dismiss(loadingToast);
          // showSuccessToast(`استان "${name.trim()}" با موفقیت ایجاد شد`);
          
          if (onAddProvince) {
            onAddProvince(newProvince);
          }
          
          setTimeout(() => {
            setName("");
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Error creating province:', error);
          
          let errorMessage = 'خطا در ایجاد استان';
          
          // مدیریت خطای تکراری بودن نام استان
          if (error?.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string' && detail.includes('already exists')) {
              errorMessage = `استان "${name.trim()}" قبلاً ثبت شده است. لطفاً نام دیگری انتخاب کنید.`;
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
      setName("");
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
            <FaMapMarkerAlt className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? 'ویرایش استان' : 'افزودن استان جدید'}
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

          {/* نام استان */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-1 text-blue-500" />
              نام استان *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (localError) setLocalError("");
              }}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام استان را وارد کنید"
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
              disabled={isLoading || !name.trim()}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? 'در حال ثبت...' : (isEdit ? 'بروزرسانی استان' : 'ثبت استان')}
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

export default AddProvinceModal;