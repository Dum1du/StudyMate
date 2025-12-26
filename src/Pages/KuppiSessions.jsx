import React, { useEffect, useState } from "react";
import Navbar from "../NavigationBar";
import UpcomingKuppi from "../upcomingkuppi";
import { FaPlus, FaSave } from "react-icons/fa";
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
import { onAuthStateChanged } from "firebase/auth"; // Import this for user tracking

function KuppiSessions() {
  // FIXED: Track user state so buttons appear correctly on refresh
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", date: "", time: "" });
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

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

  // DELETE FUNCTION
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await deleteDoc(doc(db, "sessions", id));
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete session.");
      }
    }
  };

  // PREPARE EDIT
  const handleEditClick = (session) => {
    // Safety check in case time is missing
    if (!session.time) return;

    setIsEditing(true);
    setEditId(session.id);

    // FIXED: Added try/catch for split logic safety
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
      alert("Please fill in all fields!");
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
        alert("Session updated successfully!");
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
        alert("Session created successfully!");
      }
      setFormData({ title: "", date: "", time: "" });
    } catch (error) {
      console.error("Error saving session: ", error);
      alert("Failed to save session.");
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
    alert(`Feedback submitted!`);
    setQ1("");
    setQ2("");
  };

  return (
    <>
      <Navbar />
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
          <div className="flex-1 w-full">
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
          <div className="w-full md:w-1/3 md:sticky md:top-24">
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

        {/* FEEDBACK SECTION (Now outside the Flex row to appear at bottom) */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-center">Quick Survey</h2>
          <div className="flex flex-col gap-6">
            {/* Q1 */}
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-center">
                Are you interested in hosting or joining study sessions?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Hosting", "Joining", "Both", "Neither"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setQ1(option)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      q1 === option
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-center">
                Do you find the auto-generated Jitsi Meet links convenient?
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Yes", "No", "Neutral"].map((option) => (
                  <button
                    key={option}
                    onClick={() => setQ2(option)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      q2 === option
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSurveySubmit}
              className="bg-gray-800 text-white py-2 px-6 rounded-lg font-bold hover:bg-gray-900 transition mx-auto w-full sm:w-auto"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default KuppiSessions;
