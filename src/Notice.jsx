// src/components/Notice.jsx
import React, { useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

function Notice({ id, title, description, onRemove }) {
    {/* Alert */}
  const [approved, setApproved] = useState(false);

  const handleApprove = () => setApproved(!approved);

  const handleRemove = () => {
    if (window.confirm("Are you sure you want to remove this notice?")) {
      onRemove(id);
    }
  };

  return (
    <div className="w-250 h-40 border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition flex justify-between items-center bg-white">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      
      <div className="flex gap-3 ml-4">
        {/* Approve */}
        <button
          onClick={handleApprove}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
            approved
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-gray-700 border-gray-300"
          } hover:bg-green-100`}
        >
          <FaCheck />
        </button>

        {/* Remove  */}
        <button
          onClick={handleRemove}
          className="w-8 h-8 rounded-full border bg-gray-100 text-gray-700 border-gray-300 flex items-center justify-center hover:bg-red-100 transition"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}

export default Notice;
