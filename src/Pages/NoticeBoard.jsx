import React, { useState, useEffect } from "react";
import Notice from "../Notice";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,       
  writeBatch     
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import { Plus, X, ClipboardList, CheckCircle, Trash2 } from "lucide-react"; 
import AlertModal from "../AlertModal"; 

function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [userRole, setUserRole] = useState("student"); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingNotice, setViewingNotice] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [pendingNotices, setPendingNotices] = useState([]);

  const [newNotice, setNewNotice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data().role || "student");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "notices"),
      where("status", "==", "approved"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAtString:
          doc.data().createdAt?.toDate().toLocaleString() || "Just now",
      }));

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

  useEffect(() => {
    if (userRole !== "teacher") return;

    const q = query(
      collection(db, "notices"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pendingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAtString: doc.data().createdAt?.toDate().toLocaleString() || "Just now",
      }));
      
      pendingData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setPendingNotices(pendingData);
    });

    return () => unsubscribe();
  }, [userRole]);

  const notifyAllUsers = async (noticeTitle, noticeId) => {
    try {
      const message = `New Notice: ${noticeTitle}`;
      const timestamp = serverTimestamp();

      let batch = writeBatch(db);
      let count = 0;

      const mainNotifRef = doc(collection(db, "notifications"));
      batch.set(mainNotifRef, {
        title: "Notice Published",
        message: message,
        createdAt: timestamp,
        type: "notice",
        targetId: noticeId
      });
      count++;

      const usersSnap = await getDocs(collection(db, "users"));

      usersSnap.forEach((userDoc) => {
        const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", userDoc.id);
        
        batch.set(userNotifRef, {
          userId: userDoc.id,
          message: message, 
          read: false,
          createdAt: timestamp,
          type: "notice",
          targetId: noticeId
        });

        count++;
        if (count >= 490) {
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error broadcasting notifications:", error);
    }
  };

  const addNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      const finalStatus = userRole === "teacher" ? "approved" : "pending";

      const docRef = await addDoc(collection(db, "notices"), {
        title: newNotice,
        description: newDescription,
        status: finalStatus,
        pinned: false,
        authorId: auth.currentUser?.uid || "Anonymous",
        authorName: auth.currentUser?.displayName || "Unknown User",
        createdAt: serverTimestamp(),
      });

      if (finalStatus === "approved") {
        notifyAllUsers(newNotice, docRef.id);
      }

      setAlertConfig({
        isOpen: true,
        title: finalStatus === "approved" ? "Notice Published!" : "Notice Submitted!",
        message: finalStatus === "approved" 
          ? "Your notice was instantly published to the board." 
          : "Your notice was submitted successfully! It will appear on the board once approved by a teacher or admin.",
        type: "success",
      });

      setNewNotice("");
      setNewDescription("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding notice:", error);
      setAlertConfig({
        isOpen: true,
        title: "Submission Failed",
        message: "Failed to submit the notice. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePending = async (noticeId, noticeTitle) => {
    try {
      await updateDoc(doc(db, "notices", noticeId), { status: "approved" });
      setAlertConfig({ isOpen: true, title: "Approved", message: "Notice has been published to the board.", type: "success" });
      notifyAllUsers(noticeTitle, noticeId);
    } catch (error) {
      console.error("Error approving notice:", error);
    }
  };

  // --- Delete the document AND notify the author! ---
  const handleRejectPending = (notice) => {
    setAlertConfig({
      isOpen: true,
      title: "Reject Notice",
      message: "Are you sure you want to reject this pending notice? It will be deleted and the student will be notified.",
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteDoc(doc(db, "notices", notice.id));

          if (notice.authorId && notice.authorId !== "Anonymous") {
            const timestamp = serverTimestamp();
            const batch = writeBatch(db);
            const mainNotifRef = doc(collection(db, "notifications"));

            batch.set(mainNotifRef, {
              title: "Notice Rejected",
              message: `Your notice "${notice.title}" was rejected by a teacher.`,
              createdAt: timestamp,
              type: "notice",
              targetId: null
            });

            const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", notice.authorId);
            
            batch.set(userNotifRef, {
              userId: notice.authorId,
              message: `Your notice "${notice.title}" was rejected by a teacher and has been removed.`,
              read: false,
              createdAt: timestamp,
              type: "notice",
              targetId: null
            });

            await batch.commit();
          }

        } catch (error) {
          console.error("Error rejecting notice:", error);
        }
      }
    });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8 mb-20 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Notice Board</h1>
          
          <div className="flex items-center gap-3">
            {userRole === "teacher" && (
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="relative flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                <ClipboardList size={20} />
                <span className="hidden sm:inline">Review Pending</span>
                {pendingNotices.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingNotices.length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus size={20} />
              Post Notice
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {notices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">
                No approved notices at the moment.
              </p>
            </div>
          ) : (
            notices.map((notice) => (
              <Notice
                key={notice.id}
                title={notice.title}
                description={notice.description}
                pinned={notice.pinned}
                createdAt={notice.createdAtString}
                onClick={() => setViewingNotice(notice)}
              />
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                Submit a New Notice
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-5">
              {userRole === "teacher" 
                ? "As a teacher, your notice will be published to the board immediately."
                : "Your notice will be reviewed by a teacher or administrator before it is published to the public board."}
            </p>

            <form onSubmit={addNotice} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">
                  Notice Title
                </label>
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
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide the full details of the notice here..."
                  rows={6}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-y"
                  required
                />
              </div>
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
                  className={`px-6 py-2 rounded-lg text-white font-semibold shadow-sm transition flex items-center gap-2 ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isSubmitting ? "Submitting..." : (userRole === "teacher" ? "Publish Notice" : "Submit for Approval")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ClipboardList className="text-yellow-600" /> Pending Student Notices
              </h2>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                type="button"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {pendingNotices.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle size={40} className="mx-auto text-green-300 mb-3" />
                  <p>You're all caught up! No pending notices.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingNotices.map((notice) => (
                    <div key={notice.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{notice.title}</h3>
                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleApprovePending(notice.id, notice.title)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 p-2 rounded-lg transition"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                        
                          <button 
                            onClick={() => handleRejectPending(notice)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition"
                            title="Reject/Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap bg-white p-3 rounded border border-gray-100">{notice.description}</p>
                      <div className="flex items-center text-xs text-gray-500 font-medium gap-2">
                        <span>Submitted by: <span className="text-gray-700">{notice.authorName}</span></span>
                        <span>•</span>
                        <span>{notice.createdAtString}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setViewingNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 pr-8 mb-4 break-words leading-tight">
              {viewingNotice.title}
            </h2>

            <div className="flex items-center gap-3 mb-5 border-b pb-4">
              {viewingNotice.pinned && (
                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
                  Pinned
                </span>
              )}
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
                {viewingNotice.createdAtString}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                By {viewingNotice.authorName}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl max-h-96 overflow-y-auto border border-gray-100 shadow-inner">
              <p className="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
                {viewingNotice.description}
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingNotice(null)}
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </>
  );
}

export default NoticeBoard;