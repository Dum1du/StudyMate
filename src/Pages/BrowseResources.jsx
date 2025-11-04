import React, { useState, useEffect, useMemo } from "react";
import { Search, Star } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import Navbar from "../NavigationBar";
import Fuse from "fuse.js";
import SearchBar from "../searchbar";
import { collectionGroup, getDocs } from "firebase/firestore";

export default function BrowseResources() {
  const [search, setSearch] = useState("");
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [marginTop, setMarginTop] = useState(36 * 4);

  // ✅ Fetch all materials once
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
    }, ); // delay before transition starts (optional)

    return () => clearTimeout(timer);
  }, []);

    // ✅ Fuse.js setup (only rebuild when resources change)
  const fuse = useMemo(() => {
    return new Fuse(resources, {
      keys: ["resourceTitle", "description", "tags", "courseSubject", "courseCode"],
      threshold: 0.4, // smaller = more accurate match

      getFn: (item, path) => {
      const value = item[path];
      if (Array.isArray(value)) return value.map(v => v.trim());
      return value;
    }
    });
  }, [resources]);

  // ✅ Debounce search input
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse Resources</h2>
        <p className="text-gray-600 mb-6">Find the study materials you need to succeed.</p>

        {/* Search bar */}
        <div style={{
        marginTop: `${marginTop}px`,
        marginBottom: "2rem", // Tailwind mb-8 = 2rem
        transition: "margin-top 0.5s ease-in-out",
      }}>
        <SearchBar placeholder="Search for lecture notes, past papers, etc."
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
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Most Searched</h3>):(
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Search Results</h3>)

}

        <div className="mt-6 space-y-4 min-h-100">
          {filtered.length === 0 && search ? (
            <p className="text-gray-500 italic">No matching resources found.</p>
          ) : (
            filtered.map((res) => (
              <div
                key={res.id}
                className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition"
              >
                <h4 className="font-semibold">{res.resourceTitle}</h4>
                <p className="text-sm text-gray-700 mb-1">{res.description}</p>
                <p className="text-xs text-gray-500">
                  Uploaded by: {res.displayName || res.uploaderEmail}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        { filtered > 10 && (
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
        </div>)
}
      </main>
    </div>
  );
}
