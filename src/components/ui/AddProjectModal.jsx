// src/components/ui/AddProjectModal.jsx
import React, { useState } from 'react';
import { FaPlus, FaTimes, FaBuilding } from 'react-icons/fa';
import Button from './Button';

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    subProject: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAddProject(formData);
      setFormData({ name: '', abbreviation: '', subProject: '' });
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaBuilding className="text-blue-500 text-lg" />
            <h3 className="text-lg font-bold text-gray-800">افزودن پروژه جدید</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* نام پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              نام پروژه *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="نام کامل پروژه را وارد کنید"
              required
            />
          </div>

          {/* مخفف */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              مخفف
            </label>
            <input
              type="text"
              name="abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="مخفف پروژه (اختیاری)"
            />
          </div>

          {/* ساب پروژه */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ساب پروژه
            </label>
            <input
              type="text"
              name="subProject"
              value={formData.subProject}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ساب پروژه (اختیاری)"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              icon="check"
              className="flex-1"
              disabled={!formData.name.trim()}
            >
              ثبت پروژه
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;