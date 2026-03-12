import React from "react";
import { FaTrash, FaPen } from "react-icons/fa";

function UpcomingKuppi({ title, host, time, link, onDelete, onEdit, isHost }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col h-full relative hover:shadow-lg transition-shadow duration-200">
      {/* EDIT & DELETE BUTTONS */}
      {/* Only show these if the current user is the host! */}
      {isHost && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-500 transition p-1"
            title="Edit Session"
          >
            <FaPen size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition p-1"
            title="Delete Session"
          >
            <FaTrash size={14} />
          </button>
        </div>
      )}

      {/* CARD CONTENT */}
      <div className="mb-4 mt-2">
        <h3 className="font-bold text-xl text-gray-900 leading-tight mb-2">
          {title}
        </h3>

        <p className="text-gray-500 text-sm mb-1">
          Hosted by: <span className="font-medium text-gray-700">{host}</span>
        </p>

        <p className="text-gray-500 text-sm">
          Time: <span className="font-medium text-gray-700">{time}</span>
        </p>
        
      </div>

      {/* BIG BLUE JOIN BUTTON (Bottom) */}
      <div className="mt-auto pt-2">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition duration-200 shadow-sm"
          >
            Join Session
          </a>
        ) : (
          <button
            disabled
            className="block w-full bg-gray-200 text-gray-400 text-center py-2.5 rounded-lg font-semibold cursor-not-allowed"
          >
            No Link Available
          </button>
        )}
      </div>
    </div>
  );
}

export default UpcomingKuppi;
