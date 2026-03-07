import React from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ placeholder, value, onChange, isFocused }) {
  return (
    <div className="flex justify-center px-4">
      <div className="flex items-center w-full max-w-md bg-white rounded-full shadow-lg shadow-blue-300 px-4 py-2">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder={placeholder || "Search"}
          className="flex-1 outline-none text-sm sm:text-base"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={isFocused}
        />
      </div>
    </div>
  );
}
