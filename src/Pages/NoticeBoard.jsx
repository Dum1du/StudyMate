import React, { useState } from "react";
import Notice from "../Notice";
import Navbar from "../NavigationBar";
import Footer from "../Footer";

function NoticeBoard() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Exam Schedule Released",
      description: "The final exam schedule has been published on LMS.",
      pinned: false,
      createdAt: new Date().toLocaleString(),
    },
    {
      id: 2,
      title: "New Assignment Posted",
      description: "A new assignment has been added for Data Structures.",
      pinned: false,
      createdAt: new Date().toLocaleString(),
    },
    {
      id: 3,
      title: "Library Closed on Friday",
      description: "The library will be closed this Friday for maintenance.",
      pinned: false,
      createdAt: new Date().toLocaleString(),
    },
    {
      id: 4,
      title: "Guest Lecture Tomorrow",
      description: "A guest lecture on AI will be held at 10 AM in Hall A.",
      pinned: false,
      createdAt: new Date().toLocaleString(),
    },
    {
      id: 5,
      title: "Group Project Deadline",
      description: "Submit your group project by November 2nd.",
      pinned: false,
      createdAt: new Date().toLocaleString(),
    },
  ]);

  const [newNotice, setNewNotice] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Add notice
  const addNotice = (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !newDescription.trim()) return;

    const notice = {
      id: Date.now(),
      title: newNotice,
      description: newDescription,
      pinned: false,
      createdAt: new Date().toLocaleString(),
    };

    setNotices([notice, ...notices]);
    setNewNotice("");
    setNewDescription("");
  };

  // Remove notice
  const removeNotice = (id) => {
    setNotices(notices.filter((notice) => notice.id !== id));
  };

  // Toggle pin
  const handleTogglePin = (id) => {
    setNotices((prevNotices) => {
      const updated = prevNotices.map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n,
      );
      return updated.sort((a, b) => b.pinned - a.pinned);
    });
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-200 py-8">
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold text-gray-800">Notice Board</h1>
          </div>

          {/* Form */}
          <form
            onSubmit={addNotice}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <input
              type="text"
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              placeholder="Notice Title..."
              className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Notice Description..."
              className="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition font-semibold ml-20"
            >
              Add Notice
            </button>
          </form>

          {/* Notices List */}
          <div className="flex flex-col gap-4">
            {notices.map((notice) => (
              <Notice
                key={notice.id}
                id={notice.id}
                title={notice.title}
                description={notice.description}
                pinned={notice.pinned}
                createdAt={notice.createdAt}
                onRemove={removeNotice}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default NoticeBoard;
