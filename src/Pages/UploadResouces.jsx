import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../NavigationBar";
import { auth } from "../firebase";
import socket from "../socket";
import axios from "axios";
import Footer from "../Footer";
import ed_bg from "../Bg images/ed_bg.jpg";

const COURSES = [
  // Compulsory Non-GPA Courses
  { code: "FDE3023", subject: "Empowering for Independent Learning" },
  { code: "MHZ2250", subject: "Elementary Mathematics" },

  // Year 1 Compulsory
  { code: "EE13346", subject: "Web Application Development" },
  { code: "EE13366", subject: "Database Systems" },
  { code: "EE13372", subject: "Programming in Python" },
  { code: "EEX3467", subject: "Software Engineering Concepts and Programming" },
  { code: "LTE34SI", subject: "English for Academic Purposes" },
  { code: "EE13347", subject: "Web Technology" },
  { code: "EE13262", subject: "Introduction to Object Oriented Programming" },
  { code: "EE13269", subject: "Mobile Application Design" },
  { code: "EEL3263", subject: "Communication Skills" },
  { code: "EEX3273", subject: "Communication and Computer Technology" },
  { code: "MHZ3356", subject: "Mathematics for Computing 1" },

  // Year 2 Compulsory
  { code: "AGM4367", subject: "Economics and Marketing for Engineers" },
  { code: "EE14267", subject: "Requirement Engineering" },
  { code: "EE14270", subject: "Computer Security Concepts" },
  { code: "EE14360", subject: "Introduction to Artificial Intelligence" },
  { code: "EEX4365", subject: "Data Structures and Algorithms" },
  { code: "MHZ4359", subject: "Mathematics for Computing II" },
  { code: "EE14361", subject: "User Experience Engineering" },
  { code: "EE14362", subject: "Object Oriented Design" },
  { code: "EE14466", subject: "Data Modelling and Database Systems" },
  { code: "EEY4189", subject: "Software Design in Group" },
  { code: "MHZ4377", subject: "Applied Statistics" },

  // Year 3 Compulsory
  { code: "EE15467", subject: "Software Testing and Quality Assurance" },
  { code: "EEX5263", subject: "Computer Architecture" },
  { code: "EEX5364", subject: "Data Communication" },
  { code: "LLJ5265", subject: "Introduction to Laws of Sri Lanka" },
  {
    code: "EEW5611",
    subject:
      "Industrial Training - Software Research Methodology and Project Identification",
  },
  {
    code: "EEY5289",
    subject: "Research Methodology and Project Identification",
  },
  { code: "CVM5402", subject: "Accounting for Engineers" },
  { code: "EEX5265", subject: "Operating Systems" },
  { code: "MHJ5372", subject: "Technology, Society and Environment" },
  { code: "MHZ5375", subject: "Discrete Mathematics" },

  // Year 4 Compulsory
  { code: "EE16360", subject: "Software Project Management" },
  { code: "EEI6171", subject: "Emerging Technologies" },
  { code: "EE16567", subject: "Software Architecture and Design" },
  { code: "EEY6689", subject: "Final Project - Software Engineering" },
  { code: "EEM6202", subject: "Professional Practice" },
  { code: "EEX6373", subject: "Performance Modelling" },

  // Elective Courses
  { code: "EEM3366", subject: "Introduction to Business Studies" },
  { code: "EE14369", subject: "Mobile App Development with Android" },
  { code: "EEX4373", subject: "Data Science" },
  { code: "MHJ4271", subject: "History of Technology" },
  { code: "EEX5378", subject: "Neural Networks and Fuzzy Logic Applications" },
  { code: "EEX5376", subject: "Embedded systems and IOT" },
  { code: "EEI6279", subject: "Natural Language Processing" },
  { code: "EE16280", subject: "Creative Design" },
  { code: "EEI6366", subject: "Big Data Technologies & Distributed Systems" },
  { code: "EEI6377", subject: "Principles and Applications of Data Mining" },
  { code: "EEI6369", subject: "Cloud Computing" },
  { code: "EEX6363", subject: "Compiler Design" },

  // Previous Curriculum (RC 2019) Courses mapped in Annexure 2
  { code: "EE14346", subject: "Web Technology" },
  { code: "EE13266", subject: "Database Systems" },
  { code: "AGM3263", subject: "Communication Skills" },
  { code: "EEX3373", subject: "Communication and Computer Technology" },
  { code: "LTE3407", subject: "English for Academic Purposes" },
  { code: "MHZ4256", subject: "Mathematics for Computing I" },
  { code: "EE15270", subject: "Computer Security Concepts" },
  { code: "EEX6340", subject: "Introduction to Artificial Intelligence" },
  { code: "EEX4465", subject: "Data Structures and Algorithms" },
  { code: "EE14366", subject: "Data Modelling and Database Systems" },
  { code: "MHZ3459", subject: "Basic Mathematics for Computing" },
  { code: "EEX5563", subject: "Computer Architecture and Systems" },
  { code: "EEX5464", subject: "Data Communication" },
  {
    code: "EEW5811",
    subject: "Industrial Training - Software Research Methodology and Project",
  },
  { code: "EEY6189", subject: "Identification" },
  { code: "EEX6278", subject: "Neural Networks and Fuzzy Logic" },
  { code: "EE15280", subject: "Creative Design" },
  { code: "DMM6602", subject: "Management for Engineers" },
  { code: "EEI5466", subject: "Advanced Database Systems" },
];

const TAGS = [
  "final-exam",
  "midterm",
  "quiz",
  "chapter-1",
  "chapter-2",
  "chapter-3",
  "chapter-4",
  "chapter-5",
  "chapter-6",
  "chapter-7",
  "important",
  "notes",
  "summary",
  "tutorial",
  "assignment",
  "practice",
  "solution",
  "lecture",
  "review",
  "cheatsheet",
  "guide",
];

function UploadResources() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const fileInputRef = useRef(null);

  // Handle course code input and show suggestions
  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCode(value);

    if (value.length > 0) {
      const filtered = COURSES.filter((course) =>
        course.code.startsWith(value),
      );
      setCodeSuggestions(filtered);
      setShowCodeDropdown(true);
    } else {
      setCodeSuggestions([]);
      setShowCodeDropdown(false);
    }
  };

  // Handle subject input and show suggestions
  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);

    if (value.length > 0) {
      const filtered = COURSES.filter((course) =>
        course.subject.toLowerCase().startsWith(value.toLowerCase()),
      );
      setSubjectSuggestions(filtered);
      setShowSubjectDropdown(true);
    } else {
      setSubjectSuggestions([]);
      setShowSubjectDropdown(false);
    }
  };

  // Select course from code dropdown
  const selectCourseByCode = (course) => {
    setCode(course.code);
    setSubject(course.subject);
    setCodeSuggestions([]);
    setShowCodeDropdown(false);
  };

  // Select course from subject dropdown
  const selectCourseBySubject = (course) => {
    setCode(course.code);
    setSubject(course.subject);
    setSubjectSuggestions([]);
    setShowSubjectDropdown(false);
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // File handling
  const handleFiles = (files) => {
    if (files.length > 0) {
      const uploadedFile = files[0];
      setFile(uploadedFile);

      // Automatically detect and set material type
      const fileExtension = uploadedFile.name.split(".").pop().toLowerCase();

      if (fileExtension === "pdf") {
        setType(".pdf");
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        setType(".docx");
      } else if (["jpg", "jpeg", "png", "gif", "bmp"].includes(fileExtension)) {
        setType(".jpg");
      } else {
        setType(""); // If unsupported format
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = () => {
    setFile(null);
    setType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // Stable callback using useCallback so React doesn't recreate it on each render
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
        setSuccess(true);
        setShowSuccessOverlay(true);

        setTimeout(() => {
          setShowSuccessOverlay(false);

          setTimeout(() => {
            setSuccess(false);
            setShowProgress(false);
            setTitle("");
            setDesc("");
            setCode("");
            setSubject("");
            setType("");
            setSelectedTags([]);
            setFile(null);
            setProgress(0);
          }, 600);
        }, 3000);

        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) socket.connect();

    socket.on("uploadStatus", handleUploadStatus);

    return () => {
      socket.off("uploadStatus", handleUploadStatus);
    };
  }, [handleUploadStatus]);

  useEffect(() => {
    console.log("Progress updated:", progress);
  }, [progress]);

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
    formData.append("tags", selectedTags.join(" "));
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
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(249, 249, 249, 0.9), rgba(240, 244, 249, 0.6)), url(${ed_bg})`,
      }}
    >
      <div className="flex flex-col relative items-center">
        <form
          className="items-start md:w-[60%] sm:w-[50%] bg-white border border-gray-400 rounded-xl shadow-md sm:mt-5 p-6"
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
            Resource Title <span className="text-red-600">*</span>
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
            Description(optional)
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
            <div className="flex-1 relative">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Course Code<span className="text-red-600">*</span>
              </label>
              <input
                onChange={handleCodeChange}
                value={code}
                type="text"
                placeholder="eg: EEI5465"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none"
                required
              />
              {showCodeDropdown && codeSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-400 rounded-lg mt-1 z-10 shadow-lg max-h-60 overflow-y-auto">
                  {codeSuggestions.map((course, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCourseByCode(course)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-100 border-b last:border-b-0"
                    >
                      <span className="font-semibold">{course.code}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        - {course.subject}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-3 relative">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Course / Subject<span className="text-red-600">*</span>
              </label>
              <input
                onChange={handleSubjectChange}
                value={subject}
                type="text"
                placeholder="eg: Data Structures and Algorithm"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              />
              {showSubjectDropdown && subjectSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-400 rounded-lg mt-1 z-10 shadow-lg max-h-50 overflow-y-auto">
                  {subjectSuggestions.map((course, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCourseBySubject(course)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-100 border-b last:border-b-0"
                    >
                      <span className="font-semibold">{course.subject}</span>
                      <span className="text-gray-600 text-sm ml-2">
                        ({course.code})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Material Type
              </label>
              <select
                value={type}
                className="w-full  border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none bg-gray-100 cursor-not-allowed "
              >
                <option value=""></option>
                <option value=".pdf">.pdf</option>
                <option value=".docx">.docx</option>
                <option value=".jpg">.jpg / .jpeg / .png</option>
              </select>
            </div>
          </div>

          {/* TAGS */}
          <label className="font-medium flex justify-start mt-5 mb-3 mx-1">
            Tags (Select multiple)<span className="text-red-600">*</span>
          </label>
          <div className="w-full flex flex-wrap gap-2 p-3 border border-gray-400 rounded-lg bg-gray-50">
            {TAGS.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* UPLOAD */}
          <label className="font-medium flex justify-start mt-10 mb-2 mx-1">
            File Upload<span className="text-red-600">*</span>
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
            {file && (
              <div className="mt-2 flex items-center gap-2">
                <p className="text-green-600">{file.name}</p>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            )}
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
            <div
              className={`w-full bg-gray-300 rounded mt-4 overflow-hidden ${
                success ? "animate-fadeOut" : "animate-fadeIn"
              }`}
            >
              <div
                className={`text-xs text-white p-1 text-center transition-all duration-300 ease-in-out ${
                  success ? "bg-green-500" : "bg-blue-600"
                }`}
                style={{ width: `${progress}%` }}
              >
                {success ? "Uploaded!" : `${progress}%`}
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
                <h2 className="text-2xl font-semibold mb-2">
                  Upload Successful!
                </h2>
                <p className="text-gray-600">
                  Your material has been uploaded to the system.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default UploadResources;
