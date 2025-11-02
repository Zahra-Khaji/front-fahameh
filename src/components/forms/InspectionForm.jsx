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
import { provinces, citiesByProvince, sellers, inspectors, projects } from '../../data/staticData'; // اضافه کردن projects
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
        seller: '',
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

  return (
    <div className="min-h-0 bg-gradient-to-br from-blue-50 to-indigo-100 py-2 px-4"> 
      <div className="max-w-5xl mx-auto">
        
        <StepHeader
          title="سامانه درخواست بازرسی"
          description="فرم ثبت درخواست بازرسی فنی و کیفیت"
          icon={FaClipboardList}
        />

        <div className="bg-white rounded-xl shadow-lg">
          <form onSubmit={handleSubmit(onSubmit, onError)} className="p-3"> 
            
            {/* Project Information Section */}
            <FormSection
              title="اطلاعات درخواست بازرسی"
              icon={FaClipboardList}
              className="mb-3"
            >
              <SelectField
                label="نام پروژه *"
                value={selectedProjectId}
                onChange={handleProjectChange}
                options={projects}
                placeholder="انتخاب پروژه"
                error={errors.projectInfo?.projectName}
                className="py-1.5" 
              />
              <input type="hidden" {...register('projectInfo.projectName')} />

              <div className="grid grid-cols-3 gap-2"> 
                <SelectField
                  label="استان *"
                  {...register('projectInfo.province')}
                  error={errors.projectInfo?.province}
                  onChange={handleProvinceChange}
                  options={provinces}
                  placeholder="انتخاب استان"
                  className="py-1.5" 
                />

                <SelectField
                  label="شهر *"
                  {...register('projectInfo.city')}
                  error={errors.projectInfo?.city}
                  disabled={!currentProvince}
                  options={currentProvince ? citiesByProvince[currentProvince] : []}
                  placeholder="انتخاب شهر"
                  className="py-1.5" 
                />

                <SelectField
                  label="وندور *"
                  {...register('projectInfo.seller')}
                  error={errors.projectInfo?.seller}
                  options={sellers}
                  placeholder="انتخاب وندور"
                  className="py-1.5" 
                />
              </div>
            </FormSection>

            {/* Inspector Information Section */}
            <FormSection
              title="اطلاعات بازرس"
              icon={FaUserTie}
              className="mb-3"
            >
              <SelectField
                label="نام بازرس *"
                value={selectedInspectorId}
                onChange={handleInspectorChange}
                options={inspectors}
                placeholder="انتخاب بازرس"
                className="py-1.5" 
              />
              <input type="hidden" {...register('inspectorInfo.inspectorName')} />

              <div className="grid grid-cols-5 gap-1.5">
                <InputField
                  label="موقعیت (استان) *"
                  {...register('inspectorInfo.inspectorLocation')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 text-xs"
                />

                <InputField
                  label="شماره تماس *"
                  {...register('inspectorInfo.phoneNumber')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 text-xs"
                />

                <InputField
                  label="تخصص *"
                  {...register('inspectorInfo.expertise')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 text-xs"
                />

                <InputField
                  label="ایمیل *"
                  {...register('inspectorInfo.email')}
                  error={errors.inspectorInfo?.email}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed py-1.5 text-xs"
                />

                <InputField
                  label="دستمزد *"
                  {...register('inspectorInfo.fee')}
                  readOnly
                  className="bg-blue-50 cursor-not-allowed font-semibold py-1.5 text-xs"
                />
              </div>
            </FormSection>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon="check"
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