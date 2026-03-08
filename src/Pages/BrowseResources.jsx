import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react"; 
import { auth, db } from "../firebase";
import Navbar from "../NavigationBar";
import Fuse from "fuse.js";
import SearchBar from "../searchbar";
import { collectionGroup, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";
import Footer from "../Footer";
import { useNavigate } from "react-router";
import AlertModal from "../AlertModal"; 

export default function BrowseResources() {
  const navigate = useNavigate();

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]); // Used only during active search
  const [isSearching, setIsSearching] = useState(false);
  const [marginTop, setMarginTop] = useState(36 * 4);

  // --- PAGINATION STATES (For default browsing) ---
  const [browseList, setBrowseList] = useState([]);
  const [loadingBrowse, setLoadingBrowse] = useState(true);
  const [browsePage, setBrowsePage] = useState(1);
  const [browseCursors, setBrowseCursors] = useState([null]); // Cursor history
  const [browseHasNext, setBrowseHasNext] = useState(false);
  const itemsPerPage = 7;

  // --- ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const navigateTo = (res) =>{
    if (res.id) {
      navigate(`/resourcewindow/${res.id}`, { state: { resource: res } }); // Make sure this path matches your App.jsx!
    }
  }

  // Animation for search bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setMarginTop(10 * 4); 
    }); 
    return () => clearTimeout(timer);
  }, []);

  // --- 1. DEFAULT PAGINATED FETCH ---
  // This replaces the context so we can load 7 at a time securely from Firestore
  const loadBrowsePage = async (pageIndex) => {
    setLoadingBrowse(true);
    try {
      let q = query(collectionGroup(db, "Materials"), orderBy("createdAt", "desc"), limit(itemsPerPage));
      
      if (browseCursors[pageIndex - 1]) {
        q = query(
          collectionGroup(db, "Materials"), 
          orderBy("createdAt", "desc"), 
          startAfter(browseCursors[pageIndex - 1]), 
          limit(itemsPerPage)
        );
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs;
      setBrowseList(docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (docs.length === itemsPerPage) {
        setBrowseHasNext(true);
        const newCursors = [...browseCursors];
        newCursors[pageIndex] = docs[docs.length - 1]; // Save cursor for next page
        setBrowseCursors(newCursors);
      } else {
        setBrowseHasNext(false);
      }
      setBrowsePage(pageIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { 
      console.error("Error loading resources:", error); 
      setAlertConfig({
        isOpen: true,
        title: "Connection Error",
        message: "Failed to load resources. Please check your connection.",
        type: "error"
      });
    } finally { 
      setLoadingBrowse(false); 
    }
  };

  // Load first page on mount
  useEffect(() => {
    if (search === "") {
      loadBrowsePage(1);
    }
  }, [search]);

  // --- 2. SEARCH LOGIC (FUSE.JS) ---
  // Only runs if the user actually types something
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!search.trim()) {
        setIsSearching(false);
        setFiltered([]);
        return;
      }
      
      setIsSearching(true);
      setLoadingBrowse(true);

      try {
        // NOTE: Downloading all docs for Fuse.js works for small databases, 
        // but as your app grows, you will want to move to Algolia or Typesense!
        const q = query(collectionGroup(db, "Materials"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const fullFuse = new Fuse(allDocs, {
          keys: ["resourceTitle", "description", "tags", "courseSubject", "courseCode"],
          threshold: 0.4,
        });

        const results = fullFuse.search(search).map(r => r.item);
        setFiltered(results);
      } catch(err) {
        console.error("Error searching resources:", err);
        setAlertConfig({
          isOpen: true,
          title: "Search Error",
          message: "Failed to search the database. Please try again.",
          type: "error"
        });
      } finally {
        setLoadingBrowse(false);
      }
    }, 500); // 500ms debounce to prevent spamming Firestore

    return () => clearTimeout(handler);
  }, [search]);


  // --- 3. DETERMINE WHAT TO DISPLAY ---
  // If searching, show all filtered results (client-side). If not, show paginated Firestore results.
  const displayItems = isSearching ? filtered : browseList;

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
              className="border border-gray-300 bg-white rounded-md px-4 py-1 text-sm hover:bg-gray-100 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Results Header */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {search === "" ? "Recent Resources" : "Search Results"} 
          {isSearching && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({displayItems.length} found)
            </span>
          )}
        </h3>

        {/* DATA LIST */}
        {loadingBrowse ? (
          <div className="mt-6 space-y-4 min-h-[400px] blur-sm animate-pulse">
            {[1,2,3,4].map((skeleton) => (
              <div key={skeleton} className="bg-green-100/50 p-4 rounded-lg shadow-sm h-24"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 space-y-4 min-h-[400px]">
              {displayItems.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 italic">No matching resources found.</p>
                </div>
              ) : (
                displayItems.map((res) => (
                  <div
                    key={res.id}
                    className="bg-green-100 p-4 rounded-lg shadow-sm hover:bg-green-200 transition cursor-pointer border border-green-200 hover:shadow-md"
                    onClick={() => navigateTo(res)}
                  >
                    <h4 className="font-bold text-gray-800">{res.resourceTitle || "Untitled"}</h4>
                    <p className="text-sm text-gray-700 mb-1 line-clamp-2">{res.description || "No description provided."}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Uploaded by: {res.displayName || res.uploaderEmail || "Unknown user"}
                      </p>
                      {res.courseCode && (
                        <span className="text-[10px] bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">
                          {res.courseCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FIRESTORE CURSOR PAGINATION (Only shows when NOT actively searching) */}
            {!isSearching && (browsePage > 1 || browseHasNext) && (
              <div className="flex justify-center items-center mt-8 space-x-4 bg-white p-3 rounded-xl border border-gray-200 w-fit mx-auto shadow-sm">
                <button
                  onClick={() => loadBrowsePage(browsePage - 1)}
                  disabled={browsePage === 1}
                  className="p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} className="text-gray-700" />
                </button>

                <span className="text-sm font-semibold text-gray-600 px-2">
                  Page {browsePage}
                </span>

                <button
                  onClick={() => loadBrowsePage(browsePage + 1)}
                  disabled={!browseHasNext}
                  className="p-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} className="text-gray-700" />
                </button>
              </div>
            )}
          </>
        )}
        
      </main>

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