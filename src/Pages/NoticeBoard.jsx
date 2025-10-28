import React, { useState } from "react";
import Notice from "../Notice";
import Navbar from "../NavigationBar";

function NoticeBoard() {
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: "Exam Schedule Released",
      description: "The final exam schedule has been published on LMS.",
    },
    {
      id: 2,
      title: "New Assignment Posted",
      description: "A new assignment has been added for Data Structures.",
    },
    {
      id: 3,
      title: "Library Closed on Friday",
      description: "The library will be closed this Friday for maintenance.",
    },
    {
      id: 4,
      title: "Guest Lecture Tomorrow",
      description: "A guest lecture on AI will be held at 10 AM in Hall A.",
    },
    {
      id: 5,
      title: "Group Project Deadline",
      description: "Submit your group project by November 2nd.",
    },
  ]);

  const [newNotice, setNewNotice] = useState("");
  const [newDescription, setNewDescription] = useState("");
   {/* add Notice Section */}
  const addNotice = (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !newDescription.trim()) return;

    const notice = {
      id: Date.now(),
      title: newNotice,
      description: newDescription,
    };

    setNotices([notice, ...notices]);
    setNewNotice("");
    setNewDescription("");
  };

  const removeNotice = (id) => {
    setNotices(notices.filter((notice) => notice.id !== id));
  };

  return (
    <>
    <Navbar/>
    
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-xl mt-8">
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
            onRemove={removeNotice}
          />
        ))}
      </div>
    </div>
    </>
  );
}

export default NoticeBoard;
