import React, { useState } from "react";
import Navbar from "../NavigationBar";
import { Pin, PinOff, Eye, Filter, Search, Trash2, Bookmark, BookOpen, X, FolderOpen } from "lucide-react";
import Footer from "../Footer";

const MyResourcesUI = () => {
  const [resources, setResources] = useState([
    // Example data — can be empty later
    {
      id: 1,
      title: "Introduction to Algorithms",
      description: "A detailed overview of algorithmic concepts and design patterns.",
      pinned: false,
    },
    {
      id: 2,
      title: "Database Management Notes",
      description: "ER diagrams, normalization forms, and SQL practice questions.",
      pinned: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const togglePin = (id) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, pinned: !r.pinned } : r))
    );
  };

  const removeResource = (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const openQuizModal = (resource) => setSelectedQuiz(resource);
  const closeQuizModal = () => setSelectedQuiz(null);

  const filteredResources = resources
    .filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((r) => (showPinnedOnly ? r.pinned : true));

  const pinnedResources = filteredResources.filter((r) => r.pinned);
  const otherResources = filteredResources.filter((r) => !r.pinned);

  const isEmpty = filteredResources.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 text-gray-900">
      <Navbar />

      <div className="p-6 sm:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">My Resources</h1>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 pl-9 pr-3 py-2 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-sm ${
                showPinnedOnly
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border border-gray-300 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <Filter size={16} />
              {showPinnedOnly ? "Show All" : "Pinned Only"}
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center text-center py-20 text-gray-500">
            <FolderOpen size={64} className="text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Resources Yet</h2>
            <p className="max-w-sm text-gray-500 text-sm mb-6">
              You haven’t saved any study materials yet. When you save or pin a resource, it will appear here for quick access.
            </p>
            <button
              onClick={() => setShowPinnedOnly(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-md"
            >
              Explore Resources
            </button>
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {!showPinnedOnly && pinnedResources.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark size={18} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-700">Pinned</h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedResources.map((res) => (
                    <div
                      key={res.id}
                      className="relative bg-white border border-gray-300 rounded-2xl shadow-md p-5 flex flex-col justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Top-right pin icon */}
                      <button
                        onClick={() => togglePin(res.id)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-yellow-600 transition"
                        title="Unpin"
                      >
                        <PinOff size={20} />
                      </button>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{res.title}</h3>
                        <p className="text-sm text-gray-600 mt-2">{res.description}</p>
                      </div>

                      {/* Bottom: Delete left, View right */}
                      <div className="flex justify-between items-center mt-5">
                        <button
                          onClick={() => removeResource(res.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={20} />
                        </button>
                        <button
                          onClick={() => openQuizModal(res)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                        >
                          <Eye size={16} /> View Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Saved (Other) Resources */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-700">
                  {showPinnedOnly ? "Pinned Resources" : "Saved Resources"}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {otherResources.map((res) => (
                  <div
                    key={res.id}
                    className="relative bg-white border border-gray-300 rounded-2xl shadow-md p-5 flex flex-col justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Top-right pin icon */}
                    <button
                      onClick={() => togglePin(res.id)}
                      className="absolute top-3 right-3 text-gray-500 hover:text-yellow-600 transition"
                      title="Pin"
                    >
                      <Pin size={20} />
                    </button>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{res.title}</h3>
                      <p className="text-sm text-gray-600 mt-2">{res.description}</p>
                    </div>

                    {/* Bottom: Delete left, View right */}
                    <div className="flex justify-between items-center mt-5">
                      <button
                        onClick={() => removeResource(res.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => openQuizModal(res)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <Eye size={16} /> View Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      {/* Quiz Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={closeQuizModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Quizzes for {selectedQuiz.title}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              Here you can display quiz questions or redirect to the quiz page.
            </p>
            <button
              onClick={closeQuizModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MyResourcesUI;
