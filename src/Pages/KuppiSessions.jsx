import React, { useState } from "react";
import Navbar from "../NavigationBar";
import UpcomingKuppi from "../upcomingkuppi";
import { FaPlus } from "react-icons/fa";
import { auth } from "../firebase";

function KuppiSessions() {
  const user = auth.currentUser;

  // Upcoming sessions
  const [upcomingSessions, setUpcomingSessions] = useState([
    { id: 1, title: "Data Structures", host: "Naveen", time: "2025-10-27 16:00" },
    { id: 2, title: "Database Systems", host: "Asitha", time: "2025-10-27 18:00" },
  ]);

  // Survey
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  // Add Session
  const addSession = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const date = e.target.date.value;
    const time = e.target.time.value;
    const username = user?.displayName || "TBD";

    if (!title || !date || !time) return;

    const newSession = {
      id: Date.now(),
      title,
      host: username,
      time: `${date} ${time}`,
    };

    setUpcomingSessions([...upcomingSessions, newSession]);
    e.target.reset();
  };

  // Survey Alert
  const handleSurveySubmit = (e) => {
    e.preventDefault();
    if (!q1 || !q2) {
      alert("Please answer both questions before submitting!");
      return;
    }
    alert(`Feedback submitted!\n\nRating: ${q1}\nUnderstanding: ${q2}`);
    setQ1("");
    setQ2("");
  };

  return (
    <>
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto md:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center md:text-left">
          Kuppi Sessions
        </h1>
        <h3 className="text-gray-400 mb-6 text-center md:text-left text-sm sm:text-base">
          Collaborate with peers in study sessions. Create or join sessions and access Google Meet links.
        </h3>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start justify-center">
          {/* Upcoming Sessions */}
          <div className="flex-1 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 text-center md:text-left">
              Upcoming Sessions
            </h2>
            <div className="flex flex-col gap-4 sm:gap-6">
              {upcomingSessions.map((session) => (
                <UpcomingKuppi
                  key={session.id}
                  title={session.title}
                  host={session.host}
                  time={session.time}
                  className="w-full sm:w-auto"
                />
              ))}
            </div>
          </div>

          {/* Create New Session Form */}
          <form
            onSubmit={addSession}
            className="bg-white rounded-xl shadow-md w-full sm:w-130 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4"
          >
            <label className="font-bold text-xl sm:text-2xl text-gray-700 mb-2 text-center md:text-left">
              Create a New Session
            </label>

            <label htmlFor="title" className="text-gray-700 font-semibold text-sm sm:text-base">
              Session Topic
            </label>
            <input
              type="text"
              name="title"
              placeholder="Session Topic"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base w-full"
              required
            />

            <label htmlFor="date" className="text-gray-700 font-semibold text-sm sm:text-base">
              Session Date & Time
            </label>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center w-full">
              <input
                type="date"
                name="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/2 text-sm sm:text-base"
                required
                onKeyDown={(e) => e.preventDefault()}
              />
              <input
                type="time"
                name="time"
                className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-1/2 text-sm sm:text-base"
                required
                onKeyDown={(e) => e.preventDefault()}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition flex items-center justify-center gap-2 font-bold text-sm sm:text-base w-full sm:w-auto"
            >
              <FaPlus className="text-white text-lg" />
              Create Session
            </button>
          </form>
        </div>

        {/* Feedback Survey Section */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 w-full sm:w-130 mx-auto mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-left">Survey</h2>

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
    </>
  );
}

export default KuppiSessions;
