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
import { Calendar, MailOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ed_bg from "../Bg images/ed_bg.jpg";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

// Responsive 

const pdfs = [
  { title: "Introduction to Programming", subtitle: "Course: CS101" },
  { title: "Calculus Lecture Notes", subtitle: "Course: MA202" },
  { title: "Past Exam Papers - Physics", subtitle: "Course: PH101" },
  { title: "Study Guide - Chemistry", subtitle: "Course: CH101" },
];

function PdfCard({ title, subtitle }) {
  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 flex flex-col justify-between transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400">
      <div className="h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">PDF Preview</div>
      <div className="mt-3 text-center">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);

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
      <Navbar />

      <div
        className="min-h-screen bg-gradient-to-b from-white to-white py-8 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(249, 249, 249, 0.9), rgba(240, 244, 249, 0.9)), url(${ed_bg})`,
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
        <SearchBar placeholder="Search for resources..." />

      {/* Buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-6 px-4 sm:px-8">
        
        <Link className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#A0F7FA] text-black shadow-md w-full sm:w-60 transform
         transition-transform
         hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400"
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

        
        <button className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#DAA2F0] text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400">
          <div className="p-2 bg-white rounded-xl">
            <FaFolderOpen className="text-blue-500 text-xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">My Resources</span>
            <span className="text-xs text-gray-500">View your uploaded content</span>
          </div>
        </button>

       
        <button className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-300 text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400">
          <div className="p-2 bg-white rounded-xl">
            <FaComment className="text-blue-500 text-xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">Discussions</span>
            <span className="text-xs text-gray-500">Join conversations</span>
          </div>
        </button>

        
        <Link
        onClick={() => navigate("/kuppisessions")} 
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-400 text-black shadow-md w-full sm:w-60 transform transition-transform hover:scale-105 hover:shadow-xl border border-transparent hover:border-blue-400">
          <div className="p-2 bg-white rounded-xl">
            <FaUsers className="text-blue-500 text-xl" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold">Kuppi Sessions</span>
            <span className="text-xs text-gray-500">Meet your study group</span>
          </div>
        </Link>
      </div>

        {/* Recently Added  */}
        <div className="mt-10 px-4">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-white max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Recently Added</h2>
              <span className="text-sm text-blue-500 cursor-pointer hover:underline">View All</span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfs.map((pdf, idx) => (
                  <PdfCard key={idx} title={pdf.title} subtitle={pdf.subtitle} />
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Popular Resources  */}
        <div className="mt-8 px-4">
          <div className="rounded-lg border border-gray-200 shadow-md p-4 bg-white max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-black">Popular Resources</h2>
              <span className="text-sm text-blue-500 cursor-pointer hover:underline">View All</span>
            </div>
            <section className="mt-4 px-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pdfs.map((pdf, idx) => (
                  <PdfCard key={`popular-${idx}`} title={pdf.title} subtitle={pdf.subtitle} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
