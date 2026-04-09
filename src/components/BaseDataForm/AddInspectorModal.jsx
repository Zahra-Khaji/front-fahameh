import React, { useState } from "react";
import { useCreateInspector } from "../../hooks/useInspectors";

const AddInspectorModal = ({ isOpen, onClose }) => {
  const createInspector = useCreateInspector();

  const [formData, setFormData] = useState({
    Inspector_Name: "",
    PersonnelCode: "",
    Inspector_Discipline: "",
    Inspector_Email: "",
    Inspector_phone_no: "",
    Location_Coverd: "",
    status: "Active",
    Price: "",
    OVRDom: "Domestic",
    Price1403: ""
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createInspector.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-full max-w-lg">

        <h2 className="text-lg font-bold mb-4">
          افزودن بازرس جدید
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input name="Inspector_Name" placeholder="نام بازرس" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="PersonnelCode" placeholder="کد پرسنلی" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Inspector_phone_no" placeholder="شماره موبایل" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Inspector_Email" placeholder="ایمیل" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Location_Coverd" placeholder="محدوده پوشش" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Inspector_Discipline" placeholder="تخصص" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Price" placeholder="هزینه" onChange={handleChange} className="w-full border p-2 rounded"/>

          <input name="Price1403" placeholder="قیمت ۱۴۰۳" onChange={handleChange} className="w-full border p-2 rounded"/>

          <div className="flex justify-end gap-3 pt-3">

            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">
              انصراف
            </button>

            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              ثبت
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default AddInspectorModal;
