import { deleteDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FaRegCommentAlt,
  FaRegThumbsUp,
  FaShare,
  FaGlobeAmericas,
  FaEllipsisH,
  FaTrashAlt,
} from "react-icons/fa";
import { db } from "./firebase";
import AlertModal from "./AlertModal";

const DiscussionItem = ({
  id, // Needed for navigation
  courseCode,
  resourceTitle,
  firstCommentText,
  creatorName,
  creatorImage,
  createdAt,
  onOpen, // Function passed from parent to handle clicking
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onConfirm: null,
  });

  // Helper to format the Firebase Timestamp or Date object
  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    // Handles both Firestore Timestamps and standard JS Dates
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  //delete from discussions collection
  const performDelete = async () => {
    setModalConfig({ ...modalConfig, isOpen: false }); // Close modal
    try {
      await deleteDoc(doc(db, "discussions", id));
      // Show success message
      setModalConfig({
        isOpen: true,
        type: "success",
        title: "Success",
        message: "The discussion has been deleted.",
        onConfirm: null, // No confirm button for success info
      });
    } catch (error) {
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to delete the post. Please try again.",
        onConfirm: null,
      });
    }
  };

  const openDeleteConfirm = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setModalConfig({
      isOpen: true,
      type: "warning",
      title: "Delete Discussion?",
      message:
        "Are you sure you want to delete this? This action cannot be undone.",
      onConfirm: performDelete,
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 overflow-hidden max-w-[600px] mx-auto w-full">
      <AlertModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
      />

      {/* 1. Header: Uploader Info */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={
              creatorImage || `https://ui-avatars.com/api/?name=${creatorName}`
            }
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
        <div className="relative">
          <button
            className="text-gray-400 hover:bg-gray-50 p-2 rounded-full transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu)}}
          >
            <FaEllipsisH />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <button
                onClick={openDeleteConfirm}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <FaTrashAlt size={12} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

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
        <div
          className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all"
          onClick={onOpen}
        >
          <div className="w-1 bg-blue-600 h-10 rounded-full" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
              Referencing Resource
            </span>
            <h3 className="text-[14px] font-bold text-gray-800 truncate">
              {resourceTitle}-
              <span className="font-semibold text-[12px] text-gray-500">
                {courseCode}
              </span>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionItem;