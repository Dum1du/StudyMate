import React, { useState, useEffect } from "react";
import Navbar from "../NavigationBar";
import {
  Pin,
  PinOff,
  Eye,
  Filter,
  Search,
  Trash2,
  Bookmark,
  BookOpen,
  Download,
  FileText,
  Table,
  Presentation,
  Image,
  Video,
  Archive,
  Code,
  File,
  X,
  FolderOpen,
} from "lucide-react";
import Footer from "../Footer";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

const MyResourcesUI = () => {
  const [resources, setResources] = useState([]);
  const [user, setUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // subscribe to auth and saved resources for current user
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const col = collection(db, "users", u.uid, "savedResources");
        const unsubSnap = onSnapshot(col, (snap) => {
          const saved = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setResources(saved);
        });
        // clean up snapshot when user changes or signs out
        return () => unsubSnap();
      } else {
        setResources([]);
      }
    });
    return () => unsubAuth();
  }, []);

  const togglePin = async (id) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newPinned = !r.pinned;
          if (user) {
            const docRef = doc(db, "users", user.uid, "savedResources", id);
            updateDoc(docRef, { pinned: newPinned });
          }
          return { ...r, pinned: newPinned };
        }
        return r;
      }),
    );
  };

  const removeResource = async (id) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
    if (user) {
      const docRef = doc(db, "users", user.uid, "savedResources", id);
      await deleteDoc(docRef);
    }
  };

  const openQuizModal = (resource) => setSelectedQuiz(resource);
  const closeQuizModal = () => setSelectedQuiz(null);

  const viewResource = (res) => {
    if (res.fileLink) {
      window.open(res.fileLink, "_blank");
    } else {
      alert("No URL available for this resource.");
    }
  };

  const downloadResource = (res) => {
    if (res.fileId) {
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${res.fileId}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        (res.resourceTitle || res.title || "resource") +
        (res.materialType || ".pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("No download link available for this resource.");
    }
  };

  // Helper function to get file type icon based on material type
  const getFileTypeIcon = (materialType) => {
    if (!materialType) return <File size={28} className="text-gray-500" />;

    const type = materialType.toLowerCase();

    if (type.includes("pdf")) {
      return <FileText size={28} className="text-red-500" />;
    } else if (
      type.includes("word") ||
      type.includes("doc") ||
      type.includes("docx")
    ) {
      return <FileText size={28} className="text-blue-500" />;
    } else if (
      type.includes("excel") ||
      type.includes("xls") ||
      type.includes("xlsx") ||
      type.includes("sheet")
    ) {
      return <Table size={28} className="text-green-500" />;
    } else if (
      type.includes("powerpoint") ||
      type.includes("ppt") ||
      type.includes("pptx")
    ) {
      return <Presentation size={28} className="text-orange-500" />;
    } else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png") ||
      type.includes("gif")
    ) {
      return <Image size={28} className="text-purple-500" />;
    } else if (
      type.includes("video") ||
      type.includes("mp4") ||
      type.includes("avi") ||
      type.includes("mov")
    ) {
      return <Video size={28} className="text-pink-500" />;
    } else if (
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("archive")
    ) {
      return <Archive size={28} className="text-yellow-600" />;
    } else if (
      type.includes("code") ||
      type.includes("js") ||
      type.includes("python") ||
      type.includes("java")
    ) {
      return <Code size={28} className="text-slate-700" />;
    } else if (type.includes("lecture") || type.includes("notes")) {
      return <FileText size={28} className="text-indigo-500" />;
    }

    return <File size={28} className="text-gray-500" />;
  };

  // use resourceTitle or title for compatibility with older saved docs
  const filteredResources = resources
    .filter((r) =>
      (r.resourceTitle || r.title || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
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
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
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
            {user ? (
              <>
                <FolderOpen size={64} className="text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Resources Yet</h2>
                <p className="max-w-sm text-gray-500 text-sm mb-6">
                  You haven’t saved any study materials yet. When you save or
                  pin a resource, it will appear here for quick access.
                </p>
                <button
                  onClick={() => setShowPinnedOnly(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-md"
                >
                  Explore Resources
                </button>
              </>
            ) : (
              <>
                <p className="text-lg">
                  Please{" "}
                  <a href="/logins" className="text-blue-600 hover:underline">
                    log in
                  </a>{" "}
                  to view your saved resources.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Pinned Section */}
            {!showPinnedOnly && pinnedResources.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark size={18} className="text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-700">
                    Pinned
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {pinnedResources.map((res) => (
                    <div
                      key={res.id}
                      className="relative bg-white border border-gray-300 rounded-2xl shadow-md p-3 flex flex-col justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Top: Pin icon */}
                      <button
                        onClick={() => togglePin(res.id)}
                        className="absolute top-4 right-3 text-gray-500 hover:text-yellow-600 transition"
                        title="Unpin"
                      >
                        <PinOff size={20} />
                      </button>

                      {/* File type icon - centered at top */}
                      <div
                        className="flex justify-start mb-2"
                        title={res.materialType}
                      >
                        <div className="text-5xl">
                          {getFileTypeIcon(res.materialType)}
                        </div>
                      </div>

                      {/* Title and description */}
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                          {res.resourceTitle || "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {res.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeResource(res.id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() => viewResource(res)}
                            className="text-gray-600 hover:text-blue-600 transition"
                            title="View Resource"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => downloadResource(res)}
                            className="text-gray-600 hover:text-green-600 transition"
                            title="Download Resource"
                          >
                            <Download size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() => openQuizModal(res)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-xs whitespace-nowrap"
                        >
                          <Eye size={14} /> Quiz
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {otherResources.map((res) => (
                  <div
                    key={res.id}
                    className="relative bg-white border border-gray-300 rounded-2xl shadow-md p-3 flex flex-col justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Top: Pin icon */}
                    <button
                      onClick={() => togglePin(res.id)}
                      className="absolute top-4 right-3 text-gray-500 hover:text-yellow-600 transition"
                      title="Pin"
                    >
                      <Pin size={20} />
                    </button>

                    {/* File type icon - centered at top */}
                    <div
                      className="flex justify-left mb-2"
                      title={res.materialType}
                    >
                      <div className="text-5xl">
                        {getFileTypeIcon(res.materialType)}
                      </div>
                    </div>

                    {/* Title and description */}
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                        {res.resourceTitle || res.title || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {res.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeResource(res.id)}
                          className="text-red-500 hover:text-red-700 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => viewResource(res)}
                          className="text-gray-600 hover:text-blue-600 transition"
                          title="View Resource"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => downloadResource(res)}
                          className="text-gray-600 hover:text-green-600 transition"
                          title="Download Resource"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                      <button
                        onClick={() => openQuizModal(res)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-xs whitespace-nowrap"
                      >
                        <Eye size={14} /> Quiz
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
              Quizzes for {selectedQuiz.resourceTitle || selectedQuiz.title}
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
