import React, { useRef, useState } from "react";
import Navbar from "../NavigationBar";

function UploadResouces() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    if (files.length > 0) {
      setFile(files[0]); // store the first file
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleBrowse = () => {
    fileInputRef.current.click();
  };
  return (
    <div className="bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center">
        <form className="items-start md:w-[60%] sm:w-[50%] bg-white rounded-xl shadow-md sm:mt-5 p-6">
          <h1 className="text-[20px] sm:text-2xl md:text-2xl font-bold text-black drop-shadow-white">
            Upload Study Material
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mt-2 drop-shadow-white">
            Share your resouces with OUSL community.
          </p>
          {/* TITLE */}
          <div className="w-full">
            <label className="font-medium flex justify-start mt-10 mb-1 mx-1">
              Resource Title
            </label>
            <div className="relative">
              <input
                value=""
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                type="text"
                placeholder="eg: Data Structures and Algorithm"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              />
            </div>
          </div>
          {/* DESCRIPTION */}
          <div className="w-full">
            <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
              Description
            </label>
            <div className="relative">
              <textarea
                value=""
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                type="text"
                placeholder="Briefly describe the content of material..."
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                rows={3}
                required
              />
            </div>
          </div>
          {/* SUBJECT AND THE MATERIAL */}
          <div className="w-full sm:flex justify-around gap-x-10">
            <div className="flex-1 ">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Course/ Subject
              </label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) =>
                    setEmail(e.target.value.trim().toLowerCase())
                  }
                  className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    Select Course
                  </option>
                  <option value="data-structures-and-algorithms">
                    Data Structures and Algorithms
                  </option>
                  <option value="object-oriented-programming">
                    Object Oriented Programming
                  </option>
                  <option value="database-systems">Database Systems</option>
                  <option value="operating-systems">Operating Systems</option>
                  <option value="computer-networks">Computer Networks</option>
                  <option value="software-engineering">
                    Software Engineering
                  </option>
                  <option value="web-development">Web Development</option>
                  <option value="mobile-application-development">
                    Mobile Application Development
                  </option>
                </select>
              </div>
            </div>
            <div className="flex-1">
              <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
                Material Type
              </label>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) =>
                    setEmail(e.target.value.trim().toLowerCase())
                  }
                  placeholder="Briefly describe the content of material..."
                  className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                  required
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value=".pdf">.pdf</option>
                  <option value=".docx">.docx</option>
                  <option value=".jpg">.jpg / .jpeg / .png </option>
                </select>
              </div>
            </div>
          </div>
          {/* TAGS */}
          <div className="w-full">
            <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
              Tags
            </label>
            <div className="relative">
              <input
                value=""
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                type="text"
                placeholder="eg: #finel-exam #chapter-5 #important"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              />
            </div>
          </div>
          {/* UPLOAD AREA */}
          <div className="w-full">
            <label className="font-medium flex justify-start mt-10 mb-2 mx-1">
              File Upload
            </label>

            <div
              className="relative w-full border-2 border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <p className="text-gray-600 mb-2">
                Drag & Drop your file here, or click to browse
              </p>
              <button
                type="button"
                onClick={handleBrowse}
                className="bg-blue-600 text-white px-4 py-2 cursor-pointer rounded hover:bg-blue-600 transition"
              >
                Browse File
              </button>
              {file && <p className="mt-2 text-green-600">{file.name}</p>}
            </div>

            {/* Hidden input for actual file selection */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              required
            />
          </div>
          {/* PROGRESS BAR */}
          <div></div>
          {/* UPLOAD BUTTON */}
          <div className="flex justify-center flex-col items-end">
            <button
              type="submit"
              className="bg-blue-600 p-2 text-amber-50 mt-16 py-3 rounded-lg w-[100%] sm:w-[30%]"
            >
              <h1>Upload Material</h1>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadResouces;
