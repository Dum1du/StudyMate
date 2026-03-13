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
import AlertModal from "../AlertModal"; // <-- Added AlertModal Import
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const MyResourcesUI = () => {
  const [resources, setResources] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // --- ADDED ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  // -------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setResources([]);
      return;
    }

    const q = query(collection(db, "users", user.uid, "savedResources"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(docs);
    });

    return () => unsubscribe();
  }, [user]);

  const togglePin = async (id, currentPinnedStatus) => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "savedResources", id);
      await updateDoc(docRef, { pinned: !currentPinnedStatus });
    }
  };

  // UPGRADED TO USE CONFIRMATION MODAL
  const removeResource = (id) => {
    setAlertConfig({
      isOpen: true,
      title: "Remove Resource",
      message:
        "Are you sure you want to remove this resource from your saved list?",
      type: "warning",
      onConfirm: async () => {
        if (user) {
          await deleteDoc(doc(db, "users", user.uid, "savedResources", id));
          closeAlert();
        }
      },
    });
  };

  const openQuizModal = (resource) => setSelectedQuiz(resource);
  const closeQuizModal = () => setSelectedQuiz(null);

  const viewResource = (res) => {
    if (res.id) {
      navigate(`/material/${res.id}`, { state: { resource: res } });
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

  const gotoBrowse = () => {
    setShowPinnedOnly(false)
    navigate("/browseresources");
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
  const otherResources = showPinnedOnly
    ? pinnedResources
    : filteredResources.filter((r) => !r.pinned);

  const isEmpty = filteredResources.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 text-gray-900">
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
                  onClick={
                    () => gotoBrowse()
                  }
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

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedResources.map((res) => (
                    <div
                      key={res.id}
                      className="relative bg-white border border-gray-300 rounded-2xl shadow-md flex flex-col h-80 justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Preview Section */}
                      <div className="h-40 bg-gray-100 relative border-b border-gray-200 flex items-center justify-center overflow-hidden">
                        {res.fileLink ? (
                          <>
                            <iframe
                              src={res.fileLink.replace(
                                /\/view.*|\/edit.*/,
                                "/preview",
                              )}
                              className="w-full h-[200%] border-0 pointer-events-none opacity-95"
                              title="Preview"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-transparent z-10" />
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="scale-150 mb-2">
                              {getFileTypeIcon(res.materialType)}
                            </div>
                            <span className="text-xs">No Preview</span>
                          </div>
                        )}

                        {/* Pin Button */}
                        <button
                          onClick={() => togglePin(res.id, res.pinned)}
                          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-gray-500 hover:text-yellow-600 transition z-20 shadow-sm backdrop-blur-sm"
                          title="Unpin"
                        >
                          <PinOff size={18} />
                        </button>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h3
                            className="text-lg font-bold text-gray-800 line-clamp-1"
                            title={res.resourceTitle || res.title}
                          >
                            {res.resourceTitle || "Untitled"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {res.description || "No description available."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewResource(res)}
                              className="text-gray-600 hover:text-blue-600 transition p-1"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => downloadResource(res)}
                              className="bg-green-400 hover:bg-green-600 text-white transition px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                              title="Download"
                            >
                              Download <Download size={18} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeResource(res.id)}
                              className="bg-red-500 hover:bg-red-600 text-white transition p-2 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
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

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherResources.map((res) => (
                  <div
                    key={res.id}
                    className="relative bg-white border border-gray-300 rounded-2xl shadow-md flex flex-col h-80 justify-between transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Preview Section */}
                    <div className="h-40 bg-gray-100 relative border-b border-gray-200 flex items-center justify-center overflow-hidden">
                      {res.fileLink ? (
                        <>
                          <iframe
                            src={res.fileLink.replace(
                              /\/view.*|\/edit.*/,
                              "/preview",
                            )}
                            className="w-full h-[200%] border-0 pointer-events-none opacity-95"
                            title="Preview"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-transparent z-10" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="scale-150 mb-2">
                            {getFileTypeIcon(res.materialType)}
                          </div>
                          <span className="text-xs">No Preview</span>
                        </div>
                      )}

                      {/* Pin Button */}
                      <button
                        onClick={() => togglePin(res.id, res.pinned)}
                        className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-gray-500 hover:text-yellow-600 transition z-20 shadow-sm backdrop-blur-sm"
                        title={res.pinned ? "Unpin" : "Pin"}
                      >
                        {res.pinned ? <PinOff size={18} /> : <Pin size={18} />}
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-800 line-clamp-1"
                          title={res.resourceTitle || res.title}
                        >
                          {res.resourceTitle || res.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {res.description || "No description available."}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewResource(res)}
                            className="bg-blue-500 hover:bg-blue-600 text-white transition px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                            title="View"
                          >
                            View
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => downloadResource(res)}
                            className="bg-green-500 hover:bg-green-600 text-white transition px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
                            title="Download"
                          >
                            Download <Download size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeResource(res.id)}
                          className="bg-red-500 hover:bg-red-600 text-white transition p-2 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

      {/* NEW ALERT MODAL INJECTION */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
};

export default MyResourcesUI;