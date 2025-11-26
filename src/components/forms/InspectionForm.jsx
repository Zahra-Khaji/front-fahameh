// src/components/forms/InspectionForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FaClipboardList,
  FaUserTie,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
  FaPlusCircle
} from 'react-icons/fa';

// Components
import StepHeader from '../common/StepHeader';
import FormSection from '../common/FormSection';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import SearchableSelect from '../ui/SearchableSelect';
import Button from '../ui/Button';
import ErrorPopup from '../ui/ErrorPopup';
import AddProjectModal from '../ui/AddProjectModal';
import AddVendorModal from '../ui/AddVendorModal';

// Data & Utils
import { projectTypes } from '../../data/staticData';
import { inspectionSchema } from '../../utils/validationSchemas';

// Hooks
import { useInspectors ,useInspector} from '../../hooks/useInspectors';
import { useProjects } from '../../hooks/useProjects';
import { useProvinces, useCities } from '../../hooks/useProvinces';
import { useVendors } from '../../hooks/useVendors'; 
import { useProjectTypes } from '../../hooks/useProjectTypes';

const InspectionForm = ({ onComplete }) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [touchedFields, setTouchedFields] = useState({});
  const [inspectorFieldStatus, setInspectorFieldStatus] = useState({
    location: false,
    phone: false,
    email: false,
    expertise: false
  });
  const [feeDisplayValue, setFeeDisplayValue] = useState('');
  const [isFeeFocused, setIsFeeFocused] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [tempProjects, setTempProjects] = useState([]);
  const [tempVendors, setTempVendors] = useState([]);

  // استفاده از هوک برای دریافت داده‌ها
  const { 
    data: inspectors, 
    isLoading: inspectorsLoading, 
    error: inspectorsError 
  } = useInspectors();

  const { 
    data: selectedInspectorDetails, 
    isLoading: inspectorDetailsLoading,
    error: inspectorDetailsError 
  } = useInspector(selectedInspectorId);

  const { 
    data: projects, 
    isLoading: projectsLoading, 
    error: projectsError 
  } = useProjects();
  const { 
    data: projectTypes, 
    isLoading: projectTypesLoading, 
    error: projectTypesError 
  } = useProjectTypes();

  const { 
    data: provinces, 
    isLoading: provincesLoading, 
    error: provincesError 
  } = useProvinces();

  const { 
    data: vendors, 
    isLoading: vendorsLoading, 
    error: vendorsError 
  } = useVendors();

  // ترکیب پروژه‌های اصلی و موقت
  const allProjects = useMemo(() => {
    return [...(projects || []), ...tempProjects];
  }, [projects, tempProjects]);

  // ترکیب وندورهای اصلی و موقت
  const allVendors = useMemo(() => {
    return [...(vendors || []), ...tempVendors];
  }, [vendors, tempVendors]);

  // تبدیل داده‌ها به فرمت مورد نیاز برای SearchableSelect
  const projectOptions = useMemo(() => {
    return allProjects?.map(project => ({
      value: project.id,
      label: project.name,
      ...project
    })) || [];
  }, [allProjects]);

  const provinceOptions = useMemo(() => {
    return provinces?.map(province => ({
      value: province.id,
      label: province.name,
      ...province
    })) || [];
  }, [provinces]);

  const vendorOptions = useMemo(() => {
    return allVendors?.map(vendor => ({
      value: vendor.id,
      label: vendor.name,
      ...vendor
    })) || [];
  }, [allVendors]);

  const inspectorOptions = useMemo(() => {
    return inspectors?.map(inspector => ({
      value: inspector.id,
      label: inspector.name,
      ...inspector
    })) || [];
  }, [inspectors]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm({
    resolver: zodResolver(inspectionSchema),
    defaultValues: {
      projectInfo: {
        projectName: '',
        projectType: '', 
        projectTypeId: '', // ID عددی
        province: '',
        city: '',
        vendor: '',
      },
      inspectorInfo: {
        inspectorName: '',
        inspectorLocation: '',
        phoneNumber: '',
        email: '',
        expertise: '',
        fee: '',
      },
    },
    mode: 'onTouched',
  });

  const currentProvince = watch('projectInfo.province');
  
  const { 
    data: cities, 
    isLoading: citiesLoading, 
    error: citiesError 
  } = useCities(currentProvince);

  // تابع برای افزودن پروژه جدید
  const handleAddProject = (projectData) => {
    const newProject = {
      id: `temp-${Date.now()}`,
      name: projectData.name,
      abbreviation: projectData.abbreviation,
      subProject: projectData.subProject,
      isTemp: true
    };
    
    setTempProjects(prev => [...prev, newProject]);
    
    setTimeout(() => {
      handleProjectChange(newProject.id);
    }, 100);
  };

  // تابع برای افزودن وندور جدید
  const handleAddVendor = (vendorData) => {
    const newVendor = {
      id: `temp-vendor-${Date.now()}`,
      name: vendorData.name,
      address: vendorData.address,
      phone: vendorData.phone,
      email: vendorData.email,
      isTemp: true
    };
    
    setTempVendors(prev => [...prev, newVendor]);
    
    setTimeout(() => {
      handleVendorChange(newVendor.id);
    }, 100);
  };

  // تابع برای حذف فرمت از عدد
  const removeFormatting = (formattedValue) => {
    if (!formattedValue) return '';
    return formattedValue
      .replace(/[٬,]/g, '')
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
      .replace(/تومان/g, '')
      .trim();
  };

  // تابع برای فرمت کردن عدد به فارسی
  const formatToPersian = (number) => {
    if (!number) return '';
    const numStr = number.toString().replace(/\D/g, '');
    if (!numStr) return '';
    
    const formattedNumber = new Intl.NumberFormat('fa-IR').format(numStr);
    return `${formattedNumber} تومان`;
  };

  // بررسی اینکه آیا فیلد از API مقدار دریافت کرده یا نه
  const isFieldFromAPI = (fieldValue) => {
    return fieldValue && fieldValue.trim() !== '';
  };

  // هندلر تغییر فیلد دستمزد
  const handleFeeChange = (e) => {
    const inputValue = e.target.value;
    
    const rawValue = inputValue.replace(/\D/g, '');
    
    setValue('inspectorInfo.fee', rawValue, { shouldValidate: true });
    
    if (isFeeFocused) {
      setFeeDisplayValue(rawValue);
    } else {
      setFeeDisplayValue(formatToPersian(rawValue));
    }
  };

  // هندلر فوکوس فیلد دستمزد
  const handleFeeFocus = () => {
    setIsFeeFocused(true);
    const currentValue = watch('inspectorInfo.fee');
    setFeeDisplayValue(currentValue || '');
  };

  // هندلر بلور فیلد دستمزد
  const handleFeeBlur = () => {
    setIsFeeFocused(false);
    const currentValue = watch('inspectorInfo.fee');
    setFeeDisplayValue(formatToPersian(currentValue));
    trigger('inspectorInfo.fee');
  };

  // وقتی جزئیات بازرس دریافت شد، فیلدها رو پر کن و وضعیت readonly رو تنظیم کن
  useEffect(() => {
    if (selectedInspectorDetails) {
      console.log('Setting inspector details:', selectedInspectorDetails);
      
      setValue('inspectorInfo.inspectorName', selectedInspectorDetails.name || '');
      setValue('inspectorInfo.inspectorLocation', selectedInspectorDetails.location || '');
      setValue('inspectorInfo.phoneNumber', selectedInspectorDetails.phone || '');
      setValue('inspectorInfo.email', selectedInspectorDetails.email || '');
      setValue('inspectorInfo.expertise', selectedInspectorDetails.expertise || '');
      
      if (selectedInspectorDetails.fee) {
        const rawFee = removeFormatting(selectedInspectorDetails.fee);
        setValue('inspectorInfo.fee', rawFee);
        setFeeDisplayValue(formatToPersian(rawFee));
      } else {
        setValue('inspectorInfo.fee', '');
        setFeeDisplayValue('');
      }

      setInspectorFieldStatus({
        location: isFieldFromAPI(selectedInspectorDetails.location),
        phone: isFieldFromAPI(selectedInspectorDetails.phone),
        email: isFieldFromAPI(selectedInspectorDetails.email),
        expertise: isFieldFromAPI(selectedInspectorDetails.expertise)
      });
    }
  }, [selectedInspectorDetails, setValue]);

  // وقتی بازرس تغییر کرد، وضعیت فیلدها رو ریست کن
  useEffect(() => {
    if (!selectedInspectorId) {
      setInspectorFieldStatus({
        location: false,
        phone: false,
        email: false,
        expertise: false
      });
      setFeeDisplayValue('');
      setIsFeeFocused(false);
    }
  }, [selectedInspectorId]);

  useEffect(() => {
    if (cities) {
      console.log('Cities data received for province', currentProvince, ':', cities);
    }
  }, [cities, currentProvince]);

  // مدیریت تغییر استان
  const handleProvinceChange = (provinceId) => {
    setSelectedProvinceId(provinceId);
    setValue('projectInfo.province', provinceId, { shouldValidate: true });
    setValue('projectInfo.city', '');
  };

  // مدیریت تغییر پروژه
  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    
    const selectedProject = allProjects?.find(project => project.id === projectId);
    if (selectedProject) {
      setValue('projectInfo.projectName', selectedProject.name, { shouldValidate: true });
      setValue('projectInfo.projectId', selectedProject.id, { shouldValidate: true });
    } else {
      setValue('projectInfo.projectName', '', { shouldValidate: true });
      setValue('projectInfo.projectId', '', { shouldValidate: true });
    }
  };

  // مدیریت تغییر وندور
  const handleVendorChange = (vendorId) => {
    setSelectedVendorId(vendorId);
    setValue('projectInfo.vendor', vendorId, { shouldValidate: true });
  };

  // مدیریت تغییر بازرس
  const handleInspectorChange = (inspectorId) => {
    setSelectedInspectorId(inspectorId);
    
    const selectedInspector = inspectors?.find(insp => insp.id === inspectorId);
    if (selectedInspector) {
      setValue('inspectorInfo.inspectorName', selectedInspector.name, { shouldValidate: true });
    } else {
      setValue('inspectorInfo.inspectorName', '', { shouldValidate: true });
      setValue('inspectorInfo.inspectorLocation', '');
      setValue('inspectorInfo.phoneNumber', '');
      setValue('inspectorInfo.email', '');
      setValue('inspectorInfo.expertise', '');
      setValue('inspectorInfo.fee', '');
      setFeeDisplayValue('');
      setIsFeeFocused(false);
      
      setInspectorFieldStatus({
        location: false,
        phone: false,
        email: false,
        expertise: false
      });
    }
  };

  // تابع برای گرفتن کلاس CSS بر اساس وضعیت readonly
  const getFieldClassName = (isReadOnly) => {
    const baseClass = "py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right";
    return isReadOnly 
      ? `${baseClass} bg-blue-50 cursor-not-allowed`
      : `${baseClass} bg-white border-gray-300`;
  };

  const onSubmit = (data) => {
    console.log('Form Data:', data);
    
    const formattedData = {
      ...data,
      projectInfo: {
        ...data.projectInfo,
        projectId: selectedProjectId
      },
      inspectorInfo: {
        ...data.inspectorInfo,
        fee: formatToPersian(data.inspectorInfo.fee)
      }
    };
    
    console.log('Formatted Data with projectId:', formattedData);
    onComplete(formattedData);
  };

  const onError = (errors) => {
    console.log('Form Errors:', errors);
    const firstError = Object.values(errors).find((error) => error);
    if (firstError) {
      setErrorMessage('لطفاً تمام فیلدهای الزامی را پر کنید');
      setShowErrorPopup(true);
    }
  };

  // نمایش خطا در صورت مشکل در دریافت داده‌ها
  useEffect(() => {
    if (inspectorsError || projectsError || provincesError || vendorsError || projectTypesError) {
      setErrorMessage('خطا در دریافت داده‌ها از سرور');
      setShowErrorPopup(true);
    }
  }, [inspectorsError, projectsError, provincesError, vendorsError, projectTypesError]);

  // وضعیت لودینگ کلی
  const isLoading = inspectorsLoading || projectsLoading || provincesLoading || vendorsLoading;
  const hasError = inspectorsError || projectsError || provincesError || vendorsError;

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        
        <StepHeader
          title="سامانه درخواست بازرسی"
          description="فرم ثبت درخواست بازرسی فنی و کیفیت"
          icon={FaClipboardList}
        />

        <div className="bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="p-3 sm:p-3 lg:p-4">
            
            {/* Project Information Section */}
            <FormSection
              title="اطلاعات درخواست بازرسی"
              icon={FaClipboardList}
              className="mb-2 lg:mb-3"
            >
            
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3 mb-2 lg:mb-2 items-end">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                      نام پروژه *
                      <button
                        type="button"
                        onClick={() => setShowAddProjectModal(true)}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                        title="افزودن پروژه جدید"
                      >
                        <FaPlusCircle className="text-sm" />
                      </button>
                    </label>
                  </div>
                  <SearchableSelect
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                    options={projectOptions}
                    placeholder={
                      projectsLoading ? "در حال دریافت لیست پروژه‌ها..." : 
                      projectsError ? "خطا در دریافت داده‌ها" : "جستجو و انتخاب پروژه..."
                    }
                    disabled={projectsLoading || !!projectsError}
                    error={isSubmitted && errors.projectInfo?.projectName}
                  />
                  <input 
                    type="hidden" 
                    {...register('projectInfo.projectName')} 
                  />
                  {isSubmitted && errors.projectInfo?.projectName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="ml-1 text-xs" />
                      {errors.projectInfo.projectName.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <SelectField
                    label=" داخلی/‌خارجی *"
                    {...register('projectInfo.projectType')}
                    onChange={(e) => {
                      setValue('projectInfo.projectType', e.target.value, { shouldValidate: true });
                      setValue('projectInfo.projectTypeId', e.target.value, { shouldValidate: true });
                    }}
                    error={isSubmitted && errors.projectInfo?.projectType}
                    options={projectTypes || []}
                    placeholder={
                      projectTypesLoading ? "در حال دریافت لیست انواع..." : 
                      projectTypesError ? "خطا در دریافت داده‌ها" : "انتخاب نوع پروژه"
                    }
                    disabled={projectTypesLoading || !!projectTypesError}
                    className="py-1.5 sm:py-1.5 lg:py-1.5"
                  />
                </div>
              </div>

              {/* سطر دوم: استان، شهر و وندور */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-2">
                {/* استان */}
                <div className="flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                    استان *
                  </label>
                  <SearchableSelect
                    value={selectedProvinceId}
                    onChange={handleProvinceChange}
                    options={provinceOptions}
                    placeholder={
                      provincesLoading ? "در حال دریافت لیست استان‌ها..." : 
                      provincesError ? "خطا در دریافت داده‌ها" : "جستجو و انتخاب استان"
                    }
                    disabled={provincesLoading || !!provincesError}
                    error={isSubmitted && errors.projectInfo?.province}
                  />
                  <input 
                    type="hidden" 
                    {...register('projectInfo.province')} 
                  />
                  {isSubmitted && errors.projectInfo?.province && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="ml-1 text-xs" />
                      {errors.projectInfo.province.message}
                    </p>
                  )}
                </div>

                {/* شهر */}
                <SelectField
                  label="شهر *"
                  {...register('projectInfo.city')}
                  error={isSubmitted && errors.projectInfo?.city}
                  disabled={!currentProvince || citiesLoading}
                  options={cities || []}
                  placeholder={
                    !currentProvince ? "ابتدا استان را انتخاب کنید" :
                    citiesLoading ? "در حال دریافت لیست شهرها..." :
                    citiesError ? "خطا در دریافت داده‌ها" : "انتخاب شهر"
                  }
                  className="py-1.5 sm:py-1.5 lg:py-1.5"
                />

                {/* وندور */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
                      وندور *
                      <button
                        type="button"
                        onClick={() => setShowAddVendorModal(true)}
                        className="text-blue-600 hover:text-blue-800 transition duration-200"
                        title="افزودن وندور جدید"
                      >
                        <FaPlusCircle className="text-sm" />
                      </button>
                    </label>
                  </div>
                  <SearchableSelect
                    value={selectedVendorId}
                    onChange={handleVendorChange}
                    options={vendorOptions}
                    placeholder={
                      vendorsLoading ? "در حال دریافت لیست وندورها..." : 
                      vendorsError ? "خطا در دریافت داده‌ها" : "جستجو و انتخاب وندور"
                    }
                    disabled={vendorsLoading || !!vendorsError}
                    error={isSubmitted && errors.projectInfo?.vendor}
                  />
                  <input 
                    type="hidden" 
                    {...register('projectInfo.vendor')} 
                  />
                  {isSubmitted && errors.projectInfo?.vendor && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <FaExclamationTriangle className="ml-1 text-xs" />
                      {errors.projectInfo.vendor.message}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Inspector Information Section */}
            <FormSection
              title="اطلاعات بازرس"
              icon={FaUserTie}
              className="mb-2 lg:mb-3"
            >
              {/* بازرس */}
              <div className="mb-2 lg:mb-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                  نام بازرس *
                </label>
                <SearchableSelect
                  value={selectedInspectorId}
                  onChange={handleInspectorChange}
                  options={inspectorOptions}
                  placeholder={
                    inspectorsLoading ? "در حال دریافت لیست بازرس‌ها..." : 
                    inspectorsError ? "خطا در دریافت داده‌ها" : "جستجو و انتخاب بازرس"
                  }
                  disabled={inspectorsLoading || !!inspectorsError}
                  error={isSubmitted && errors.inspectorInfo?.inspectorName}
                />
                <input 
                  type="hidden" 
                  {...register('inspectorInfo.inspectorName')} 
                />
                {isSubmitted && errors.inspectorInfo?.inspectorName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <FaExclamationTriangle className="ml-1 text-xs" />
                    {errors.inspectorInfo.inspectorName.message}
                  </p>
                )}
              </div>

              {/* فیلدهای اطلاعات بازرس با منطق جدید */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-2">
                {/* موقعیت - فقط اگر از API مقدار داشته باشد readonly */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="موقعیت (استان) *"
                    {...register('inspectorInfo.inspectorLocation')}
                    readOnly={inspectorFieldStatus.location}
                    className={getFieldClassName(inspectorFieldStatus.location)}
                  />
                </div>

                {/* شماره تماس - فقط اگر از API مقدار داشته باشد readonly */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="شماره تماس *"
                    {...register('inspectorInfo.phoneNumber')}
                    readOnly={inspectorFieldStatus.phone}
                    className={getFieldClassName(inspectorFieldStatus.phone)}
                  />
                </div>

                {/* تخصص - فقط اگر از API مقدار داشته باشد readonly */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="تخصص *"
                    {...register('inspectorInfo.expertise')}
                    readOnly={inspectorFieldStatus.expertise}
                    className={getFieldClassName(inspectorFieldStatus.expertise)}
                  />
                </div>

                {/* ایمیل - فقط اگر از API مقدار داشته باشد readonly */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="ایمیل *"
                    {...register('inspectorInfo.email')}
                    error={isSubmitted && errors.inspectorInfo?.email}
                    readOnly={inspectorFieldStatus.email}
                    className={getFieldClassName(inspectorFieldStatus.email)}
                  />
                </div>

                {/* دستمزد - همیشه قابل ویرایش با مدیریت عددی */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="flex flex-col">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      دستمزد *
                    </label>
                    <input
                      type="text"
                      value={feeDisplayValue}
                      onChange={handleFeeChange}
                      onFocus={handleFeeFocus}
                      onBlur={handleFeeBlur}
                      className="py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right bg-white border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                      placeholder="مبلغ به تومان"
                    />
                    <input 
                      type="hidden" 
                      {...register('inspectorInfo.fee')} 
                    />
                    {isSubmitted && errors.inspectorInfo?.fee && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <FaExclamationTriangle className="ml-1 text-xs" />
                        {errors.inspectorInfo.fee.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Submit Button */}
            <div className="flex justify-center pt-2 lg:pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon="check"
                className="w-full sm:w-auto px-8"
                disabled={isLoading}
              >
                {isLoading ? "در حال دریافت داده‌ها..." : "ادامه به مرحله بعد"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* مدال افزودن پروژه جدید */}
      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onAddProject={handleAddProject}
      />

      {/* مدال افزودن وندور جدید */}
      <AddVendorModal
        isOpen={showAddVendorModal}
        onClose={() => setShowAddVendorModal(false)}
        onAddVendor={handleAddVendor}
      />

      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title="خطا در ثبت"
        message={errorMessage}
      />
    </div>
  );
};

export default InspectionForm;