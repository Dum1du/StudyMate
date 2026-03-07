import React, { useEffect, useState } from "react";
import Navbar from "../NavigationBar";
import UpcomingKuppi from "../UpcomingKuppi";
import { FaPlus, FaSave, FaClipboardList, FaTimes } from "react-icons/fa";
import { auth, db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import Footer from "../Footer";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; 
import AlertModal from "../AlertModal"; // <-- Added AlertModal Import

function KuppiSessions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", date: "", time: "" });
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [showSurvey, setShowSurvey] = useState(false);

  // --- ADDED ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  // -------------------------

  // 1. LISTEN FOR USER AUTH CHANGES
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. AUTO-CLEANUP (Delete sessions older than 6 hours)
  useEffect(() => {
    const cleanupOldSessions = async () => {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      try {
        const q = query(collection(db, "sessions"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (document) => {
          const data = document.data();
          if (data.time) {
            const sessionTime = new Date(data.time);
            if (sessionTime < cutoffTime) {
              await deleteDoc(doc(db, "sessions", document.id));
            }
          }
        });
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    };
    cleanupOldSessions();
  }, []);

  // 3. REAL-TIME DATA
  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("time", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUpcomingSessions(sessionsList);
    });
    return () => unsubscribe();
  }, []);

  // DELETE FUNCTION (UPGRADED WITH CUSTOM CONFIRMATION MODAL)
  const handleDelete = (id) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Session",
      message: "Are you sure you want to delete this session? This cannot be undone.",
      type: "warning",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "sessions", id));
          closeAlert(); // Close the modal on success
        } catch (error) {
          console.error("Error deleting:", error);
          setAlertConfig({
            isOpen: true,
            title: "Error",
            message: "Failed to delete session.",
            type: "error",
            onConfirm: null
          });
        }
      }
    });
  };

  // PREPARE EDIT
  const handleEditClick = (session) => {
    if (!session.time) return;

    setIsEditing(true);
    setEditId(session.id);

    try {
      const [datePart, timePart] = session.time.split("T");
      setFormData({
        title: session.title,
        date: datePart,
        time: timePart ? timePart.slice(0, 5) : "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error("Error parsing date:", e);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ title: "", date: "", time: "" });
  };

  // FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, date, time } = formData;

    if (!title || !date || !time) {
      setAlertConfig({
        isOpen: true,
        title: "Missing Fields",
        message: "Please fill in all fields before scheduling the session!",
        type: "warning",
        onConfirm: null
      });
      return;
    }

    setLoading(true);

    try {
      const dateTimeString = `${date}T${time}:00`;

      if (isEditing) {
        // UPDATE
        const sessionRef = doc(db, "sessions", editId);
        await updateDoc(sessionRef, {
          title: title,
          time: dateTimeString,
        });
        
        setAlertConfig({
          isOpen: true,
          title: "Success",
          message: "Session updated successfully!",
          type: "success",
          onConfirm: null
        });
        
        setIsEditing(false);
        setEditId(null);
      } else {
        // CREATE
        const uniqueId = uuidv4().slice(0, 8);
        const sanitizedTitle = title.replace(/\s+/g, "-");
        const jitsiLink = `https://meet.jit.si/StudyMate-OUSL-${sanitizedTitle}-${uniqueId}`;

        await addDoc(collection(db, "sessions"), {
          title: title,
          host: user?.displayName || "Anonymous",
          time: dateTimeString,
          link: jitsiLink,
          createdAt: serverTimestamp(),
        });
        
        setAlertConfig({
          isOpen: true,
          title: "Session Created",
          message: "Your new Kuppi session has been scheduled successfully!",
          type: "success",
          onConfirm: null
        });
      }
      setFormData({ title: "", date: "", time: "" });
    } catch (error) {
      console.error("Error saving session: ", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Failed to save session. Please try again.",
        type: "error",
        onConfirm: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSurveySubmit = (e) => {
    e.preventDefault();
    setAlertConfig({
      isOpen: true,
      title: "Survey Submitted",
      message: "Feedback submitted successfully! Thank you.",
      type: "success",
      onConfirm: null
    });
    setQ1("");
    setQ2("");
  };

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto md:text-left min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
          Kuppi Sessions
        </h1>
        <p className="text-gray-500 mb-8">
          Join a session or schedule your own peer learning group.
        </p>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col-reverse md:flex-row gap-8 items-start justify-center">
          {/* LEFT SIDE: SESSIONS LIST */}
          <div className="flex-1 w-full md:min-w-[500px]">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Upcoming Sessions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {upcomingSessions.map((session) => (
                <UpcomingKuppi
                  key={session.id}
                  title={session.title}
                  host={session.host}
                  time={session.time ? session.time.replace("T", " ") : "N/A"}
                  link={session.link}
                  onDelete={() => handleDelete(session.id)}
                  onEdit={() => handleEditClick(session)}
                  isHost={
                    user &&
                    (session.host === user.displayName ||
                      session.host === "Anonymous")
                  }
                />
              ))}
              {upcomingSessions.length === 0 && (
                <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">No sessions scheduled yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="w-full md:w-1/3 md:sticky md:top-24 md:min-w-[320px]">
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border-t-4 ${
                isEditing ? "border-green-500" : "border-blue-500"
              }`}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? "Edit Session" : "Schedule Session"}
                </h2>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Topic
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Calculus II"
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`py-3 mt-2 rounded-lg font-bold text-white shadow-md transition transform active:scale-95 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : isEditing
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  "Processing..."
                ) : isEditing ? (
                  <>
                    {" "}
                    <FaSave /> Update Session{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <FaPlus /> Create Session{" "}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 mb-12 flex flex-col items-center justify-center w-full">
          {/* 1. BUTTON MODE (Visible when showSurvey is false) */}
          {!showSurvey && (
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100 shadow-sm text-center max-w-lg w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                We Value Your Feedback!
              </h2>
              <p className="text-gray-600 mb-6">
                Help us improve StudyMate by answering 2 quick questions.
              </p>

              <button
                onClick={() => setShowSurvey(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              >
                <FaClipboardList /> Take Survey
              </button>
            </div>
          )}

          {/* 2. FORM MODE (Visible when showSurvey is true) */}
          {showSurvey && (
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-3xl border border-gray-200 relative animate-fade-in">
              {/* Header with Close Button */}
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-700">
                  Quick Survey
                </h3>
                <button
                  onClick={() => setShowSurvey(false)}
                  className="text-gray-400 hover:text-red-500 transition p-2"
                  title="Close Survey"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* The Google Form */}
              <div className="flex justify-center bg-gray-50 rounded-lg overflow-hidden">
                <iframe
                  src="https://docs.google.com/forms/d/e/1FAIpQLSdTvyfhZa4XOfNNusd91xtnXwkDWLizyPpgy-Zmsse-xQshDg/viewform?embedded=true&hl=en"
                  width="100%"
                  height="760"
                  frameBorder="0"
                  marginHeight="0"
                  marginWidth="0"
                  title="StudyMate Survey"
                >
                  Loading…
                </iframe>
              </div>

              {/* "I'm Done" Button (Bottom) */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowSurvey(false)}
                  className="bg-gray-800 hover:bg-gray-900 text-white py-2 px-6 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  I'm Done / Close Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW ALERT MODAL INJECTION */}
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

export default KuppiSessions;