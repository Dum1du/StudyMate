import React, { useState, useEffect } from "react";
import { collectionGroup, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaFolderOpen } from "react-icons/fa";
import { Eye, Download, X, ShieldCheck, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import AlertModal from "../AlertModal";

// Preview Card Component
const PreviewCard = ({ title, subtitle, fileLink, onClick }) => {
  const previewUrl = fileLink ? fileLink.replace(/\/view.*|\/edit.*/, "/preview") : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-64 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
    >
      <div className="h-3/5 bg-gray-100 relative overflow-hidden border-b border-gray-200">
        {previewUrl ? (
          <>
            <iframe
              src={previewUrl}
              className="w-full h-[200%] transform origin-top border-0 pointer-events-none opacity-90"
              title={`${title} preview`}
            />
            <div className="absolute inset-0 bg-transparent z-10 hover:bg-black/5 transition-colors"></div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <FaFolderOpen size={30} className="mb-2 text-gray-300" />
            <span className="text-xs">No Preview</span>
          </div>
        )}
      </div>

      <div className="p-4 h-2/5 flex flex-col justify-center bg-white relative">
        <ShieldCheck className="absolute top-4 right-4 text-green-500" size={18} />
        <h3 className="font-bold text-gray-800 truncate text-sm sm:text-base pr-6">{title || "Untitled"}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-snug">
          {subtitle || "No description available."}
        </p>
      </div>
    </div>
  );
};

export default function ApprovedResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);

  // Pagination State
  const itemsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState([null]);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const loadPage = async (pageIndex) => {
    setLoading(true);
    try {
      let q = query(
        collectionGroup(db, "Materials"),
        where("isApproved", "==", true),
        orderBy("createdAt", "desc"),
        limit(itemsPerPage)
      );

      // If we are not on page 1, start after the correct cursor
      if (cursors[pageIndex - 1]) {
        q = query(
          collectionGroup(db, "Materials"),
          where("isApproved", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(cursors[pageIndex - 1]),
          limit(itemsPerPage)
        );
      }

      const snapshot = await getDocs(q);
      const fetchedDocs = snapshot.docs;

      setResources(fetchedDocs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Determine if there is a "Next" page
      if (fetchedDocs.length === itemsPerPage) {
        setHasNextPage(true);
        const newCursors = [...cursors];
        newCursors[pageIndex] = fetchedDocs[fetchedDocs.length - 1];
        setCursors(newCursors);
      } else {
        setHasNextPage(false);
      }

      setCurrentPage(pageIndex);
    } catch (error) {
      console.error("Pagination Error:", error);
      
      // Handle Firebase Indexing Requirement
      if (error.message.includes("index")) {
        setAlertConfig({
          isOpen: true,
          title: "Database Setup Required",
          message: "Firebase requires a composite index to paginate this view. Please open the browser console, click the link provided by Firebase, and wait for the index to build.",
          type: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* FIXED: Added 'flex flex-col' so 'mt-auto' on pagination works correctly */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 mt-4 flex flex-col">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white rounded-full border border-gray-300 shadow-sm hover:bg-gray-100 transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                Approved Materials <ShieldCheck className="text-green-500" size={28} />
              </h1>
              <p className="text-gray-500 text-sm mt-1">Resources officially verified by teachers.</p>
            </div>
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
             {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
             ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-300 rounded-2xl">
            <ShieldCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No approved materials found on this page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {resources.map((res, idx) => (
              <PreviewCard
                key={res.id || idx}
                title={res.resourceTitle}
                subtitle={res.description}
                fileLink={res.fileLink || res.fileUrl}
                onClick={() => setSelectedResource(res)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {/* FIXED: Hides completely if on page 1 with no next page, and uses mt-auto to push to bottom */}
        {!loading && (currentPage > 1 || hasNextPage) && (
          <div className="flex items-center justify-center mt-auto pt-12 pb-4 gap-4">
            <button 
              onClick={() => loadPage(currentPage - 1)} 
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 shadow-sm disabled:opacity-50 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              <ChevronLeft size={18} /> Prev
            </button>
            
            <span className="text-gray-600 font-semibold px-4 py-2 bg-gray-200 rounded-lg">
              Page {currentPage}
            </span>
            
            <button 
              onClick={() => loadPage(currentPage + 1)} 
              disabled={!hasNextPage}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-300 shadow-sm disabled:opacity-50 hover:bg-gray-50 transition font-medium text-gray-700"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}
      </main>

      {/* Resource Details Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full shadow-xl relative transform transition-all duration-300 scale-100 hover:scale-[1.02]">
            <button
              onClick={() => setSelectedResource(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors z-20"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 pr-8 flex items-center gap-2">
              {selectedResource.resourceTitle || selectedResource.title}
              <ShieldCheck className="text-green-500" size={20}/>
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {selectedResource.description || selectedResource.subtitle}
            </p>

            <div className="w-full h-[50vh] min-h-[300px] border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 mb-6 overflow-hidden">
              {selectedResource.fileLink || selectedResource.fileUrl ? (
                <iframe
                  src={(selectedResource.fileLink || selectedResource.fileUrl).replace(
                    /\/view.*|\/edit.*/,
                    "/preview"
                  )}
                  className="w-full h-full border-0"
                  title="PDF Preview Full"
                />
              ) : (
                <p>No Preview Available</p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const link = selectedResource.fileLink || selectedResource.fileUrl;
                  if (link) {
                    window.open(link, "_blank");
                  } else {
                    setAlertConfig({ isOpen: true, title: "Link Not Found", message: "No URL available for this resource.", type: "warning" });
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold flex-1 transition-colors"
              >
                <Eye size={18} /> Open in New Tab
              </button>
              
              <button
                onClick={() => navigate(`/material/${selectedResource.id}`, { state: { resource: selectedResource } })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold flex-1 transition-colors"
              >
                View Full Page
              </button>

              <button
                onClick={() => {
                  if (selectedResource.fileId) {
                    const downloadUrl = `https://drive.google.com/uc?export=download&id=${selectedResource.fileId}`;
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = (selectedResource.resourceTitle || "Resource") + ".pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    setAlertConfig({ isOpen: true, title: "Download Unavailable", message: "No download link available.", type: "warning" });
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold flex-1 transition-colors"
              >
                <Download size={18} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </div>
  );
}