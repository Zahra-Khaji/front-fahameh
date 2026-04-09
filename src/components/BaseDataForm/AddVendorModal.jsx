import React, { useState } from "react";
import { useCreateVendor } from "../../hooks/useVendors";

const AddVendorModal = ({ isOpen, onClose }) => {
  const createVendor = useCreateVendor();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contact_person: "",
    phone: "",
    email: "",
    over_domestic: false
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createVendor.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-full max-w-lg">

        <h2 className="text-lg font-bold mb-4">
          افزودن وندور جدید
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            name="name"
            placeholder="نام وندور"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="contact_person"
            placeholder="شخص رابط"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="phone"
            placeholder="شماره تماس"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="email"
            placeholder="ایمیل"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            name="address"
            placeholder="آدرس"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <label className="flex items-center gap-2 text-sm">

            <input
              type="checkbox"
              name="over_domestic"
              checked={formData.over_domestic}
              onChange={handleChange}
            />

            وندور خارجی

          </label>

          <div className="flex justify-end gap-3 pt-3">

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

export default AddVendorModal;
