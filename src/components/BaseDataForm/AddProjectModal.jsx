import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaBuilding, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaTag,
  FaCodeBranch,
  FaBox,
  FaComment,
  FaCheckCircle,
  FaBan,
  FaKey
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { useCreateProject } from '../../hooks/useCreateProject';
import { useUpdateProject } from '../../hooks/useProjects';
import { showSuccessToast, showErrorToast, showLoadingToast } from '../../utils/toastConfig';

const AddProjectModal = ({ isOpen, onClose, onAddProject, initialData = null, isEdit = false }) => {
  const [formData, setFormData] = useState({
    Title: '',
    project_code: '',
    Abbreviation: '',
    SubProject: '',
    Material_Code: '',
    Remark: '',
    Status: true
  });
  
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: createProject, isLoading: isCreating } = useCreateProject();
  const { mutate: updateProject, isLoading: isUpdating } = useUpdateProject();

  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        let statusValue = true;
        if (initialData.Status === 'inactive' || initialData.Status === false) {
          statusValue = false;
        } else if (initialData.Status === 'active' || initialData.Status === true) {
          statusValue = true;
        }
        
        setFormData({
          Title: initialData.name || initialData.Title || '',
          project_code: initialData.project_code || '',
          Abbreviation: initialData.Abbreviation || '',
          SubProject: initialData.SubProject || '',
          Material_Code: initialData.Material_Code || '',
          Remark: initialData.Remark || '',
          Status: statusValue
        });
      } else {
        setFormData({
          Title: '',
          project_code: '',
          Abbreviation: '',
          SubProject: '',
          Material_Code: '',
          Remark: '',
          Status: true
        });
      }
      setLocalError('');
    }
  }, [isOpen, isEdit, initialData]);

  const validateForm = () => {
    if (!formData.Title.trim()) {
      return 'نام پروژه الزامی است';
    }
    
    if (formData.Title.trim().length < 2) {
      return 'نام پروژه باید حداقل ۲ حرف داشته باشد';
    }
    
    if (formData.project_code && formData.project_code.trim()) {
      const codeRegex = /^[A-Za-z0-9\-_]+$/;
      if (!codeRegex.test(formData.project_code.trim())) {
        return 'کد پروژه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره (-) و زیرخط (_) باشد';
      }
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'radio') {
      setFormData(prev => ({ ...prev, Status: value === 'active' }));
    } else if (name === 'project_code') {
      const cleanedValue = value.replace(/\s+/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (localError) setLocalError('');
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
    
    setLocalError('');
    setIsSubmitting(true);
    
    // **مهم: اینجا project_code حتماً باید باشد**
    const apiData = {
      Title: formData.Title.trim(),
      project_code: formData.project_code.trim() || null,  // این خط حیاتی است
      Abbreviation: formData.Abbreviation.trim() || null,
      SubProject: formData.SubProject.trim() || null,
      Material_Code: formData.Material_Code.trim() || null,
      Remark: formData.Remark.trim() || null,
      Status: formData.Status ? 'active' : 'inactive'
    };
    
    console.log('📤 Sending data to API:', apiData);
    
    if (isEdit && initialData?.id) {
      const loadingToast = showLoadingToast('در حال بروزرسانی پروژه...');
      
      updateProject(
        { id: initialData.id, data: apiData },
        {
          onSuccess: (updatedProject) => {
            toast.dismiss(loadingToast);
            showSuccessToast(`پروژه "${formData.Title}" با موفقیت بروزرسانی شد`);
            if (onAddProject) onAddProject(updatedProject);
            setTimeout(() => {
              setIsSubmitting(false);
              onClose();
            }, 500);
          },
          onError: (error) => {
            toast.dismiss(loadingToast);
            console.error('❌ Error updating project:', error);
            let errorMessage = 'خطا در بروزرسانی پروژه';
            if (error?.response?.data?.detail) errorMessage = error.response.data.detail;
            else if (error?.message) errorMessage = error.message;
            setLocalError(errorMessage);
            showErrorToast(errorMessage);
            setIsSubmitting(false);
          }
        }
      );
    } else {
      const loadingToast = showLoadingToast('در حال ایجاد پروژه جدید...');
      
      createProject(apiData, {
        onSuccess: (newProject) => {
          toast.dismiss(loadingToast);
          showSuccessToast(`پروژه "${formData.Title}" با موفقیت ایجاد شد`);
          if (onAddProject) onAddProject(newProject);
          setTimeout(() => {
            setFormData({
              Title: '',
              project_code: '',
              Abbreviation: '',
              SubProject: '',
              Material_Code: '',
              Remark: '',
              Status: true
            });
            setIsSubmitting(false);
            onClose();
          }, 500);
        },
        onError: (error) => {
          toast.dismiss(loadingToast);
          console.error('❌ Error creating project:', error);
          let errorMessage = 'خطا در ایجاد پروژه';
          if (error?.response?.data?.detail) {
            const detail = error.response.data.detail;
            if (typeof detail === 'string') {
              if (detail.includes('already exists')) {
                errorMessage = `نام پروژه "${formData.Title}" تکراری است. لطفاً نام دیگری انتخاب کنید.`;
              } else if (detail.includes('project_code')) {
                errorMessage = `کد پروژه "${formData.project_code}" تکراری است. لطفاً کد دیگری انتخاب کنید.`;
              } else {
                errorMessage = detail;
              }
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          setLocalError(errorMessage);
          showErrorToast(errorMessage);
          setIsSubmitting(false);
        }
      });
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isCreating && !isUpdating) {
      setFormData({
        Title: '',
        project_code: '',
        Abbreviation: '',
        SubProject: '',
        Material_Code: '',
        Remark: '',
        Status: true
      });
      setLocalError('');
      onClose();
    }
  };

  if (!isOpen) return null;
  const isLoading = isSubmitting || isCreating || isUpdating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">
              {isEdit ? 'ویرایش پروژه' : 'افزودن پروژه جدید'}
            </h3>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading} title="بستن">
            <FaTimes className="text-lg" />
          </button>
        </div>

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

          {/* نام پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaBuilding className="ml-1 text-blue-500" /> نام پروژه *
            </label>
            <input type="text" name="Title" value={formData.Title} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" required disabled={isLoading} autoFocus maxLength={100} />
          </div>

          {/* کد پروژه - اختیاری */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaKey className="ml-1 text-green-500" /> کد پروژه <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input type="text" name="project_code" value={formData.project_code} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" 
            // placeholder="فقط حروف انگلیسی، اعداد، - و _"
             disabled={isLoading} maxLength={50} dir="ltr" />
            <div className="mt-1 text-xs text-gray-400">فقط حروف انگلیسی، اعداد، خط تیره (-) و زیرخط (_) مجاز است</div>
          </div>

          {/* مخفف پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaTag className="ml-1 text-purple-500" /> مخفف پروژه <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input type="text" name="Abbreviation" value={formData.Abbreviation} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isLoading} maxLength={20} dir="ltr" />
          </div>

          {/* زیر پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCodeBranch className="ml-1 text-orange-500" /> زیر پروژه <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input type="text" name="SubProject" value={formData.SubProject} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isLoading} maxLength={50} />
          </div>

          {/* کد متریال */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaBox className="ml-1 text-yellow-500" /> کد متریال <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <input type="text" name="Material_Code" value={formData.Material_Code} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isLoading} maxLength={30} dir="ltr" />
          </div>

          {/* توضیحات */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaComment className="ml-1 text-gray-500" /> توضیحات <span className="text-xs text-gray-400 mr-1">(اختیاری)</span>
            </label>
            <textarea name="Remark" value={formData.Remark} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none" disabled={isLoading} rows={3} maxLength={500} />
          </div>

          {/* وضعیت پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FaCheckCircle className="ml-1 text-green-500" /> وضعیت پروژه
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="Status" value="active" checked={formData.Status === true} onChange={handleChange} className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500" disabled={isLoading} />
                <span className="flex items-center gap-1 text-sm text-gray-700">فعال</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="Status" value="inactive" checked={formData.Status === false} onChange={handleChange} className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500" disabled={isLoading} />
                <span className="flex items-center gap-1 text-sm text-gray-700">غیرفعال</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" icon={isLoading ? FaSpinner : undefined} className="flex-1" disabled={isLoading || !formData.Title.trim()} isLoading={isLoading} spinnerClassName="text-white">
              {isLoading ? 'در حال ثبت...' : (isEdit ? 'بروزرسانی پروژه' : 'ثبت پروژه')}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClose} className="flex-1" disabled={isLoading}>
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;