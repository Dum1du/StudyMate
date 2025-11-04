import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../NavigationBar";
import { auth } from "../firebase";
import socket from "../socket";
import axios from "axios";
import Footer from "../Footer";

function UploadResources() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
const [success, setSuccess] = useState(false);
const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ File handling
  const handleFiles = (files) => {
    if (files.length > 0) setFile(files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // ✅ Stable callback using useCallback so React doesn’t recreate it on each render
  const handleUploadStatus = useCallback((data) => {
    console.log("Upload step:", data.step, data.message);
    setShowProgress(true);

    switch (data.step) {
      case "received":
        setProgress(10);
        break;
      case "drive":
        setProgress(70);
        break;
      case "firestore":
        setProgress(90);
        break;
      case "complete":
        setProgress(100);
        setSuccess(true); // turn progress bar green
        setShowSuccessOverlay(true); // ✅ Show overlay

        setTimeout(() => {
        // fade out overlay
        setShowSuccessOverlay(false);

        // reset form after fade-out
        setTimeout(() => {
          setSuccess(false);
          setShowProgress(false);
          setTitle("");
          setDesc("");
          setCode("");
          setSubject("");
          setType("");
          setTags("");
          setFile(null);
          setProgress(0);
        }, 600);
      }, 3000);

        break;
      default:
        break;
    }
  }, []);

  // ✅ Attach socket listener (stable)
  useEffect(() => {
    if (!socket) return;

    // Ensure connected before listening
    if (!socket.connected) socket.connect();

    socket.on("uploadStatus", handleUploadStatus);

    // Cleanup
    return () => {
      socket.off("uploadStatus", handleUploadStatus);
    };
  }, [handleUploadStatus]); // 👈 depends on the stable callback

  // ✅ Watch progress changes (optional, for debugging)
  useEffect(() => {
    console.log("Progress updated:", progress);
  }, [progress]);

  // ✅ Main upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const token = await auth.currentUser.getIdToken();

    console.log("waiting for socket!");
    if (!socket.connected)
      await new Promise((resolve) => socket.once("connect", resolve));
    console.log("socket created!");

    const formData = new FormData();
    formData.append("resourceTitle", title);
    formData.append("description", desc);
    formData.append("courseCode", code);
    formData.append("courseSubject", subject);
    formData.append("tags", tags);
    formData.append("materialType", type);
    formData.append("file", file);

    setProgress(0);

    try {
      const res = await axios.post("http://localhost:4000/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-socket-id": socket.id,
        },
      });

      console.log("Upload success:", res.data);
      // setProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col relative items-center">
        <form
          className="items-start md:w-[60%] sm:w-[50%] bg-white rounded-xl shadow-md sm:mt-5 p-6"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl font-bold text-black">
            Upload Study Material
          </h1>
          <p className="text-gray-500 mt-2">
            Share your resources with the OUSL community.
          </p>

          {/* TITLE */}
          <label className="font-medium flex justify-start mt-10 mb-1 mx-1">
            Resource Title
          </label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            type="text"
            placeholder="eg: Data Structures and Algorithm"
            className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
            required
          />

          {/* DESCRIPTION */}
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Description
          </label>
          <textarea
            onChange={(e) => setDesc(e.target.value)}
            value={desc}
            placeholder="Briefly describe the content..."
            className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
            rows={3}
            required
          />

          {/* COURSE + SUBJECT + TYPE */}
          <div className="w-full sm:flex justify-around gap-x-10">
            <div className="flex-1">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Course Code
              </label>
              <input
                onChange={(e) => setCode(e.target.value.trim().toUpperCase())}
                value={code}
                type="text"
                placeholder="eg: EEI5465"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none"
                required
              />
            </div>

            <div className="flex-3">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Course / Subject
              </label>
              <input
                onChange={(e) => setSubject(e.target.value)}
                value={subject}
                type="text"
                placeholder="eg: Data Structures and Algorithm"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              />
            </div>

            <div className="flex-1">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Material Type
              </label>
              <select
                onChange={(e) => setType(e.target.value)}
                value={type}
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              >
                <option value="">Select type</option>
                <option value=".pdf">.pdf</option>
                <option value=".docx">.docx</option>
                <option value=".jpg">.jpg / .jpeg / .png</option>
              </select>
            </div>
          </div>

          {/* TAGS */}
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Tags
          </label>
          <input
            onChange={(e) => setTags(e.target.value.toLowerCase())}
            type="text"
            value={tags}
            placeholder="eg: #final-exam #chapter-5 #important"
            className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
            required
          />

          {/* UPLOAD */}
          <label className="font-medium flex justify-start mt-10 mb-2 mx-1">
            File Upload
          </label>
          <div
            className="w-full border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <p className="text-gray-600 mb-2">
              Drag & Drop your file here, or click to browse
            </p>
            <button
              type="button"
              onClick={handleBrowse}
              className="bg-gray-400 text-white px-4 py-2 cursor-pointer rounded hover:bg-gray-600 transition"
            >
              Browse File
            </button>
            {file && <p className="mt-2 text-green-600">{file.name}</p>}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            required
          />

          {/* Progress bar */}
         {showProgress && (
  <div className={`w-full bg-gray-300 rounded mt-4 overflow-hidden ${success ? "animate-fadeOut" : "animate-fadeIn"}`}>
    <div
      className={`text-xs text-white p-1 text-center transition-all duration-300 ease-in-out ${
        success ? "bg-green-500" : "bg-blue-600"
      }`}
      style={{ width: `${progress}%` }}
    >
      {success ? "✅ Uploaded!" : `${progress}%`}
    </div>
  </div>
)}



          {/* Submit button */}
          <div className="flex justify-end mt-10">
            <button
              type="submit"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700"
            >
              Upload Material
            </button>
          </div>
          {showSuccessOverlay && (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl animate-fadeIn">
    <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-xl shadow-lg animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-2">✅ Upload Successful!</h2>
      <p className="text-gray-600">Your material has been uploaded to the system.</p>
    </div>
  </div>
)}

        
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}


export default UploadResources;
