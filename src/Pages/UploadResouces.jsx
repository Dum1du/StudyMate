import React, { useEffect, useRef, useState } from "react";
import Navbar from "../NavigationBar";
import { auth } from "../firebase";
import socket from "../socket";
import axios from "axios";

function UploadResources() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
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

  useEffect(() => {
  if (!socket) return;

  // Ensure socket is connected
  if (!socket.connected) socket.connect();

  const handleUploadStatus = (data) => {
    console.log("Upload step:", data.step, data.message);
    // Optionally update progress based on backend steps
    if (data.step === "drive") {
      setProgress(70)
      console.log("progress : " + progress);
    };
    if (data.step === "drive") {
      setProgress(90)
      console.log("progress : " + progress);
    };
    if (data.step === "drive") {
      setProgress(100)
      console.log("progress : " + progress);
    };
  };

  socket.on("uploadStatus", handleUploadStatus);

  return () => {
    socket.off("uploadStatus", handleUploadStatus);
  };
}, []);

  // ✅ Main upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const token = await auth.currentUser.getIdToken();

    console.log("waiting for socket!");
    // Wait for socket to connect
  if (!socket.connected) console.warn("Socket not connected yet!");
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
        onUploadProgress: (progressEvent) => {
          const percent = Math.floor(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setProgress(percent);
        },
      });

      console.log("Upload success:", res.data);
      setProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  return (
    <div className="bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center">
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
          {progress > 0 && (
            <div className="w-full bg-gray-300 rounded mt-4">
              <div
                className="bg-blue-600 text-xs text-white p-1 text-center rounded"
                style={{ width: `${progress}%` }}
              >
                {progress}%
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
        </form>
      </div>
    </div>
  );
}

export default UploadResources;
