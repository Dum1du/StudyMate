import React, { useState, useEffect } from "react";
import { X, BookOpen, Star, Calendar } from "lucide-react";
import { doc, getDoc, collectionGroup, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase"; // Adjust path to your firebase config
import { MdVerified } from "react-icons/md";
import { createPortal } from "react-dom";

export default function PublicProfileModal({ isOpen, onClose, userId }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ uploads: 0, avgRating: 0 });

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // 1. Fetch User Document
        const userDocRef = doc(db, "users", userId);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData(data);

          // 2. Fetch User's Contributions (Uploads & Ratings)
          const materialsQuery = query(
            collectionGroup(db, "Materials"),
            where("uploaderUid", "==", userId)
          );
          
          const materialsSnap = await getDocs(materialsQuery);
          let totalRating = 0;
          let count = 0;

          materialsSnap.forEach((doc) => {
            const matData = doc.data();
            if (matData.avgRating && matData.ratingCount) {
              totalRating += (matData.avgRating * matData.ratingCount);
              count += matData.ratingCount;
            }
          });

          setStats({
            uploads: materialsSnap.size,
            avgRating: count > 0 ? (totalRating / count).toFixed(1) : 0,
          });
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Error fetching public profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex justify-center items-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 p-1.5 rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col items-center">
          
          {/* Avatar (Overlapping header) */}
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden -mt-12 bg-white relative z-10">
            {loading ? (
              <div className="w-full h-full bg-gray-200 animate-pulse"></div>
            ) : (
              <img
                src={
                  profileData?.profilePicture ||
                  `https://ui-avatars.com/api/?name=${profileData?.displayName || "User"}&background=EBF4FF&color=1E3A8A`
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {loading ? (
            <div className="w-full mt-4 flex flex-col items-center space-y-3 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-16 w-full bg-gray-100 rounded-xl mt-4"></div>
            </div>
          ) : !profileData ? (
            <div className="text-center mt-6 text-gray-500">
              User profile not found.
            </div>
          ) : (
            <>
              {/* FIXED: Role and Name in one line */}
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0 ${
                  profileData.role === "teacher" ? "bg-blue-100 text-blue-700" :
                  profileData.role === "admin" ? "bg-purple-100 text-purple-700" :
                  "bg-green-100 text-green-700"
                }`}>
                  {profileData.role || "Student"}
                </span>
                
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  {profileData.displayName || "Anonymous User"}
                  {profileData.role === "teacher" && (
                    <MdVerified className="text-blue-500 size-5" title="Verified Teacher" />
                  )}
                </h2>
              </div>

              {/* Bio / Details */}
              <div className="w-full mt-5 space-y-3">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex flex-col space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="font-medium text-gray-500">Faculty</span>
                      <span className="text-gray-800 text-right break-words max-w-[60%]">{profileData.faculty || "N/A"}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-medium text-gray-500">Program</span>
                      <span className="text-gray-800 text-right break-words max-w-[60%]">{profileData.program || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center border border-blue-100">
                    <BookOpen className="text-blue-500 mb-1" size={20} />
                    <span className="text-lg font-bold text-blue-700">{stats.uploads}</span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase">Uploads</span>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-2xl flex flex-col items-center justify-center text-center border border-orange-100">
                    <Star className="text-orange-500 mb-1" size={20} />
                    <span className="text-lg font-bold text-orange-700">{stats.avgRating}</span>
                    <span className="text-[10px] font-bold text-orange-500 uppercase">Avg Rating</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}