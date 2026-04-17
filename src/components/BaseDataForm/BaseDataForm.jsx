import React, { useState } from "react";
import { FaDatabase, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import StepHeader from "../common/StepHeader";
import FormSection from "../common/FormSection";
import Button from "../ui/Button";
import { useProjects, useDeleteProject } from "../../hooks/useProjects";
import { useInspectors, useDeleteInspector } from "../../hooks/useInspectors";
import { useVendors, useDeleteVendor } from "../../hooks/useVendors";
import { useProvinces, useDeleteProvince, useCities, useDeleteCity } from "../../hooks/useProvinces";
import AddProjectModal from "./AddProjectModal";
import AddInspectorModal from "./AddInspectorModal";
import AddVendorModal from "./AddVendorModal";
import AddProvinceModal from "./AddProvinceModal";
import AddCityModal from "./AddCityModal";
import DataTable from "../common/DataTable";
import ConfirmDeletePopover from "./ConfirmDeletePopover";

const BaseDataForm = () => {
  const [entityType, setEntityType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // ========== State برای پروژه ==========
  const [editingProject, setEditingProject] = useState(null);
  const [isEditModeProject, setIsEditModeProject] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteProjectPopoverOpen, setDeleteProjectPopoverOpen] = useState(false);
  
  // ========== State برای بازرس ==========
  const [editingInspector, setEditingInspector] = useState(null);
  const [isEditModeInspector, setIsEditModeInspector] = useState(false);
  const [inspectorToDelete, setInspectorToDelete] = useState(null);
  const [deleteInspectorPopoverOpen, setDeleteInspectorPopoverOpen] = useState(false);

  // ========== State برای وندور ==========
  const [editingVendor, setEditingVendor] = useState(null);
  const [isEditModeVendor, setIsEditModeVendor] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleteVendorPopoverOpen, setDeleteVendorPopoverOpen] = useState(false);

  // ========== State برای استان ==========
  const [editingProvince, setEditingProvince] = useState(null);
  const [isEditModeProvince, setIsEditModeProvince] = useState(false);
  const [provinceToDelete, setProvinceToDelete] = useState(null);
  const [deleteProvincePopoverOpen, setDeleteProvincePopoverOpen] = useState(false);

  // ========== State برای شهر ==========
  const [editingCity, setEditingCity] = useState(null);
  const [isEditModeCity, setIsEditModeCity] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [deleteCityPopoverOpen, setDeleteCityPopoverOpen] = useState(false);
  const [selectedProvinceForCity, setSelectedProvinceForCity] = useState("");

  // ========== هوک‌های داده ==========
  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const {
    data: inspectors,
    isLoading: inspectorsLoading,
    error: inspectorsError
  } = useInspectors();
  
  const {
    data: vendors,
    isLoading: vendorsLoading,
    error: vendorsError
  } = useVendors(false);

  const {
    data: provinces,
    isLoading: provincesLoading,
    error: provincesError
  } = useProvinces();

  const {
    data: cities,
    isLoading: citiesLoading,
    error: citiesError
  } = useCities(selectedProvinceForCity);

  // ========== هوک‌های عملیاتی ==========
  const { mutate: deleteProject, isLoading: isDeletingProject } = useDeleteProject();
  const { mutate: deleteInspector, isLoading: isDeletingInspector } = useDeleteInspector();
  const { mutate: deleteVendor, isLoading: isDeletingVendor } = useDeleteVendor();
  const { mutate: deleteProvince, isLoading: isDeletingProvince } = useDeleteProvince();
  const { mutate: deleteCity, isLoading: isDeletingCity } = useDeleteCity();

  // ========== توابع عمومی ==========
  const closeModal = () => {
    setEditingProject(null);
    setEditingInspector(null);
    setEditingVendor(null);
    setEditingProvince(null);
    setEditingCity(null);
    setIsEditModeProject(false);
    setIsEditModeInspector(false);
    setIsEditModeVendor(false);
    setIsEditModeProvince(false);
    setIsEditModeCity(false);
    setIsModalOpen(false);
  };

  // ========== توابع پروژه ==========
  const openModalForAddProject = () => {
    setEditingProject(null);
    setIsEditModeProject(false);
    setIsModalOpen(true);
  };

  const openModalForEditProject = (project) => {
    setEditingProject(project);
    setIsEditModeProject(true);
    setIsModalOpen(true);
  };

  const openDeleteProjectPopover = (project) => {
    setProjectToDelete(project);
    setDeleteProjectPopoverOpen(true);
  };

  const closeDeleteProjectPopover = () => {
    setProjectToDelete(null);
    setDeleteProjectPopoverOpen(false);
  };

  const handleDeleteProject = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id, {
        onSuccess: () => {
          closeDeleteProjectPopover();
        },
        onError: () => {
          closeDeleteProjectPopover();
        }
      });
    }
  };

  const handleProjectSuccess = () => {
    closeModal();
  };

  // ========== توابع بازرس ==========
  const openModalForAddInspector = () => {
    setEditingInspector(null);
    setIsEditModeInspector(false);
    setIsModalOpen(true);
  };

  const openModalForEditInspector = (inspector) => {
    setEditingInspector(inspector);
    setIsEditModeInspector(true);
    setIsModalOpen(true);
  };

  const openDeleteInspectorPopover = (inspector) => {
    setInspectorToDelete(inspector);
    setDeleteInspectorPopoverOpen(true);
  };

  const closeDeleteInspectorPopover = () => {
    setInspectorToDelete(null);
    setDeleteInspectorPopoverOpen(false);
  };

  const handleDeleteInspector = () => {
    if (inspectorToDelete) {
      deleteInspector(inspectorToDelete.id, {
        onSuccess: () => {
          closeDeleteInspectorPopover();
        },
        onError: () => {
          closeDeleteInspectorPopover();
        }
      });
    }
  };

  const handleInspectorSuccess = () => {
    closeModal();
  };

  // ========== توابع وندور ==========
  const openModalForAddVendor = () => {
    setEditingVendor(null);
    setIsEditModeVendor(false);
    setIsModalOpen(true);
  };

  const openModalForEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setIsEditModeVendor(true);
    setIsModalOpen(true);
  };

  const openDeleteVendorPopover = (vendor) => {
    setVendorToDelete(vendor);
    setDeleteVendorPopoverOpen(true);
  };

  const closeDeleteVendorPopover = () => {
    setVendorToDelete(null);
    setDeleteVendorPopoverOpen(false);
  };

  const handleDeleteVendor = () => {
    if (vendorToDelete) {
      deleteVendor(vendorToDelete.name, {
        onSuccess: () => {
          closeDeleteVendorPopover();
        },
        onError: () => {
          closeDeleteVendorPopover();
        }
      });
    }
  };

  const handleVendorSuccess = () => {
    closeModal();
  };

  // ========== توابع استان ==========
  const openModalForAddProvince = () => {
    setEditingProvince(null);
    setIsEditModeProvince(false);
    setIsModalOpen(true);
  };

  const openModalForEditProvince = (province) => {
    setEditingProvince(province);
    setIsEditModeProvince(true);
    setIsModalOpen(true);
  };

  const openDeleteProvincePopover = (province) => {
    setProvinceToDelete(province);
    setDeleteProvincePopoverOpen(true);
  };

  const closeDeleteProvincePopover = () => {
    setProvinceToDelete(null);
    setDeleteProvincePopoverOpen(false);
  };

  const handleDeleteProvince = () => {
    if (provinceToDelete) {
      deleteProvince(provinceToDelete.id, {
        onSuccess: () => {
          closeDeleteProvincePopover();
        },
        onError: () => {
          closeDeleteProvincePopover();
        }
      });
    }
  };

  const handleProvinceSuccess = () => {
    closeModal();
  };

  // ========== توابع شهر ==========
  const openModalForAddCity = () => {
    setEditingCity(null);
    setIsEditModeCity(false);
    setIsModalOpen(true);
  };

  const openModalForEditCity = (city) => {
    setEditingCity(city);
    setIsEditModeCity(true);
    setIsModalOpen(true);
  };

  const openDeleteCityPopover = (city) => {
    setCityToDelete(city);
    setDeleteCityPopoverOpen(true);
  };

  const closeDeleteCityPopover = () => {
    setCityToDelete(null);
    setDeleteCityPopoverOpen(false);
  };

  const handleDeleteCity = () => {
    if (cityToDelete) {
      deleteCity(cityToDelete.id, {
        onSuccess: () => {
          closeDeleteCityPopover();
        },
        onError: () => {
          closeDeleteCityPopover();
        }
      });
    }
  };

  const handleCitySuccess = () => {
    closeModal();
  };

  // ========== تعریف ستون‌های جدول‌ها ==========
  
  // ستون‌های پروژه
  const projectColumns = [
    { key: "name", title: "Title" },
    // { key: "project_code", title: "کد پروژه" },
    // { key: "Abbreviation", title: "مخفف" },
    // { key: "SubProject", title: "زیر پروژه" },
    // { key: "Material_Code", title: "کد متریال" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => openModalForEditProject(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="ویرایش پروژه"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteProjectPopover(row)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="حذف پروژه"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // ستون‌های بازرس
  const inspectorColumns = [
    { key: "name", title: "نام" },
    // { key: "PersonnelCode", title: "کد پرسنلی" },
    // { key: "Inspector_Discipline", title: "تخصص" },
    // { key: "Inspector_phone_no", title: "شماره تماس" },
    // { key: "Location_Coverd", title: "محدوده پوشش" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => openModalForEditInspector(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="ویرایش بازرس"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteInspectorPopover(row)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="حذف بازرس"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // ستون‌های وندور
  const vendorColumns = [
    { key: "name", title: "نام وندور" },
    { key: "contact_person", title: "شخص رابط" },
    { key: "phone", title: "شماره تماس" },
    { key: "email", title: "ایمیل" },
    { key: "address", title: "آدرس" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => openModalForEditVendor(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="ویرایش وندور"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteVendorPopover(row)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="حذف وندور"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // ستون‌های استان
  const provinceColumns = [
    { key: "name", title: "نام استان" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => openModalForEditProvince(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="ویرایش استان"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteProvincePopover(row)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="حذف استان"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // ستون‌های شهر
  const cityColumns = [
    { key: "name", title: "نام شهر" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: (row) => (
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => openModalForEditCity(row)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            title="ویرایش شهر"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => openDeleteCityPopover(row)}
            className="text-red-600 hover:text-red-800 transition-colors duration-200"
            title="حذف شهر"
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // عنوان دکمه‌های افزودن
  const addButtonText = {
    project: "افزودن پروژه جدید",
    inspector: "افزودن بازرس جدید",
    vendor: "افزودن وندور جدید"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <StepHeader
          icon={FaDatabase}
          title="ثبت اطلاعات پایه"
          description="مدیریت اطلاعات پایه سیستم"
        />

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* انتخاب نوع اطلاعات */}
          <FormSection title="نوع اطلاعات">
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">انتخاب کنید</option>
              <option value="project">پروژه</option>
              <option value="inspector">بازرس</option>
              <option value="vendor">وندور</option>
              <option value="province">استان</option>
              <option value="city">شهر</option>
            </select>
          </FormSection>

          {/* ========== جدول پروژه ========== */}
          {entityType === "project" && (
            <FormSection title="لیست پروژه ها">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Button icon={FaPlus} onClick={openModalForAddProject} variant="primary">
                  {addButtonText.project}
                </Button>
              </div>

              <DataTable
                columns={projectColumns}
                data={projects || []}
                loading={projectsLoading}
                error={projectsError}
              />
            </FormSection>
          )}

          {/* ========== جدول بازرس ========== */}
          {entityType === "inspector" && (
            <FormSection title="لیست بازرس ها">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Button icon={FaPlus} onClick={openModalForAddInspector} variant="primary">
                  {addButtonText.inspector}
                </Button>
              </div>

              <DataTable
                columns={inspectorColumns}
                data={inspectors || []}
                loading={inspectorsLoading}
                error={inspectorsError}
              />
            </FormSection>
          )}

          {/* ========== جدول وندور ========== */}
          {entityType === "vendor" && (
            <FormSection title="لیست وندورها">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Button icon={FaPlus} onClick={openModalForAddVendor} variant="primary">
                  افزودن وندور جدید
                </Button>
              </div>

              <DataTable
                columns={vendorColumns}
                data={vendors || []}
                loading={vendorsLoading}
                error={vendorsError}
              />
            </FormSection>
          )}

          {/* ========== جدول استان ========== */}
          {entityType === "province" && (
            <FormSection title="لیست استان‌ها">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <Button icon={FaPlus} onClick={openModalForAddProvince} variant="primary">
                  افزودن استان جدید
                </Button>
              </div>

              <DataTable
                columns={provinceColumns}
                data={provinces || []}
                loading={provincesLoading}
                error={provincesError}
              />
            </FormSection>
          )}

          {/* ========== جدول شهر ========== */}
          {entityType === "city" && (
            <FormSection title="مدیریت شهرها">
              <div className="flex justify-between items-center mb-4">
                <select
                  value={selectedProvinceForCity}
                  onChange={(e) => setSelectedProvinceForCity(e.target.value)}
                  className="border p-2 rounded w-full md:w-64"
                >
                  <option value="">انتخاب استان</option>
                  {provinces?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <Button icon={FaPlus} onClick={openModalForAddCity} variant="primary">
                  افزودن شهر جدید
                </Button>
              </div>

              <DataTable
                columns={cityColumns}
                data={cities || []}
                loading={citiesLoading}
                error={citiesError}
              />
            </FormSection>
          )}
        </div>
      </div>

      {/* ========== مودال‌ها ========== */}

      {/* مودال پروژه */}
      {entityType === "project" && (
        <AddProjectModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onAddProject={handleProjectSuccess}
          initialData={editingProject}
          isEdit={isEditModeProject}
        />
      )}

      {/* مودال بازرس */}
      {entityType === "inspector" && (
        <AddInspectorModal 
          isOpen={isModalOpen} 
          onClose={closeModal}
          onAddInspector={handleInspectorSuccess}
          initialData={editingInspector}
          isEdit={isEditModeInspector}
        />
      )}

      {/* مودال وندور */}
      {entityType === "vendor" && (
        <AddVendorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddVendor={handleVendorSuccess}
          initialData={editingVendor}
          isEdit={isEditModeVendor}
        />
      )}

      {/* مودال استان */}
      {entityType === "province" && (
        <AddProvinceModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddProvince={handleProvinceSuccess}
          initialData={editingProvince}
          isEdit={isEditModeProvince}
        />
      )}

      {/* مودال شهر */}
      {entityType === "city" && (
        <AddCityModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddCity={handleCitySuccess}
          initialData={editingCity}
          isEdit={isEditModeCity}
          provinces={provinces}
        />
      )}

      {/* ========== پاپ‌آپ‌های تأیید حذف ========== */}

      {/* پاپ‌آپ حذف پروژه */}
      <ConfirmDeletePopover
        isOpen={deleteProjectPopoverOpen}
        onClose={closeDeleteProjectPopover}
        onConfirm={handleDeleteProject}
        title="حذف پروژه"
        message={`آیا از حذف پروژه "${projectToDelete?.name}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        isLoading={isDeletingProject}
        type="danger"
      />

      {/* پاپ‌آپ حذف بازرس */}
      <ConfirmDeletePopover
        isOpen={deleteInspectorPopoverOpen}
        onClose={closeDeleteInspectorPopover}
        onConfirm={handleDeleteInspector}
        title="حذف بازرس"
        message={`آیا از حذف بازرس "${inspectorToDelete?.name}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        isLoading={isDeletingInspector}
        type="danger"
      />

      {/* پاپ‌آپ حذف وندور */}
      <ConfirmDeletePopover
        isOpen={deleteVendorPopoverOpen}
        onClose={closeDeleteVendorPopover}
        onConfirm={handleDeleteVendor}
        title="حذف وندور"
        message={`آیا از حذف وندور "${vendorToDelete?.name}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        isLoading={isDeletingVendor}
        type="danger"
      />

      {/* پاپ‌آپ حذف استان */}
      <ConfirmDeletePopover
        isOpen={deleteProvincePopoverOpen}
        onClose={closeDeleteProvincePopover}
        onConfirm={handleDeleteProvince}
        title="حذف استان"
        message={`آیا از حذف استان "${provinceToDelete?.name}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        isLoading={isDeletingProvince}
        type="danger"
      />

      {/* پاپ‌آپ حذف شهر */}
      <ConfirmDeletePopover
        isOpen={deleteCityPopoverOpen}
        onClose={closeDeleteCityPopover}
        onConfirm={handleDeleteCity}
        title="حذف شهر"
        message={`آیا از حذف شهر "${cityToDelete?.name}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        isLoading={isDeletingCity}
        type="danger"
      />
    </div>
  );
};

export default BaseDataForm;