import React, { useState } from "react";
import { FaDatabase, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import StepHeader from "../common/StepHeader";
import FormSection from "../common/FormSection";
import Button from "../ui/Button";
import { useProjects } from "../../hooks/useProjects";
import { useInspectors } from "../../hooks/useInspectors";
import AddProjectModal from "../ui/AddProjectModal";
import AddInspectorModal from "./AddInspectorModal";
import { useVendors } from "../../hooks/useVendors";
import AddVendorModal from "./AddVendorModal";
import DataTable from "../common/DataTable";
import { useProvinces,useCities } from "../../hooks/useProvinces";
import AddProvinceModal from "./AddProvinceModal";
// import { useProvinces, useCities } from "../../hooks/useProvinces";
import AddCityModal from "./AddCityModal";


const BaseDataForm = () => {
  const [entityType, setEntityType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");


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

  // const { data: provinces } = useProvinces();
  const {
    data: cities,
    isLoading: citiesLoading,
    error: citiesError
  } = useCities(selectedProvince);
  

  
  

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // ---------------- پروژه ----------------

  const projectColumns = [
    { key: "name", title: "Title" },
    // { key: "project_code", title: "Project Code" },
    // { key: "abbreviation", title: "Abbreviation" },
    // { key: "subProject", title: "SubProject" },
    // { key: "material_code", title: "Material Code" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>

          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  // ---------------- بازرس ----------------

  const inspectorColumns = [
    { key: "name", title: "نام" },
    // { key: "personnelCode", title: "کد پرسنلی" },
    // { key: "phone", title: "شماره موبایل" },
    // { key: "location", title: "موقعیت" },
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>

          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const vendorColumns = [
    { key: "name", title: "نام وندور" },
    // { key: "contact_person", title: "شخص رابط" },
    // { key: "phone", title: "شماره تماس" },
    // { key: "email", title: "ایمیل" },
  
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
  
          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const provinceColumns = [
    { key: "name", title: "نام استان" },
  
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
  
          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const cityColumns = [
    { key: "name", title: "نام شهر" },
  
    {
      key: "actions",
      title: "عملیات",
      align: "center",
      render: () => (
        <div className="flex justify-center gap-3">
          <button className="text-blue-600 hover:text-blue-800">
            <FaEdit />
          </button>
  
          <button className="text-red-600 hover:text-red-800">
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];
  
  
  

  // ---------------- عنوان دکمه داینامیک ----------------

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

          {/* جدول پروژه */}

          {entityType === "project" && (
            <FormSection title="لیست پروژه ها">

              <div className="flex justify-between items-center mb-4">
                <div></div>

                <Button icon={FaPlus} onClick={openModal} variant="primary">
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

          {/* جدول بازرس */}

          {entityType === "inspector" && (
            <FormSection title="لیست بازرس ها">

              <div className="flex justify-between items-center mb-4">
                <div></div>

                <Button icon={FaPlus} onClick={openModal} variant="primary">
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

{entityType === "vendor" && (
  <FormSection title="لیست وندورها">

    <div className="flex justify-between items-center mb-4">
      <div></div>

      <Button icon={FaPlus} onClick={openModal} variant="primary">
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

{entityType === "province" && (
  <FormSection title="لیست استان‌ها">

    <div className="flex justify-between items-center mb-4">
      <div></div>

      <Button icon={FaPlus} onClick={openModal} variant="primary">
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
{entityType === "city" && (
  <FormSection title="مدیریت شهرها">

    <div className="flex justify-between items-center mb-4">

      <select
        value={selectedProvince}
        onChange={(e) => setSelectedProvince(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="">انتخاب استان</option>

        {provinces?.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}

      </select>

      <Button icon={FaPlus} onClick={openModal} variant="primary">
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

      {/* Modals */}

      {entityType === "project" && (
        <AddProjectModal isOpen={isModalOpen} onClose={closeModal} />
      )}

      {entityType === "inspector" && (
        <AddInspectorModal isOpen={isModalOpen} onClose={closeModal} />
      )}

{entityType === "vendor" && (
  <AddVendorModal
    isOpen={isModalOpen}
    onClose={closeModal}
  />
)}
{entityType === "province" && (
  <AddProvinceModal
    isOpen={isModalOpen}
    onClose={closeModal}
  />

)}

{entityType === "city" && (
  <AddCityModal
    isOpen={isModalOpen}
    onClose={closeModal}
  />
)}




    </div>
  );
};

export default BaseDataForm;
