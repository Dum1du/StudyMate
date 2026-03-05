import React, { useState, useEffect } from "react";
import Notice from "../Notice";
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase"; // Adjust path if needed
import { Plus, X } from "lucide-react"; // Added icons for the button and modal

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch only APPROVED notices in real-time
  useEffect(() => {
    const q = query(collection(db, "notices"), where("status", "==", "approved"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Sort locally: Pinned notices go first, then sorted by newest
      noticesData.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setNotices(noticesData);
    });

    return () => unsubscribe();
  }, []);

  // Submit notice as PENDING
  const addNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "notices"), {
        title: newNotice,
        description: newDescription,
        status: "pending", // Still goes to admin for approval
        pinned: false,
        authorId: auth.currentUser?.uid || "Anonymous",
        authorName: auth.currentUser?.displayName || "Unknown User",
        createdAt: serverTimestamp(),
      });
      
      alert("Notice submitted successfully! It will appear once approved by an admin.");
      
      // Reset form and close modal
      setNewNotice("");
      setNewDescription("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding notice:", error);
      alert("Failed to submit notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8 mb-20 relative">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Notice Board</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Post Notice
          </button>
        </div>

        {/* Notices List */}
        <div className="flex flex-col gap-4">
          {notices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No approved notices at the moment.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <Notice
                key={notice.id}
                id={notice.id}
                title={notice.title}
                description={notice.description}
                pinned={notice.pinned}
                createdAt={notice.createdAt?.toDate().toLocaleString() || "Just now"}
                // Removed onRemove and onTogglePin entirely
              />
            ))
          )}
        </div>
      </div>

      {/* --- ADD NOTICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Submit a New Notice</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-5">
              Your notice will be reviewed by an administrator before it is published to the public board.
            </p>

            {/* Modal Form */}
            <form onSubmit={addNotice} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Notice Title</label>
                <input
                  type="text"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  placeholder="e.g., Upcoming Guest Lecture..."
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                {/* BIG TEXT EDITOR (Textarea) */}
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide the full details of the notice here..."
                  rows={6}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-lg text-white font-semibold shadow-sm transition flex items-center gap-2 ${
                    isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default NoticeBoard;