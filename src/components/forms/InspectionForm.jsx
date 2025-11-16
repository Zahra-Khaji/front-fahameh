// src/components/forms/InspectionForm.jsx
import React, { useState } from 'react';
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
import { provinces, citiesByProvince, vendors, inspectors, projects } from '../../data/staticData';
import { inspectionSchema } from '../../utils/validationSchemas';

const InspectionForm = ({ onComplete }) => {
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedInspectorId, setSelectedInspectorId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

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

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    setValue('projectInfo.province', provinceId);
    setValue('projectInfo.city', '');
  };

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
    
    const selectedProject = projects.find(project => project.id === projectId);
    if (selectedProject) {
      setValue('projectInfo.projectName', selectedProject.name);
    } else {
      setValue('projectInfo.projectName', '');
    }
  };

  const handleInspectorChange = (e) => {
    const inspectorId = e.target.value;
    setSelectedInspectorId(inspectorId);
    
    const selectedInspector = inspectors.find(insp => insp.id === inspectorId);
    if (selectedInspector) {
      setValue('inspectorInfo.inspectorName', selectedInspector.name);
      setValue('inspectorInfo.inspectorLocation', selectedInspector.location);
      setValue('inspectorInfo.phoneNumber', selectedInspector.phone);
      setValue('inspectorInfo.email', selectedInspector.email);
      setValue('inspectorInfo.expertise', selectedInspector.expertise);
      setValue('inspectorInfo.fee', selectedInspector.fee);
    } else {
      // Reset inspector info
      Object.keys(inspectors[0] || {}).forEach(key => {
        setValue(`inspectorInfo.${key}`, '');
      });
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

// src/components/forms/InspectionForm.jsx
// ... imports و stateها بدون تغییر

return (
  <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-1 px-3 sm:px-4 lg:px-4"> {/* کاهش py و px */}
    <div className="max-w-5xl mx-auto">
      
      <StepHeader
        title="سامانه درخواست بازرسی"
        description="فرم ثبت درخواست بازرسی فنی و کیفیت"
        icon={FaClipboardList}
      />

      <div className="bg-white rounded-xl shadow-lg">
        <form onSubmit={handleSubmit(onSubmit, onError)} className="p-3 sm:p-3 lg:p-4"> {/* کاهش پدینگ */}
          
          {/* Project Information Section */}
          <FormSection
            title="اطلاعات درخواست بازرسی"
            icon={FaClipboardList}
            className="mb-2 lg:mb-3" // کاهش بیشتر margin
          >
            <div className="mb-2 lg:mb-2"> {/* کاهش بیشتر */}
              <SelectField
                label="نام پروژه *"
                value={selectedProjectId}
                onChange={handleProjectChange}
                options={projects}
                placeholder="انتخاب پروژه"
                error={errors.projectInfo?.projectName}
                className="py-1.5 sm:py-1.5 lg:py-1.5" // کاهش بیشتر ارتفاع
              />
              <input type="hidden" {...register('projectInfo.projectName')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 lg:gap-2"> {/* کاهش بیشتر gap */}
              <SelectField
                label="استان *"
                {...register('projectInfo.province')}
                error={errors.projectInfo?.province}
                onChange={handleProvinceChange}
                options={provinces}
                placeholder="انتخاب استان"
                className="py-1.5 sm:py-1.5 lg:py-1.5"
              />

              <SelectField
                label="شهر *"
                {...register('projectInfo.city')}
                error={errors.projectInfo?.city}
                disabled={!currentProvince}
                options={currentProvince ? citiesByProvince[currentProvince] : []}
                placeholder={currentProvince ? "انتخاب شهر" : "ابتدا استان را انتخاب کنید"}
                className="py-1.5 sm:py-1.5 lg:py-1.5"
              />

              <SelectField
                label="وندور *"
                {...register('projectInfo.vendor')}
                error={errors.projectInfo?.vendor}
                options={vendors}
                placeholder="انتخاب وندور"
                className="py-1.5 sm:py-1.5 lg:py-1.5"
              />
            </div>
          </FormSection>

          {/* Inspector Information Section */}
          <FormSection
            title="اطلاعات بازرس"
            icon={FaUserTie}
            className="mb-2 lg:mb-3" // کاهش بیشتر margin
          >
            <div className="mb-2 lg:mb-2"> {/* کاهش بیشتر */}
              <SelectField
                label="نام بازرس *"
                value={selectedInspectorId}
                onChange={handleInspectorChange}
                options={inspectors}
                placeholder="انتخاب بازرس"
                className="py-1.5 sm:py-1.5 lg:py-1.5"
              />
              <input type="hidden" {...register('inspectorInfo.inspectorName')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-2"> {/* کاهش بیشتر gap */}
              <div className="sm:col-span-2 lg:col-span-1">
                <InputField
                  label="موقعیت (استان) *"
                  {...register('inspectorInfo.inspectorLocation')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <InputField
                  label="شماره تماس *"
                  {...register('inspectorInfo.phoneNumber')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <InputField
                  label="تخصص *"
                  {...register('inspectorInfo.expertise')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <InputField
                  label="ایمیل *"
                  {...register('inspectorInfo.email')}
                  error={errors.inspectorInfo?.email}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 sm:py-1.5 lg:py-1.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <InputField
                  label="دستمزد *"
                  {...register('inspectorInfo.fee')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed font-semibold py-1.5 sm:py-1.5 lg:py-1.5 text-sm"
                />
              </div>
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-center pt-2 lg:pt-0.5"> {/* کاهش بیشتر */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon="check"
              className="w-full sm:w-auto px-8"
            >
              ادامه به مرحله بعد
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