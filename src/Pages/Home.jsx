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
import { pdfs, PdfCard } from "../add";
import Footer from "../Footer";
import { collectionGroup, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useResources } from "../ResourcesContext";

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [filtered, setFiltered] = useState([]);

  const dummyResources = [
    {
      title: "Calculus Notes",
      subtitle: "Comprehensive notes on calculus topics.",},
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
  ]

  const { resources, loading } = useResources();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // displayName
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
          <button className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-md hover:bg-blue-600">
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
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#A0F7FA] text-black shadow-md w-full sm:w-60 transform
         transition-transform
         hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
            to={"/upload"}
          >
            <div className="p-2 bg-white rounded-xl">
              <FaUpload className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">Upload Resource</span>
              <span className="text-xs text-gray-500">
                Share your study materials
              </span>
            </div>
          </Link>

          <Link
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#DAA2F0]
         text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 
         hover:shadow-xl border border-transparent hover:border-blue-400"
            onClick={() => navigate("/resources")}
          >
            <div className="p-2 bg-white rounded-xl">
              <FaFolderOpen className="text-blue-500 text-xl" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">My Resources</span>
              <span className="text-xs text-gray-500">
                View your uploaded content
              </span>
            </div>
          </Link>

          <Link
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-300
         text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 
         hover:shadow-xl border border-transparent hover:border-blue-400"
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
              <span className="text-xs text-gray-500">
                Meet your study group
              </span>
            </div>
          </Link>
        </div>

        {loading ? (
          /* Recently Added dummy */
        <div  className="mt-10 px-4">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Recently Added</h2>
              <span className="text-sm text-blue-500 cursor-progress hover:underline">
                View All
              </span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 blur-sm animate-pulse">
                {dummyResources.map((dum, idx) => (
                  <PdfCard
                    key={idx}
                    title={dum.title}
                    subtitle={dum.subtitle}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
        ) : (/* Recently Added  */
        <div className="mt-10 px-4">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Recently Added</h2>
              <span className="text-sm text-blue-500 cursor-pointer hover:underline">
                View All
              </span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {resources.map((res, idx) => (
                  <PdfCard
                    key={idx}
                    title={res.resourceTitle}
                    subtitle={res.description}
                    onClick={() => setSelectedResource(res)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>)}


        {/* Popular Resources  */}
        <div className="mt-8 px-4">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-blue-200 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">
                Popular Resources
              </h2>
              <span className="text-sm text-blue-500 cursor-pointer hover:underline">
                View All
              </span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfs.map((pdf, idx) => (
                  <PdfCard
                    key={`popular-${idx}`}
                    title={pdf.title}
                    subtitle={pdf.subtitle}
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
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {selectedResource.title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {selectedResource.description}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              {selectedResource.subtitle}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedResource.fileUrl) {
                    window.open(selectedResource.fileUrl, "_blank");
                  } else {
                    alert("No URL available for this resource.");
                  }
                  setSelectedResource(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm flex-1 justify-center"
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => {
                  if (selectedResource.fileUrl) {
                    const link = document.createElement("a");
                    link.href = selectedResource.fileUrl;
                    link.download = selectedResource.title + ".pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    alert("No download link available for this resource.");
                  }
                  setSelectedResource(null);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm flex-1 justify-center"
              >
                <Download size={16} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;
