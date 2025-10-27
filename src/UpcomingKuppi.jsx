import React from "react";
import { FaVideo } from "react-icons/fa";

function UpcomingKuppi({ title, host, time, imageUrl }) {
  return (
    <div className="flex-1 max-w-140 h-50 bg-white rounded-xl shadow-md p-4 flex flex-col
                     border border-transparent hover:border-blue-400 mt-4 group relative">
      
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          
          <h3 className="text-lg font-bold text-blue-700">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{host}</p>
          <p className="text-sm text-gray-500">{time}</p>
        </div>

        
        <div className="h-40 w-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 ml-4 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover rounded-md"
            />
          ) : (
            "Kuppi"
          )}
        </div>
      </div>

      
      <button className="absolute bottom-4 h-10 left-4 mt-4 w-60 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 font-bold">
        <FaVideo className="text-white text-lg" />
        Join Session
      </button>
    </div>
  );
}

export default UpcomingKuppi;
