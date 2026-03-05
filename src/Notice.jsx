import React from "react";
import { FaThumbtack } from "react-icons/fa";

function Notice({ title, description, pinned, createdAt }) {
  return (
    <div 
      className={`relative w-full border rounded-lg p-5 shadow-sm transition-shadow hover:shadow-md bg-white ${
        pinned ? "border-yellow-400 bg-yellow-50/30" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-4">
        
        {/* Visual Pin Indicator (Non-clickable) */}
        {pinned && (
          <div className="mt-1 flex-shrink-0 text-yellow-500" title="Pinned Notice">
            <FaThumbtack size={18} />
          </div>
        )}

        {/* Notice content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 break-words whitespace-pre-wrap">
            {title}
          </h3>
          <p className="text-sm text-gray-700 mt-2 break-words whitespace-pre-wrap leading-relaxed">
            {description}
          </p>
          <div className="flex items-center mt-4">
            <p className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              {createdAt}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Notice;