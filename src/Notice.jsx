import React, { useState } from "react";
import { FaThumbtack, FaTimes } from "react-icons/fa";

function Notice({ id, title, description, onRemove, onTogglePin, pinned, createdAt }) {
  const [approved, setApproved] = useState(false);

  const handleRemove = () => {
    if (window.confirm("Are you sure you want to remove this notice?")) {
      onRemove(id);
    }
  };

  return (
    <div className="relative group w-full border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition flex justify-between items-start bg-white">
      
      {/* Pin button */}
      <div className={`flex-shrink-0 ${pinned ? 'order-first' : ''} group-hover:order-first`}>
        <button
          onClick={() => onTogglePin(id)}
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${
            pinned
              ? "bg-yellow-300 text-white border-yellow-500"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-yellow-100"
          }`}
          title={pinned ? "Unpin Notice" : "Pin Notice"}
        >
          <FaThumbtack />
        </button>
      </div>

      {/* Notice content */}
      <div className="flex-1 ml-2">
        <h3 className="text-lg font-semibold text-gray-800 break-words whitespace-pre-wrap w-55 sm:w-150">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mt-1 break-words whitespace-pre-wrap w-55 sm:w-150">
          {description}
        </p>
        <p className="text-xs text-gray-400 mt-1 break-words whitespace-pre-wrap">
          {createdAt}
        </p>
      </div>

      {/* Remove button */}
      <div className="flex flex-col gap-2 ml-4 flex-shrink-0">
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
