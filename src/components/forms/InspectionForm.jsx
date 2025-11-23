// src/components/forms/InspectionForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  FaClipboardList,
  FaUserTie,
  FaExclamationTriangle 
} from 'react-icons/fa';

// Components
import StepHeader from '../common/StepHeader';
import FormSection from '../common/FormSection';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import Button from '../ui/Button';
import ErrorPopup from '../ui/ErrorPopup';

// Data & Utils
import { projectTypes } from '../../data/staticData'; // vendors حذف شد
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
  } = useVendors(); // اضافه شد

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
        projectType: '', 
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
  });

  const currentProvince = watch('projectInfo.province');
  
  const { 
    data: cities, 
    isLoading: citiesLoading, 
    error: citiesError 
  } = useCities(currentProvince);


    // وقتی جزئیات بازرس دریافت شد، فیلدها رو پر کن - اضافه شد
    useEffect(() => {
      if (selectedInspectorDetails) {
        console.log('Setting inspector details:', selectedInspectorDetails);
        setValue('inspectorInfo.inspectorName', selectedInspectorDetails.name || '');
        setValue('inspectorInfo.inspectorLocation', selectedInspectorDetails.location || '');
        setValue('inspectorInfo.phoneNumber', selectedInspectorDetails.phone || '');
        setValue('inspectorInfo.email', selectedInspectorDetails.email || '');
        setValue('inspectorInfo.expertise', selectedInspectorDetails.expertise || '');
        setValue('inspectorInfo.fee', selectedInspectorDetails.fee || '');
      }
    }, [selectedInspectorDetails, setValue]);

  useEffect(() => {
    if (cities) {
      console.log('Cities data received for province', currentProvince, ':', cities);
    }
  }, [cities, currentProvince]);
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setValue('projectInfo.province', provinceId);
    setValue('projectInfo.city', '');
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    
    const selectedProject = projects?.find(project => project.id === projectId);
    if (selectedProject) {
      setValue('projectInfo.projectName', selectedProject.name);
    } else {
      setValue('projectInfo.projectName', '');
    }
  };

  const handleInspectorChange = (e) => {
    const inspectorId = e.target.value;
    setSelectedInspectorId(inspectorId);
    
    // فقط نام بازرس رو از لیست ست کن، بقیه فیلدها از API جزئیات پر می‌شوند
    const selectedInspector = inspectors?.find(insp => insp.id === inspectorId);
    if (selectedInspector) {
      setValue('inspectorInfo.inspectorName', selectedInspector.name);
      // بقیه فیلدها توسط useEffect بالا پر می‌شوند
    } else {
      // Reset inspector info
      setValue('inspectorInfo.inspectorName', '');
      setValue('inspectorInfo.inspectorLocation', '');
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
            
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 sm:gap-2 lg:gap-3 mb-2 lg:mb-2">
                <div className="flex flex-col">
                  <SelectField
                    label="نام پروژه *"
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                    options={projects || []}
                    placeholder={
                      projectsLoading ? "در حال دریافت لیست پروژه‌ها..." : 
                      projectsError ? "خطا در دریافت داده‌ها" : "انتخاب پروژه"
                    }
                    disabled={projectsLoading || !!projectsError}
                    error={errors.projectInfo?.projectName}
                    className="py-1.5 sm:py-1.5 lg:py-1.5"
                  />
                  <input type="hidden" {...register('projectInfo.projectName')} />
                </div>

                <div className="flex flex-col">
                  <SelectField
                    label=" داخلی/‌خارجی *"
                    {...register('projectInfo.projectType')}
                    error={errors.projectInfo?.projectType}
                    options={projectTypes || []} // تغییر: projectTypes از هوک استفاده میشه
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
                <SelectField
                  label="استان *"
                  {...register('projectInfo.province')}
                  error={errors.projectInfo?.province}
                  onChange={handleProvinceChange}
                  options={provinces || []}
                  placeholder={
                    provincesLoading ? "در حال دریافت لیست استان‌ها..." : 
                    provincesError ? "خطا در دریافت داده‌ها" : "انتخاب استان"
                  }
                  disabled={provincesLoading || !!provincesError}
                  className="py-1.5 sm:py-1.5 lg:py-1.5"
                  // style={{ direction: 'rtl', textAlign: 'right' }}
                />

                <SelectField
                  label="شهر *"
                  {...register('projectInfo.city')}
                  error={errors.projectInfo?.city}
                  disabled={!currentProvince || citiesLoading}
                  options={cities || []}
                  placeholder={
                    !currentProvince ? "ابتدا استان را انتخاب کنید" :
                    citiesLoading ? "در حال دریافت لیست شهرها..." :
                    citiesError ? "خطا در دریافت داده‌ها" : "انتخاب شهر"
                  }
                  className="py-1.5 sm:py-1.5 lg:py-1.5"
                />

                <SelectField
                  label="وندور *"
                  {...register('projectInfo.vendor')}
                  error={errors.projectInfo?.vendor}
                  options={vendors || []} // تغییر: vendors از هوک استفاده میشه
                  placeholder={
                    vendorsLoading ? "در حال دریافت لیست وندورها..." : 
                    vendorsError ? "خطا در دریافت داده‌ها" : "انتخاب وندور"
                  }
                  disabled={vendorsLoading || !!vendorsError}
                  className="py-1.5 sm:py-1.5 lg:py-1.5"
                />
              </div>
            </FormSection>

            {/* Inspector Information Section */}
            <FormSection
              title="اطلاعات بازرس"
              icon={FaUserTie}
              className="mb-2 lg:mb-3"
            >
              <div className="mb-2 lg:mb-2">
                <SelectField
                  label="نام بازرس *"
                  value={selectedInspectorId}
                  onChange={handleInspectorChange}
                  options={inspectors || []}
                  placeholder={
                    inspectorsLoading ? "در حال دریافت لیست بازرس‌ها..." : 
                    inspectorsError ? "خطا در دریافت داده‌ها" : "انتخاب بازرس"
                  }
                  disabled={inspectorsLoading || !!inspectorsError}
                  error={errors.inspectorInfo?.inspectorName}
                  className="py-1.5 sm:py-1.5 lg:py-1.5"
                />
                <input type="hidden" {...register('inspectorInfo.inspectorName')} />
              </div>

              {/* بقیه فیلدهای بازرس بدون تغییر */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-2">
                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="موقعیت (استان) *"
                    {...register('inspectorInfo.inspectorLocation')}
                    readOnly
                    className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="شماره تماس *"
                    {...register('inspectorInfo.phoneNumber')}
                    readOnly
                    className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="تخصص *"
                    {...register('inspectorInfo.expertise')}
                    readOnly
                    className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="ایمیل *"
                    {...register('inspectorInfo.email')}
                    error={errors.inspectorInfo?.email}
                    readOnly
                    className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <InputField
                    label="دستمزد *"
                    {...register('inspectorInfo.fee')}
                    readOnly
                    className="bg-blue-50 cursor-not-allowed font-semibold py-1.5 sm:py-1.5 lg:py-1.5 text-sm text-right"
                  />
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