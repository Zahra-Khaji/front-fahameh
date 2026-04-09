import React, { useState } from "react";
import { useCreateProvince } from "../../hooks/useProvinces";

const AddProvinceModal = ({ isOpen, onClose }) => {
  const createProvince = useCreateProvince();

  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    createProvince.mutate(
      { name },
      {
        onSuccess: () => {
          setName("");
          onClose();
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white p-6 rounded-xl w-full max-w-md">

        <h2 className="text-lg font-bold mb-4">
          افزودن استان جدید
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="نام استان"
            className="w-full border p-2 rounded"
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

export default AddProvinceModal;
