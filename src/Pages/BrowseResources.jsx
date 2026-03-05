import React, { useState, useEffect, useMemo } from "react";
import { Search, Star, Eye, Download, X, ChevronLeft, ChevronRight } from "lucide-react"; // Added Chevrons for pagination
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import Navbar from "../NavigationBar";
import Fuse from "fuse.js";
import SearchBar from "../searchbar";
import { collectionGroup, getDocs } from "firebase/firestore";
import Footer from "../Footer";

export default function BrowseResources() {
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [marginTop, setMarginTop] = useState(36 * 4);
  const [selectedResource, setSelectedResource] = useState(null);

  // ADD PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Fetch all materials once
  useEffect(() => {
    const fetchAllMaterials = async () => {
      const q = collectionGroup(db, "Materials");
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setResources(all);
      setFiltered(all); // Initialize filtered with all resources
    };

    fetchAllMaterials();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMarginTop(10 * 4); 
    }); 
    return () => clearTimeout(timer);
  }, []);

  // Fuse.js setup
  const fuse = useMemo(() => {
    return new Fuse(resources, {
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
  }, [resources]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!search.trim()) {
        setFiltered(resources);
      } else {
        const results = fuse.search(search).map((r) => r.item);
        setFiltered(results);
      }
      // RESET TO PAGE 1 ON NEW SEARCH
      setCurrentPage(1); 
    }, 400);

    return () => clearTimeout(handler);
  }, [search, fuse, resources]);

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
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  }

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
          {search === "" ? "All Resources" : "Search Results"} 
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filtered.length} found)
          </span>
        </h3>

        <div className="mt-6 space-y-4 min-h-100">
          {filtered.length === 0 && search ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            // MAP OVER currentItems
            currentItems.map((res) => (
              <div
                key={res.id}
                className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition cursor-pointer"
                onClick={() => setSelectedResource(res)}
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

        {/* FUNCTIONAL PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
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
            {getPageNumbers().map((num, index) => (
              num === '...' ? (
                <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
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
              )
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
          </div>
        )}
      </main>

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
              {selectedResource.resourceTitle}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {selectedResource.description}
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Uploaded by: {selectedResource.displayName || selectedResource.uploaderEmail}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (selectedResource.fileLink) {
                    window.open(selectedResource.fileLink, '_blank');
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
                  if (selectedResource.fileId) {
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${selectedResource.fileId}`;
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = selectedResource.resourceTitle + (selectedResource.materialType || '.pdf');
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
    </div>
  );
}