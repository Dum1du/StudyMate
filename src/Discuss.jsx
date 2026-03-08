import React from "react";
import { 
  FaRegCommentAlt, 
  FaRegThumbsUp, 
  FaShare, 
  FaGlobeAmericas, 
  FaEllipsisH 
} from "react-icons/fa";

const DiscussionItem = ({ 
  id,                   // Needed for navigation
  courseCode,
  resourceTitle,
  firstCommentText,
  creatorName,
  creatorImage,
  createdAt,
  onOpen,               // Function passed from parent to handle clicking
}) => {

  // Helper to format the Firebase Timestamp or Date object
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    // Handles both Firestore Timestamps and standard JS Dates
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 overflow-hidden max-w-[600px] mx-auto w-full"
    onClick={onOpen}>
      
      {/* 1. Header: Uploader Info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img 
            src={creatorImage || `https://ui-avatars.com/api/?name=${creatorName}`} 
            alt={creatorName} 
            className="w-10 h-10 rounded-full object-cover border border-gray-100"
          />
          <div>
            <h4 className="font-bold text-[15px] text-gray-900 leading-tight">
              {creatorName}
            </h4>
            <div className="flex items-center text-[12px] text-gray-500 gap-1.5">
              <span>•</span>
              <span>{formatDate(createdAt)}</span>
              <span>•</span>
              <FaGlobeAmericas size={10} />
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:bg-gray-50 p-2 rounded-full transition-colors">
          <FaEllipsisH />
        </button>
      </div>

      {/* 2. Content: The "Hook" */}
      {/* 2. Content: The "Hook" */}
      <div 
        className="px-4 pb-3 cursor-pointer group" 
        onClick={() => onOpen && onOpen(id)}
      >
        {/* Major Text: The User's First Comment/Question */}
        <p className="text-[17px] text-gray-900 leading-relaxed mb-3 font-medium">
          {firstCommentText}
        </p>
        
        {/* Referenced Item: The Resource Title styled as a context box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
          <div className="w-1 bg-blue-600 h-10 rounded-full" /> {/* Visual accent */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              Referencing Resource
            </span>
            <h3 className="text-[14px] font-bold text-gray-800 truncate">
              {resourceTitle}-<span className="font-semibold text-[12px] text-gray-500">{courseCode}</span>
            </h3>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DiscussionItem;