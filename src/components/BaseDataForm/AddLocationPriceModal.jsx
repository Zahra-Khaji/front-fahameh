import React, { useState, useEffect, useMemo } from "react";
import { 
  FaTimes, 
  FaMapMarkerAlt, 
  FaMoneyBillWave, 
  FaBuilding, 
  FaTag,
  FaSpinner,
  FaExclamationTriangle 
} from "react-icons/fa";
import { useCreateLocationPrice, useUpdateLocationPrice } from "../../hooks/useLocationPrice";
import { useProjects } from "../../hooks/useProjects";
import { useProjectTypes } from "../../hooks/useProjectTypes";
import Button from "../ui/Button";
import SearchableSelect from "../ui/SearchableSelect";
import { showSuccessToast, showErrorToast, showLoadingToast } from "../../utils/toastConfig";
import toast from "react-hot-toast";

// واحدهای قیمت ثابت
const UNIT_PRICE_OPTIONS = [
  { value: "IRR", label: "تومان" },
  { value: "USD", label: "دلار" },
  { value: "EUR", label: "یورو" }
];

const AddLocationPriceModal = ({ isOpen, onClose, onAddLocationPrice, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    projectId: "",
    projectName: "",
    OverDome: "",
    Overlocation: "",
    location: "",
    Price: "",
    UnitPrice: "IRR"
  });
  
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createLocationPrice, isLoading: isCreating } = useCreateLocationPrice();
  const { mutate: updateLocationPrice, isLoading: isUpdating } = useUpdateLocationPrice();
  
  const { data: projects, isLoading: projectsLoading } = useProjects(false);
  const { data: projectTypes, isLoading: projectTypesLoading } = useProjectTypes();

  // تبدیل پروژه‌ها به فرمت SearchableSelect
  const projectOptions = useMemo(() => {
    return projects?.map(project => ({
      value: project.id,
      label: project.name,
      ...project
    })) || [];
  }, [projects]);

  // تبدیل نوع پروژه به فرمت SearchableSelect - با value برابر name
  const projectTypeOptions = useMemo(() => {
    return projectTypes?.map(type => ({
      value: type.name,  // مهم: value برابر name است
      label: type.name,
      ...type
    })) || [];
  }, [projectTypes]);

  // ریست فرم
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // console.log("🟢 Editing location price - initialData:", initialData);
        
        setFormData({
          projectId: initialData.IDP?.toString() || "",
          projectName: "",
          OverDome: initialData.OverDome || "",  // اینجا name مستقیماً ذخیره می‌شود
          Overlocation: initialData.Overlocation || "",
          location: initialData.location || "",
          Price: initialData.Price?.toString() || "",
          UnitPrice: initialData.UnitPrice || "IRR"
        });
      } else {
        setFormData({
          projectId: "",
          projectName: "",
          OverDome: "",
          Overlocation: "",
          location: "",
          Price: "",
          UnitPrice: "IRR"
        });
      }
      setLocalError("");
    }
  }, [isOpen, isEdit, initialData]);

  const validateForm = () => {
    if (!formData.projectId) {
      return "انتخاب پروژه الزامی است";
    }
    if (!formData.OverDome) {
      return "انتخاب نوع پروژه الزامی است";
    }
    if (!formData.Overlocation.trim()) {
      return "نام استان الزامی است";
    }
    if (!formData.location.trim()) {
      return "نام شهر الزامی است";
    }
    if (!formData.Price || parseInt(formData.Price) <= 0) {
      return "قیمت باید بزرگتر از 0 باشد";
    }
    if (!formData.UnitPrice) {
      return "انتخاب واحد قیمت الزامی است";
    }
    return null;
  };

  const handleProjectChange = (projectId) => {
    const selected = projects?.find(p => p.id === projectId);
    setFormData(prev => ({
      ...prev,
      projectId,
      projectName: selected?.name || ""
    }));
  };

  const handleProjectTypeChange = (selectedValue) => {
    // selectedValue مستقیماً name است
    setFormData(prev => ({
      ...prev,
      OverDome: selectedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      showErrorToast(validationError);
      return;
    }
    
    setLocalError("");
    setIsSubmitting(true);
    
    const apiData = {
      Overlocation: formData.Overlocation.trim(),
      location: formData.location.trim(),
      OverDome: formData.OverDome,
      Price: parseInt(formData.Price),
      UnitPrice: formData.UnitPrice,
      projectName: formData.projectName,
      projectId: formData.projectId
    };
    
    // console.log("📤 Sending location price data:", apiData);
    
    if (isEdit && initialData?.id) {
      const loadingToast = showLoadingToast("در حال بروزرسانی تعرفه مکانی...");
      
      updateLocationPrice(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedItem) => {
            toast.dismiss(loadingToast);
            // showSuccessToast(`تعرفه مکانی "${formData.location}" با موفقیت بروزرسانی شد`);
            
            if (onAddLocationPrice) {
              onAddLocationPrice(updatedItem);
            }
            
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error("❌ Error updating location price:", error);
            setLocalError(error.message || "خطا در بروزرسانی تعرفه مکانی");
            showErrorToast(error.message || "خطا در بروزرسانی تعرفه مکانی");
            setIsSubmitting(false);
          }
        }
      );
    } else {
      const loadingToast = showLoadingToast("در حال ایجاد تعرفه مکانی...");
      
      createLocationPrice(apiData, {
        onSuccess: (newItem) => {
          toast.dismiss(loadingToast);
        //   showSuccessToast(`تعرفه مکانی "${formData.location}" با موفقیت ایجاد شد`);
          
          if (onAddLocationPrice) {
            onAddLocationPrice(newItem);
          }
          
          setTimeout(() => {
            setFormData({
              projectId: "",
              projectName: "",
              OverDome: "",
              Overlocation: "",
              location: "",
              Price: "",
              UnitPrice: "IRR"
            });
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
        //   console.error("❌ Error creating location price:", error);
          setLocalError(error.message || "خطا در ایجاد تعرفه مکانی");
          showErrorToast(error.message || "خطا در ایجاد تعرفه مکانی");
          setIsSubmitting(false);
        }
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating && !isUpdating) {
      setFormData({
        projectId: "",
        projectName: "",
        OverDome: "",
        Overlocation: "",
        location: "",
        Price: "",
        UnitPrice: "IRR"
      });
      setLocalError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  const isLoading = isSubmitting || isCreating || isUpdating;
  const isFormLoading = projectsLoading || projectTypesLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? "ویرایش تعرفه مکانی" : "افزودن تعرفه مکانی جدید"}
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

          {/* پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaBuilding className="ml-1 text-blue-500" />
              پروژه *
            </label>
            <SearchableSelect
              value={formData.projectId}
              onChange={handleProjectChange}
              options={projectOptions}
              placeholder={projectsLoading ? "در حال دریافت لیست پروژه‌ها..." : "جستجو و انتخاب پروژه"}
              disabled={projectsLoading || isLoading}
            />
          </div>

          {/* نوع پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaTag className="ml-1 text-purple-500" />
              نوع پروژه *
            </label>
            <SearchableSelect
              value={formData.OverDome}
              onChange={handleProjectTypeChange}
              options={projectTypeOptions}
              placeholder={projectTypesLoading ? "در حال دریافت لیست انواع پروژه..." : "جستجو و انتخاب نوع پروژه"}
              disabled={projectTypesLoading || isLoading}
            />
          </div>

          {/* استان - فیلد متنی */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-1 text-green-500" />
              Overlocation *
            </label>
            <input
              type="text"
              value={formData.Overlocation}
              onChange={(e) => setFormData(prev => ({ ...prev, Overlocation: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام استان را وارد کنید"
              required
              disabled={isLoading}
            />
          </div>

          {/* شهر - فیلد متنی */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMapMarkerAlt className="ml-1 text-teal-500" />
              location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="نام شهر را وارد کنید"
              required
              disabled={isLoading}
            />
          </div>

          {/* قیمت */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMoneyBillWave className="ml-1 text-yellow-500" />
              قیمت *
            </label>
            <input
              type="number"
              value={formData.Price}
              onChange={(e) => setFormData(prev => ({ ...prev, Price: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="مبلغ را وارد کنید"
              required
              disabled={isLoading}
              dir="ltr"
            />
          </div>

          {/* واحد قیمت */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaMoneyBillWave className="ml-1 text-orange-500" />
              واحد قیمت *
            </label>
            <select
              value={formData.UnitPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, UnitPrice: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {UNIT_PRICE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon={isLoading ? FaSpinner : undefined}
              className="flex-1"
              disabled={isLoading || isFormLoading}
              isLoading={isLoading}
              spinnerClassName="text-white"
            >
              {isLoading ? "در حال ثبت..." : (isEdit ? "بروزرسانی تعرفه مکانی" : "ثبت تعرفه مکانی")}
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

export default AddLocationPriceModal;