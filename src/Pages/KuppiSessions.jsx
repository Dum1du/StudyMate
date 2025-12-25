import React, { useEffect, useState } from "react";
import Navbar from "../NavigationBar";
import UpcomingKuppi from "../upcomingkuppi";
import { FaPlus } from "react-icons/fa";
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
} from "firebase/firestore";

function KuppiSessions() {
  const user = auth.currentUser;
  const [sessions, setSessions] = useState(false);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // take the list of sessions from the database
  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("time", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date(); // Get current time

      const sessions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((session) => {
          // CONVERT STORED STRING TO DATE OBJECT
          const sessionTime = new Date(session.time);

          // ADD A BUFFER (OPTIONAL):
          // If you want the link to stay visible for 1 hour AFTER the start time
          // (so latecomers can still join), add 60 minutes to the session time.
          const expirationTime = new Date(
            sessionTime.getTime() + 60 * 60 * 1000
          );

          // KEEP ONLY IF: Expiration time is in the future
          return expirationTime > now;
        });

      setUpcomingSessions(sessions);
    });

    return () => unsubscribe();
  }, []);

  // Survey
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  // Add Session
  // 1. Added 'async'
  const addSession = async (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const date = e.target.date.value;
    const time = e.target.time.value;

    if (!title || !date || !time) {
      alert("Please fill in all fields to create a Kuppi session!");
      return;
    }

    // 2. Make sure you defined 'const [loading, setLoading] = useState(false);' above
    setLoading(true);

    try {
      const uniqueId = uuidv4().slice(0, 8);
      const sanitizedTitle = title.replace(/\s+/g, "-");
      const jitsiLink = `https://meet.jit.si/StudyMate-OUSL-${sanitizedTitle}-${uniqueId}`;

      await addDoc(collection(db, "sessions"), {
        title: title,
        host: user.displayName || "Anonymous",
        time: `${date}T${time}:00`,
        link: jitsiLink,
        createdAt: serverTimestamp(),
      });

      alert("Kuppi session created successfully!");
      e.target.reset();
    } catch (error) {
      console.error("Error adding Kuppi session: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Survey Alert
  const handleSurveySubmit = (e) => {
    e.preventDefault();
    alert(`Feedback submitted!`);
    setQ1("");
    setQ2("");
  };

  return (
    <>
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto md:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Kuppi Sessions</h1>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start justify-center">
          {/* LEFT SIDE: LIST OF SESSIONS */}
          <div className="flex-1 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Upcoming Sessions
            </h2>
            <div className="flex flex-col gap-4">
              {upcomingSessions.map((session) => (
                <UpcomingKuppi
                  key={session.id}
                  title={session.title}
                  host={session.host}
                  // We clean up the time (remove the 'T')
                  time={session.time.replace("T", " ")}
                  // CRITICAL: We pass the link to the card component
                  link={session.link}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <form
            onSubmit={addSession}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 w-full sm:w-1/3"
          >
            <h2 className="text-xl font-bold">Create Session</h2>
            <input
              type="text"
              name="title"
              placeholder="Topic"
              className="border p-2 rounded"
              required
            />
            <input
              type="date"
              name="date"
              className="border p-2 rounded"
              required
            />
            <input
              type="time"
              name="time"
              className="border p-2 rounded"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white py-2 rounded font-bold hover:bg-blue-600"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </form>
        </div>

        {/* Feedback Survey Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full sm:w-130 mx-auto mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left">
            Survey
          </h2>

          {/* Q1 */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">
              Are you interested in hosting or joining study sessions?
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              {["Hosting", "Joining", "Both", "Neither"].map((option) => (
                <button
                  key={option}
                  onClick={() => setQ1(option)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base w-full sm:w-auto ${
                    q1 === option
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  } hover:bg-blue-100 transition`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 */}
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 text-gray-800">
              Do you find the auto-generated Google Meet links convenient?
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
              {["Yes", "No", "Neutral"].map((option) => (
                <button
                  key={option}
                  onClick={() => setQ2(option)}
                  className={`px-3 py-1 sm:px-4 sm:py-2 rounded-md border text-sm sm:text-base w-full sm:w-auto ${
                    q2 === option
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-gray-100 text-gray-700 border-gray-300"
                  } hover:bg-green-100 transition`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Feedback */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleSurveySubmit}
              className="flex items-center justify-center gap-2 bg-gray-300 text-black font-semibold py-2 px-4 sm:px-6 rounded-xl hover:bg-gray-500 transition w-full sm:w-[280px]"
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
