import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Star,
  Eye,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Table,
  Presentation,
  Image,
  Video,
  Archive,
  Code,
  File,
} from "lucide-react"; // Added Chevrons for pagination
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import Navbar from "../NavigationBar";
import Fuse from "fuse.js";
import SearchBar from "../searchbar";
import { collection, collectionGroup, getDocs, limit, orderBy, Query, query } from "firebase/firestore";
import Footer from "../Footer";
import { useNavigate } from "react-router";
import { useResources } from "../ResourcesContext";
import AlertModal from "../AlertModal"; // <-- Imported AlertModal

export default function BrowseResources() {
  const { resources: recentResources, loading: recentLoading } = useResources();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false); // for Firestore search
  const [marginTop, setMarginTop] = useState(36 * 4);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
    { id: 1, resourceTitle: "Calculus Notes", description: "Comprehensive notes on calculus.", displayName: "Alice" },
    { id: 2, resourceTitle: "Physics Past Papers", description: "Past papers for physics exams.", displayName: "Bob" },
    { id: 3, resourceTitle: "Chemistry Formulas", description: "A handy sheet of chemistry formulas.", displayName: "Charlie" },
  ]; // Placeholder for loading state

  const navigate = useNavigate();

  const navigateTo = (res) =>{
    if (res.id) {
      navigate(`/material/${res.id}`, { state: { resource: res } });
    }
  }

  // Fuse.js setup
  const fuse = useMemo(() => {
    return new Fuse(recentResources, {
      keys: [
        "resourceTitle",
        "description",
        "tags",
        "courseSubject",
        "courseCode",
      ],
      threshold: 0.4,
      getFn: (item, path) => {
        const value = item[path];
        if (Array.isArray(value)) return value.map((v) => v.trim());
        return value;
      },
    });
  }, [recentResources]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!search.trim()) {
        setFiltered(recentResources);
      } else {
        setLoading(true);

        let results = fuse.search(search).map((r) => r.item);

        if(results.length === 0){
          try{
            const q = query(
              collectionGroup(db, "Materials"),
              orderBy("createdAt", "desc"),
            );

            const snapshot = await getDocs(q);
            const allDocs = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            //fused search on all docs
            const fullFuse = new Fuse(allDocs, {
              keys: [
              "resourceTitle",
                "description",
                 "tags",
                "courseSubject",
                "courseCode",
                ],
                threshold: 0.4,
            });

            results = fullFuse.search(search).map(r => r.item);
          }catch(err){
            console.error("Error searching all resources:", err);
            // REPLACED SILENT CONSOLE ERROR WITH VISUAL ALERT
            setAlertConfig({
              isOpen: true,
              title: "Search Error",
              message: "Failed to search the database. Please check your connection and try again.",
              type: "error"
            });
          }
        }
        setFiltered(results);
        setCurrentPage(1);
        setLoading(false);
      }
      
    }, 400);

    return () => clearTimeout(handler);
  }, [search, fuse, recentResources]);

  // ADD PAGINATION STATE
  useEffect(() => {
    const timer = setTimeout(() => {
      setMarginTop(10 * 4); 
    }); 
    return () => clearTimeout(timer);
  }, []);

  // CALCULATE CURRENT PAGE ITEMS
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // change page and scroll to top of list
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0.5, behavior: "smooth" });
  };

  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const delta = 1; //How many next to current page
    const range = [];
    const rangeWithDots = [];
    let l;

    // build the range
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    // insert dots for gaps
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-6xl mx-auto py-10 px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Browse Resources
        </h2>
        <p className="text-gray-600 mb-6">
          Find the study materials you need to succeed.
        </p>

        {/* Search bar */}
        <div
          style={{
            marginTop: `${marginTop}px`,
            marginBottom: "2rem",
            transition: "margin-top 0.5s ease-in-out",
          }}
        >
          <SearchBar
            placeholder="Search for lecture notes, past papers, etc."
            value={search}
            onChange={setSearch}
            isFocused={"true"}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {["Course", "Subject", "Material Type", "Tags"].map((filter) => (
            <button
              key={filter}
              className="border border-gray-300 rounded-md px-4 py-1 text-sm hover:bg-gray-100"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {search === "" ? "Recent Resources" : "Search Results"} 
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filtered.length} found)
          </span>
        </h3>

        {loading || recentLoading ? (
          <div className="mt-6 space-y-4 min-h-100 blur-sm animate-pulse">
          {filtered.length === 0 && search ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            // MAP OVER dummyResources
            dummyResources.map((res) => (
              <div
                key={res.id}
                className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition cursor-pointer"
                onClick={() => navigateTo(res)}
              >
                <h4 className="font-semibold">{res.resourceTitle}</h4>
                <p className="text-sm text-gray-700 mb-1">{res.description}</p>
                <p className="text-xs text-gray-500">
                  Uploaded by:{" "}
                  {res.displayName || res.uploaderEmail || "Unknown user"}
                </p>
              </div>
            ))
          )}
        </div>
        ):(
          <>
          <div className="mt-6 space-y-4 min-h-100">
          {currentItems.length === 0 ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            // MAP OVER dummyResources
            dummyResources.map((res) => (
              <div
                key={res.id}
                className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition cursor-pointer"
                onClick={() => navigateTo(res)}
              >
                <h4 className="font-semibold">{res.resourceTitle}</h4>
                <p className="text-sm text-gray-700 mb-1">{res.description}</p>
                <p className="text-xs text-gray-500">
                  Uploaded by:{" "}
                  {res.displayName || res.uploaderEmail || "Unknown user"}
                </p>
              </div>
            ))
          )}
        </div>
        ):(
          <>
          <div className="mt-6 space-y-4 min-h-100">
          {currentItems.length === 0 ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            // MAP OVER currentItems
            currentItems.map((res) => (
              <div
                key={res.id}
                className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition cursor-pointer"
                onClick={() => setSelectedResource(res)}
              >
                {/* Left side: Large file type icon */}
                <div className="flex-shrink-0" title={res.materialType}>
                  <div className="text-9xl">
                    {getFileTypeIcon(res.materialType)}
                  </div>
                </div>

                {/* Center: content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg">{res.resourceTitle}</h4>
                  <p className="text-sm text-gray-700 mb-1">
                    {res.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded by:{" "}
                    {res.displayName || res.uploaderEmail || "Unknown user"}
                  </p>
                </div>

                {/* Right side: save button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (savedIds.includes(res.id)) {
                      unsaveResource(res.id);
                    } else {
                      saveResource(res);
                    }
                  }}
                  className="text-gray-500 hover:text-yellow-500 flex-shrink-0"
                  title={savedIds.includes(res.id) ? "Unsave" : "Save"}
                >
                  <Star
                    size={24}
                    className={
                      savedIds.includes(res.id) ? "text-yellow-400" : ""
                    }
                    fill={savedIds.includes(res.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
            ))
          )}
        </div>

        {/* FUNCTIONAL PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

                {/* Generate Page Numbers and Ellipses dynamically */}
                {getPageNumbers().map((num, index) =>
                  num === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="px-2 py-1 text-gray-500"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${num}`}
                      onClick={() => paginate(num)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        currentPage === num
                          ? "bg-blue-700 text-white font-medium shadow-sm"
                          : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {num}
                    </button>
                  ),
                )}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        </>
        )}
        
      </main>

      {/* Resource Details Modal */}
      {/* {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {selectedResource.resourceTitle}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {selectedResource.description}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Uploaded by:{" "}
              {selectedResource.displayName || selectedResource.uploaderEmail}
            </p>
            <div className="flex gap-3">
              {/* save/un-save in modal */}
              <button
                onClick={() => {
                  if (savedIds.includes(selectedResource.id)) {
                    unsaveResource(selectedResource.id);
                  } else {
                    saveResource(selectedResource);
                  }
                }}
                className="text-gray-500 hover:text-yellow-500"
                title={
                  savedIds.includes(selectedResource.id) ? "Unsave" : "Save"
                }
              >
                <Star
                  size={20}
                  className={
                    savedIds.includes(selectedResource.id)
                      ? "text-yellow-400"
                      : ""
                  }
                  fill={
                    savedIds.includes(selectedResource.id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>

              <button
                onClick={() => {
                  if (selectedResource.fileLink) {
                    window.open(selectedResource.fileLink, "_blank");
                  } else {
                    // UPDATED: Replaced alert with AlertModal state
                    setAlertConfig({
                      isOpen: true,
                      title: "Not Found",
                      message: "No URL available for this resource.",
                      type: "warning"
                    });
                  }
                  setSelectedResource(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm flex-1 justify-center"
              >
                <Eye size={16} /> View
              </button>
              <button
                onClick={() => {
                  if (selectedResource.fileId) {
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${selectedResource.fileId}`;
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download =
                      selectedResource.resourceTitle +
                      (selectedResource.materialType || ".pdf");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    // UPDATED: Replaced alert with AlertModal state
                    setAlertConfig({
                      isOpen: true,
                      title: "Not Found",
                      message: "No download link available for this resource.",
                      type: "warning"
                    });
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
      )} */}

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
}
