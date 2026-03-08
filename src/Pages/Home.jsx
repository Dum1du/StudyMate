import React, { useEffect, useState } from "react";
import Navbar from "../NavigationBar";
import SearchBar from "../searchbar";
import {
  FaBell,
  FaComment,
  FaFolderOpen,
  FaQuestionCircle,
  FaUpload,
  FaUsers,
} from "react-icons/fa";
import { BiNotification } from "react-icons/bi";
import { Calendar, MailOpen, Eye, Download, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ed_bg from "../Bg images/ed_bg.jpg";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { pdfs } from "../add"; 
import Footer from "../Footer";
import { collectionGroup, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useResources } from "../ResourcesContext";
import AlertModal from "../AlertModal"; // <-- Added AlertModal Import

const PreviewCard = ({ title, subtitle, fileLink, onClick }) => {
  const previewUrl = fileLink ? fileLink.replace(/\/view.*|\/edit.*/, "/preview") : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-64 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
    >
      {/* Top Half: PDF iframe Preview */}
      <div className="h-3/5 bg-gray-100 relative overflow-hidden border-b border-gray-200">
        {previewUrl ? (
          <>
            <iframe
              src={previewUrl}
              className="w-full h-[200%] transform origin-top border-0 pointer-events-none opacity-90"
              title={`${title} preview`}
            />
            <div className="absolute inset-0 bg-transparent z-10 hover:bg-black/5 transition-colors"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <FaFolderOpen size={30} className="mb-2 text-gray-300" />
            <span className="text-xs">No Preview</span>
          </div>
        )}
      </div>

      {/* Bottom Half: Text Content */}
      <div className="p-4 h-2/5 flex flex-col justify-center bg-white">
        <h3 className="font-bold text-gray-800 truncate text-sm sm:text-base">{title || "Untitled"}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">
          {subtitle || "No description available."}
        </p>
      </div>
    </div>
  );
};
// --------------------------------------------------

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filtered, setFiltered] = useState([]);

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

  const dummyResources = [
    {
      title: "Calculus Notes",
      subtitle: "Comprehensive notes on calculus topics.",
    },
    {
      title: "Physics Problems",
      subtitle: "Practice problems with solutions.",
    },
    {
      title: "Chemistry Formulas",
      subtitle: "Key formulas for chemistry exams.",
    },
    {
      title: "Biology Diagrams",
      subtitle: "Labeled diagrams for biology concepts.",
    },
  ];

  const { resources, loading } = useResources();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || user.email || "User");
      } else {
        setUserName(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-b from-white to-white py-8 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(249, 249, 249, 0.9), rgba(240, 244, 249, 0.6)), url(${ed_bg})`,
        }}
      >
        <div className="absolute top-15 right-4 flex space-x-3">
          <button
            onClick={() => navigate("/noticeboard")}
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md hover:bg-blue-600"
          >
            <Calendar className="text-white text-lg" />
          </button>
          <button
            onClick={() => navigate("/faq")} 
            className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md hover:bg-blue-600">
            <FaQuestionCircle className="text-white text-lg" />
          </button>
        </div>

        <div className="mt-20 text-center px-4 sm:px-8 lg:px-16">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-black drop-shadow-white">
            {userName ? `Welcome back, ${userName}!` : "Welcome back!"}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mt-2 drop-shadow-white">
            What would you like to learn today?
          </p>
        </div>

        {/* Searchbar */}
        <div className="mt-15" onClick={() => navigate("/browseresources")}>
          <SearchBar placeholder="Search for resources..." />
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 px-4 sm:px-8">
          <Link
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#A0F7FA] text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
            to={"/upload"}
          >
            <div className="p-2 bg-white rounded-xl">
              <FaUpload className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Upload Resource</span>
              <span className="text-xs text-gray-500">Share your study materials</span>
            </div>
          </Link>

          <Link
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#DAA2F0] text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
            onClick={() => navigate("/resources")}
          >
            <div className="p-2 bg-white rounded-xl">
              <FaFolderOpen className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">My Resources</span>
              <span className="text-xs text-gray-500">View your uploaded content</span>
            </div>
          </Link>

          <Link
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-300 text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
            onClick={() => navigate("/discussions")}
          >
            <div className="p-2 bg-white rounded-xl">
              <FaComment className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Discussions</span>
              <span className="text-xs text-gray-500">Join conversations</span>
            </div>
          </Link>

          <Link
            onClick={() => navigate("/kuppisessions")}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-400 text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
          >
            <div className="p-2 bg-white rounded-xl">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Kuppi Sessions</span>
              <span className="text-xs text-gray-500">Meet your study group</span>
            </div>
          </Link>
        </div>

        {/* Recently Added Section */}
        {loading ? (
          <div className="mt-10 px-4">
            <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200/50 max-w-7xl mx-auto backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Recently Added</h2>
                <span className="text-sm text-blue-500 cursor-progress hover:underline">View All</span>
              </div>
              <section className="mt-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 blur-sm animate-pulse">
                  {dummyResources.map((dum, idx) => (
                    <PreviewCard
                      key={idx}
                      title={dum.title}
                      subtitle={dum.subtitle}
                      fileLink={null}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="mt-10 px-4">
            <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200/50 max-w-7xl mx-auto backdrop-blur-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-black">Recently Added</h2>
                <span className="text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/browseresources")}>
                  View All
                </span>
              </div>
              <section className="mt-4 px-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {resources.slice(0, 4).map((res, idx) => (
                    <PreviewCard
                      key={idx}
                      title={res.resourceTitle}
                      subtitle={res.description}
                      fileLink={res.fileLink}
                      onClick={() => setSelectedResource(res)}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Popular Resources Section */}
        <div className="mt-8 px-4 pb-12">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200/50 max-w-7xl mx-auto backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Popular Resources</h2>
              <span className="text-sm text-blue-500 cursor-pointer hover:underline" onClick={() => navigate("/browseresources")}>
                View All
              </span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pdfs.slice(0, 4).map((pdf, idx) => (
                  <PreviewCard
                    key={`popular-${idx}`}
                    title={pdf.title}
                    subtitle={pdf.subtitle}
                    fileLink={pdf.fileUrl} 
                    onClick={() => setSelectedResource(pdf)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors z-20"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 pr-8">
              {selectedResource.resourceTitle || selectedResource.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {selectedResource.description || selectedResource.subtitle}
            </p>

            <div className="w-full h-[50vh] min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6 overflow-hidden">
              {selectedResource.fileLink || selectedResource.fileUrl ? (
                <iframe
                  src={(selectedResource.fileLink || selectedResource.fileUrl).replace(
                    /\/view.*|\/edit.*/,
                    "/preview"
                  )}
                  className="w-full h-full border-0"
                  title="PDF Preview Full"
                />
              ) : (
                <p>No Preview Available</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const link = selectedResource.fileLink || selectedResource.fileUrl;
                  if (link) {
                    window.open(link, "_blank");
                  } else {
                    // REPLACED ALERT
                    setAlertConfig({
                      isOpen: true,
                      title: "Link Not Found",
                      message: "No URL available for this resource.",
                      type: "warning"
                    });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold flex-1 transition-colors"
              >
                <Eye size={18} /> Open in New Tab
              </button>
              <button
                onClick={() => {
                  if (selectedResource.fileId) {
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${selectedResource.fileId}`;
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = (selectedResource.resourceTitle || "Resource") + ".pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else if (selectedResource.fileUrl) {
                    const link = document.createElement("a");
                    link.href = selectedResource.fileUrl;
                    link.download = (selectedResource.title || "Resource") + ".pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    // REPLACED ALERT
                    setAlertConfig({
                      isOpen: true,
                      title: "Download Unavailable",
                      message: "No download link available for this resource.",
                      type: "warning"
                    });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold flex-1 transition-colors"
              >
                <Download size={18} /> Download File
              </button>
            </div>
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
    </>
  );
}

export default Home;