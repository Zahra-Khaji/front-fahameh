import React, { useState } from "react";
import { useCreateCity, useProvinces } from "../../hooks/useProvinces";

const AddCityModal = ({ isOpen, onClose }) => {
  const { data: provinces } = useProvinces();
  const createCity = useCreateCity();

  const [formData, setFormData] = useState({
    name: "",
    province_id: ""
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

    createCity.mutate(formData, {
      onSuccess: () => {
        setFormData({ name: "", province_id: "" });
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h2 className="text-lg font-bold mb-4">
          افزودن شهر جدید
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <select
            name="province_id"
            value={formData.province_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">انتخاب استان</option>

            {provinces?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}

          </select>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="نام شهر"
            className="w-full border p-2 rounded"
            required
          />

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              ثبت
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddCityModal;
