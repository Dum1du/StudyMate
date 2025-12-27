import React, { useState, useEffect, useMemo } from "react";
import { Search, Star, Eye, Download, X } from "lucide-react";
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

  // Fetch all materials once
  useEffect(() => {
    const fetchAllMaterials = async () => {
      const q = collectionGroup(db, "Materials");
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setResources(all);
    };

    fetchAllMaterials();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMarginTop(10 * 4); // Tailwind mt-20 = 20 * 0.25rem = 5rem = 80px
    }); // delay before transition starts (optional)

    return () => clearTimeout(timer);
  }, []);

  // Fuse.js setup (only rebuild when resources change)
  const fuse = useMemo(() => {
    return new Fuse(resources, {
      keys: [
        "resourceTitle",
        "description",
        "tags",
        "courseSubject",
        "courseCode",
      ],
      threshold: 0.4, // smaller = more accurate match

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
    }, 400); // wait 400ms after user stops typing

    return () => clearTimeout(handler);
  }, [search, fuse, resources]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder */}
      <Navbar />

      {/* Main content */}
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
            marginBottom: "2rem", // Tailwind mb-8 = 2rem
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
        {search === "" ? (
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Most Searched
          </h3>
        ) : (
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Search Results
          </h3>
        )}

        <div className="mt-6 space-y-4 min-h-100">
          {filtered.length === 0 && search ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            filtered.map((res) => (
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

        {/* Pagination */}
        {filtered > 10 && (
          <div className="flex justify-center mt-8 space-x-2">
            {[1, 2, 3, "...", 10].map((num, i) => (
              <button
                key={i}
                aria-current={num === 1 ? "page" : undefined}
                className={`px-3 py-1 rounded-md text-sm ${
                  num === 1
                    ? "bg-blue-700 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {num}
              </button>
            ))}
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
                  if (selectedResource.fileUrl) {
                    window.open(selectedResource.fileUrl, '_blank');
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
                    const link = document.createElement('a');
                    link.href = selectedResource.fileUrl;
                    link.download = selectedResource.resourceTitle + '.pdf'; // Assuming PDF, adjust as needed
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

      <Footer />
    </div>
  );
}
