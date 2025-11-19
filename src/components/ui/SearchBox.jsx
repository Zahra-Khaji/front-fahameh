// src/components/ui/SearchBox.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBox = ({ value, onChange, placeholder = "جستجو..." }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-sm"
        placeholder={placeholder}
        dir="rtl"
      />
    </div>
  );
};

export default SearchBox;