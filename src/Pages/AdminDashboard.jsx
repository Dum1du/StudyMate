import React, { useState, useEffect } from "react";
import { Users, FileText, Video, LayoutDashboard, LogOut, Trash2, Eye, Search, ChevronLeft, ChevronRight, Bell, CheckCircle, X, Home, Menu, Flag, Ban, Unlock } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  collectionGroup, 
  getDocs, 
  doc, 
  deleteDoc, 
  getCountFromServer,
  updateDoc,
  writeBatch,
  serverTimestamp,
  query,
  limit,
  startAfter,
  onSnapshot,
  orderBy 
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import AlertModal from "../AlertModal";
import axios from "axios";

const SearchBar = ({ placeholder, searchTerm, setSearchTerm }) => (
  <div className="mb-4 relative flex-shrink-0">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm sm:text-base"
    />
  </div>
);

const PaginationControls = ({ totalPages, totalCount, currentPage, handlePrevPage, handleNextPage, hasNextPage }) => {
  if (totalCount === 0) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 gap-3 sm:gap-0">
      <p className="text-xs sm:text-sm text-gray-500">
        Total Items: <span className="font-medium">{totalCount}</span>
      </p>
      <div className="flex gap-2 items-center">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 1}
          className="p-1 sm:p-2 rounded bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs sm:text-sm text-gray-600 px-2 sm:px-3 py-1">Page {currentPage} of {totalPages || "?"}</span>
        <button 
          onClick={handleNextPage} 
          disabled={!hasNextPage}
          className="p-1 sm:p-2 rounded bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const navigate = useNavigate();

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  // --- BAN USER MODAL STATE ---
  const [banModal, setBanModal] = useState({ isOpen: false, user: null, timeValue: 1, timeUnit: "days" });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/logins");
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  }

  const [stats, setStats] = useState({ users: 0, materials: 0, kuppis: 0, reports: 0 });
  const [loadingStats, setLoadingStats] = useState(false);
  const itemsPerPage = 8;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [usersCursors, setUsersCursors] = useState([null]); 
  const [usersHasNext, setUsersHasNext] = useState(false);

  const [materialsList, setMaterialsList] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsPage, setMaterialsPage] = useState(1);
  const [materialsCursors, setMaterialsCursors] = useState([null]);
  const [materialsHasNext, setMaterialsHasNext] = useState(false);

  const [kuppiList, setKuppiList] = useState([]);
  const [loadingKuppis, setLoadingKuppis] = useState(false);
  const [kuppisPage, setKuppisPage] = useState(1);
  const [kuppisCursors, setKuppisCursors] = useState([null]);
  const [kuppisHasNext, setKuppisHasNext] = useState(false);

  const [noticesList, setNoticesList] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [viewNotice, setViewNotice] = useState(null);

  const [reportsList, setReportsList] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    setSearchTerm("");
    setSearchResults([]);
  }, [activeTab]);

  useEffect(() => {
    const fetchStats = async () => {
      if (activeTab !== "dashboard") return;
      setLoadingStats(true);
      try {
        const userCount = await getCountFromServer(collection(db, "users"));
        const materialCount = await getCountFromServer(collectionGroup(db, "Materials"));
        const kuppiCount = await getCountFromServer(collection(db, "sessions")); 
        const reportCount = await getCountFromServer(collection(db, "reportedMaterials"));
        setStats({
          users: userCount.data().count,
          materials: materialCount.data().count,
          kuppis: kuppiCount.data().count,
          reports: reportCount.data().count
        });
      } catch (error) { console.error("Error fetching stats:", error); } 
      finally { setLoadingStats(false); }
    };
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      let q;
      let searchKeys = [];

      if (activeTab === "users") {
        q = query(collection(db, "users"));
        searchKeys = ['displayName', 'email', 'faculty', 'role'];
      } else if (activeTab === "materials") {
        q = query(collectionGroup(db, "Materials"));
        searchKeys = ['resourceTitle', 'courseCode', 'courseSubject', 'displayName'];
      } else if (activeTab === "kuppi") {
        q = query(collection(db, "sessions"));
        searchKeys = ['title', 'host'];
      } else {
        setIsSearching(false);
        return;
      }

      try {
        const snap = await getDocs(q);
        const allDocs = snap.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() }));
        
        const term = searchTerm.toLowerCase();
        const filtered = allDocs.filter(item => {
          return searchKeys.some(key => {
            const val = item[key];
            return val && String(val).toLowerCase().includes(term);
          });
        });
        
        setSearchResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500); 

    return () => clearTimeout(handler);
  }, [searchTerm, activeTab]);

  const loadUsersPage = async (pageIndex) => {
    setLoadingUsers(true);
    try {
      let q = query(collection(db, "users"), limit(itemsPerPage));
      if (usersCursors[pageIndex - 1]) {
        q = query(collection(db, "users"), startAfter(usersCursors[pageIndex - 1]), limit(itemsPerPage));
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs;
      setUsersList(docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (docs.length === itemsPerPage) {
        setUsersHasNext(true);
        const newCursors = [...usersCursors];
        newCursors[pageIndex] = docs[docs.length - 1];
        setUsersCursors(newCursors);
      } else {
        setUsersHasNext(false);
      }
      setUsersPage(pageIndex);
    } catch (error) { console.error("Error loading users:", error); } 
    finally { setLoadingUsers(false); }
  };

  const loadMaterialsPage = async (pageIndex) => {
    setLoadingMaterials(true);
    try {
      let q = query(collectionGroup(db, "Materials"), orderBy("createdAt", "desc"), limit(itemsPerPage));
      if (materialsCursors[pageIndex - 1]) {
        q = query(collectionGroup(db, "Materials"), orderBy("createdAt", "desc"), startAfter(materialsCursors[pageIndex - 1]), limit(itemsPerPage));
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs;
      setMaterialsList(docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() })));

      if (docs.length === itemsPerPage) {
        setMaterialsHasNext(true);
        const newCursors = [...materialsCursors];
        newCursors[pageIndex] = docs[docs.length - 1];
        setMaterialsCursors(newCursors);
      } else {
        setMaterialsHasNext(false);
      }
      setMaterialsPage(pageIndex);
    } catch (error) { console.error("Error loading materials:", error); } 
    finally { setLoadingMaterials(false); }
  };

  const loadKuppisPage = async (pageIndex) => {
    setLoadingKuppis(true);
    try {
      let q = query(collection(db, "sessions"), limit(itemsPerPage));
      if (kuppisCursors[pageIndex - 1]) {
        q = query(collection(db, "sessions"), startAfter(kuppisCursors[pageIndex - 1]), limit(itemsPerPage));
      }
      
      const snap = await getDocs(q);
      const docs = snap.docs;
      setKuppiList(docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (docs.length === itemsPerPage) {
        setKuppisHasNext(true);
        const newCursors = [...kuppisCursors];
        newCursors[pageIndex] = docs[docs.length - 1];
        setKuppisCursors(newCursors);
      } else {
        setKuppisHasNext(false);
      }
      setKuppisPage(pageIndex);
    } catch (error) { console.error("Error loading sessions:", error); } 
    finally { setLoadingKuppis(false); }
  };

  useEffect(() => {
    if (activeTab === "users" && usersList.length === 0) loadUsersPage(1);
    if (activeTab === "materials" && materialsList.length === 0) loadMaterialsPage(1);
    if (activeTab === "kuppi" && kuppiList.length === 0) loadKuppisPage(1);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "notices") return;
    setLoadingNotices(true);
    
    const unsubscribe = onSnapshot(collection(db, "notices"), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setNoticesList(fetched);
      setLoadingNotices(false);
    }, (error) => {
      console.error("Error fetching notices:", error);
      setLoadingNotices(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "reports") return;
    setLoadingReports(true);
    
    const unsubscribe = onSnapshot(collection(db, "reportedMaterials"), (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setReportsList(fetched);
      setLoadingReports(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoadingReports(false);
    });

    return () => unsubscribe();
  }, [activeTab]);


  // --- USER BANNING LOGIC ---
  const confirmBanUser = async () => {
    try {
      let bannedUntil = new Date();
      if (banModal.timeUnit === "hours") {
        bannedUntil.setHours(bannedUntil.getHours() + Number(banModal.timeValue));
      } else if (banModal.timeUnit === "days") {
        bannedUntil.setDate(bannedUntil.getDate() + Number(banModal.timeValue));
      } else if (banModal.timeUnit === "permanent") {
        bannedUntil = new Date("2099-12-31"); // Far future date for permanent ban
      }

      await updateDoc(doc(db, "users", banModal.user.id), {
        bannedUntil: bannedUntil
      });

      // Update local state immediately
      setUsersList(usersList.map(u => u.id === banModal.user.id ? { ...u, bannedUntil } : u));
      setSearchResults(searchResults.map(u => u.id === banModal.user.id ? { ...u, bannedUntil } : u));

      setBanModal({ isOpen: false, user: null, timeValue: 1, timeUnit: "days" });
      setAlertConfig({ isOpen: true, title: "User Banned", message: "User has been banned and will be forcefully logged out.", type: "success" });
    } catch (error) {
      console.error("Error banning user:", error);
      setAlertConfig({ isOpen: true, title: "Error", message: "Failed to ban the user.", type: "error" });
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        bannedUntil: null
      });

      // Update local state immediately
      setUsersList(usersList.map(u => u.id === userId ? { ...u, bannedUntil: null } : u));
      setSearchResults(searchResults.map(u => u.id === userId ? { ...u, bannedUntil: null } : u));
      
      setAlertConfig({ isOpen: true, title: "User Unbanned", message: "User access has been restored.", type: "success" });
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  };


  const handleDeleteUser = (userId, userName) => {
    setAlertConfig({
      isOpen: true,
      title: "Confirm Deletion",
      message: `Are you sure you want to permanently delete ${userName || "this user"}?`,
      type: "warning",
      onConfirm: async () => {
        closeAlert(); 
        try {
          await deleteDoc(doc(db, "users", userId));
          setUsersList(usersList.filter(user => user.id !== userId));
          setSearchResults(prev => prev.filter(user => user.id !== userId)); 
        } catch (error) { console.error("Error:", error); }
      }
    });
  };

  const handleDeleteMaterial = (material) => {
    const diptId = material.courseCode ? material.courseCode.slice(0, 3).toUpperCase() : "";

    setAlertConfig({
      isOpen: true,
      title: "Delete Material",
      message: `Are you sure you want to delete "${material.resourceTitle}"? This will permanently delete the file from Google Drive as well.`,
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          const token = await auth.currentUser.getIdToken();
          await axios.delete(`http://localhost:4000/delete-upload/${material.id}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { diptId }
          });

          await deleteDoc(doc(db, "discussions", material.id));

          setMaterialsList(materialsList.filter(m => m.id !== material.id));
          setSearchResults(prev => prev.filter(m => m.id !== material.id)); 
          
          setAlertConfig({ isOpen: true, title: "Success", message: "Material deleted successfully.", type: "success" });
        } catch (error) { 
          console.error("Error deleting material:", error); 
          setAlertConfig({ isOpen: true, title: "Error", message: "Failed to delete the material.", type: "error" });
        }
      }
    });
  };

  const handleDeleteKuppi = (sessionId, sessionTitle) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Session",
      message: `Are you sure you want to delete the session "${sessionTitle}"?`,
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteDoc(doc(db, "sessions", sessionId));
          setKuppiList(kuppiList.filter(session => session.id !== sessionId));
          setSearchResults(prev => prev.filter(session => session.id !== sessionId)); 
        } catch (error) { console.error("Error:", error); }
      }
    });
  };

  const handleDeleteNotice = (notice) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Notice",
      message: "Are you sure you want to delete this notice permanently? The author will be notified.",
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteDoc(doc(db, "notices", notice.id));

          if (notice.authorId && notice.authorId !== "Anonymous") {
            const timestamp = serverTimestamp();
            const batch = writeBatch(db);
            const mainNotifRef = doc(collection(db, "notifications"));

            batch.set(mainNotifRef, {
              title: "Notice Deleted",
              message: `Your notice "${notice.title}" was deleted by an administrator.`,
              createdAt: timestamp,
              type: "notice", 
              targetId: null
            });

            const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", notice.authorId);
            
            batch.set(userNotifRef, {
              userId: notice.authorId,
              message: `Your notice "${notice.title}" was deleted by an administrator.`,
              read: false,
              createdAt: timestamp,
              type: "notice",
              targetId: null
            });

            await batch.commit();
          }

        } catch (error) { console.error("Error deleting notice:", error); }
      }
    });
  };

  const handleDismissReport = (reportId) => {
    setAlertConfig({
      isOpen: true,
      title: "Dismiss Report",
      message: "Are you sure you want to dismiss this report? The material will not be deleted.",
      type: "info",
      onConfirm: async () => {
        closeAlert();
        try {
          await deleteDoc(doc(db, "reportedMaterials", reportId));
        } catch (error) { console.error("Error dismissing report:", error); }
      }
    });
  };

  const handleDeleteReportedMaterial = (report) => {
    setAlertConfig({
      isOpen: true,
      title: "Delete Reported Material",
      message: `Are you sure you want to delete the material "${report.resourceTitle}"? This will permanently delete the file from Google Drive and close the report.`,
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        try {
          const token = await auth.currentUser.getIdToken();
          
          await axios.delete(`http://localhost:4000/delete-upload/${report.materialId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { diptId: report.deptId }
          });
          
          await deleteDoc(doc(db, "discussions", report.materialId));

          if (report.uploaderUid) {
            const batch = writeBatch(db);
            const mainNotifRef = doc(collection(db, "notifications"));
            const message = `Your material "${report.resourceTitle}" was deleted by an administrator. Reason: ${report.reason}`;
            
            batch.set(mainNotifRef, {
              title: "Material Deleted",
              message: message,
              createdAt: serverTimestamp(),
              type: "alert",
              targetId: null
            });

            const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", report.uploaderUid);
            batch.set(userNotifRef, {
              userId: report.uploaderUid,
              message: message,
              read: false,
              createdAt: serverTimestamp(),
              type: "alert",
              targetId: null
            });

            await batch.commit();
          }

          await deleteDoc(doc(db, "reportedMaterials", report.id));
          
          setReportsList(reportsList.filter(r => r.id !== report.id));
          setAlertConfig({ isOpen: true, title: "Success", message: "Reported material successfully removed and uploader notified.", type: "success" });

        } catch (error) { 
          console.error("Error deleting reported material:", error); 
          if(error.response?.status === 404) {
             await deleteDoc(doc(db, "discussions", report.materialId));
             await deleteDoc(doc(db, "reportedMaterials", report.id));
             setReportsList(reportsList.filter(r => r.id !== report.id));
             setAlertConfig({ isOpen: true, title: "Cleaned Up", message: "File was already missing. Report has been closed.", type: "info" });
          } else {
             setAlertConfig({ isOpen: true, title: "Error", message: "Failed to delete the reported material.", type: "error" });
          }
        }
      }
    });
  };

  const notifyAllUsers = async (noticeTitle, noticeId) => {
    try {
      const message = `New Notice: ${noticeTitle}`;
      const timestamp = serverTimestamp();

      let batch = writeBatch(db);
      let count = 0;

      const mainNotifRef = doc(collection(db, "notifications"));
      batch.set(mainNotifRef, {
        title: "Notice Approval",
        message: message,
        createdAt: timestamp,
        type: "notice",
        targetId: noticeId
      });
      count++;

      const usersSnap = await getDocs(collection(db, "users"));

      usersSnap.forEach((userDoc) => {
        const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", userDoc.id);
        
        batch.set(userNotifRef, {
          userId: userDoc.id,
          message: message, 
          read: false,
          createdAt: timestamp,
          type: "notice",
          targetId: noticeId
        });

        count++;
        if (count >= 490) {
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });

      if (count > 0) {
        await batch.commit();
      }
    } catch (error) {
      console.error("Error broadcasting notifications:", error);
    }
  };

  const handleApproveNotice = async (noticeId) => {
    try {
      await updateDoc(doc(db, "notices", noticeId), { status: "approved" });
      
      const approvedNotice = noticesList.find(n => n.id === noticeId);
      const noticeTitle = approvedNotice ? approvedNotice.title : "Check the Notice Board";
      
      setAlertConfig({
        isOpen: true,
        title: "Success!",
        message: "Notice Approved and Published successfully.",
        type: "success",
        onConfirm: null 
      });

      notifyAllUsers(noticeTitle, noticeId);

    } catch (error) {
      console.error("Error approving notice:", error);
      setAlertConfig({
        isOpen: true,
        title: "Error",
        message: "Failed to approve the notice. Please try again.",
        type: "error",
        onConfirm: null
      });
    }
  };

  const displayUsers = searchTerm ? searchResults : usersList;
  const displayMaterials = searchTerm ? searchResults : materialsList;
  const displayKuppis = searchTerm ? searchResults : kuppiList;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-blue-400">StudyMate Admin</h1>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {["dashboard", "users", "materials", "kuppi", "notices", "reports"].map((tab) => (
            <button 
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg capitalize transition-colors ${activeTab === tab ? "bg-blue-600" : "hover:bg-gray-800"}`}
            >
              {tab === "dashboard" && <LayoutDashboard size={20} />}
              {tab === "users" && <Users size={20} />}
              {tab === "materials" && <FileText size={20} />}
              {tab === "kuppi" && <Video size={20} />}
              {tab === "notices" && <Bell size={20} />}
              {tab === "reports" && <Flag size={20} />}
              {tab === "dashboard" ? "Overview" : tab === "kuppi" ? "Kuppi Sessions" : `Manage ${tab}`}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button onClick={() => navigate("/home")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300">
            <Home size={20} /> User Dashboard
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400">
            <LogOut size={20} /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm p-4 md:p-6 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden text-gray-600 hover:text-gray-900 transition focus:outline-none" 
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 capitalize truncate">{activeTab.replace('-', ' ')}</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
               <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.users}</p>
               </div>
               <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Total Materials</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.materials}</p>
               </div>
               <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Active Kuppis</h3>
                  <p className="text-2xl md:text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.kuppis}</p>
               </div>
               <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-red-100">
                  <h3 className="text-red-500 text-sm font-medium">Active Reports</h3>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 mt-2">{loadingStats ? "..." : stats.reports}</p>
               </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search all users..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingUsers || isSearching ? (
                  <div className="p-8 text-center text-gray-500 text-sm md:text-base">
                    {isSearching ? "Searching entire database..." : "Loading users..."}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider border-b">
                            <th className="p-3 md:p-4 font-medium">User Details</th>
                            <th className="p-3 md:p-4 font-medium">Contact</th>
                            <th className="p-3 md:p-4 font-medium">Role</th>
                            <th className="p-3 md:p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {displayUsers.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm md:text-base">No users found.</td></tr>
                          ) : (
                            displayUsers.map((user) => {
                              // CHECK IF BANNED
                              const banDateObj = user.bannedUntil ? (user.bannedUntil.toDate ? user.bannedUntil.toDate() : new Date(user.bannedUntil)) : null;
                              const isCurrentlyBanned = banDateObj && banDateObj > new Date();

                              return (
                                <tr key={user.id} className={`transition-colors ${isCurrentlyBanned ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                                  <td className="p-3 md:p-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                      <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=EBF4FF&color=1E3A8A`} alt="avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shrink-0" />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm md:text-base truncate flex items-center gap-2">
                                          {user.displayName || "No Name Set"}
                                          {isCurrentlyBanned && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Banned</span>}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-500 truncate">{user.faculty || "No Faculty"} • {user.program || "No Program"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-3 md:p-4">
                                    <p className="text-xs md:text-sm text-gray-800 truncate max-w-[120px] sm:max-w-none">{user.email}</p>
                                  </td>
                                  <td className="p-3 md:p-4">
                                    <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                      {user.role || 'student'}
                                    </span>
                                  </td>
                                  <td className="p-3 md:p-4 flex justify-center gap-2">
                                    {/* --- BAN / UNBAN BUTTONS --- */}
                                    {isCurrentlyBanned ? (
                                      <button onClick={() => handleUnbanUser(user.id)} className="p-1.5 md:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Unban User">
                                        <Unlock size={16} className="md:w-[18px] md:h-[18px]" />
                                      </button>
                                    ) : (
                                      <button onClick={() => setBanModal({ isOpen: true, user: user, timeValue: 1, timeUnit: "days" })} className="p-1.5 md:p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Ban User">
                                        <Ban size={16} className="md:w-[18px] md:h-[18px]" />
                                      </button>
                                    )}

                                    <button onClick={() => handleDeleteUser(user.id, user.displayName)} className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                      <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!searchTerm && (
                      <PaginationControls 
                        totalPages={Math.ceil(stats.users / itemsPerPage)} 
                        totalCount={stats.users}
                        currentPage={usersPage}
                        hasNextPage={usersHasNext}
                        handlePrevPage={() => loadUsersPage(usersPage - 1)}
                        handleNextPage={() => loadUsersPage(usersPage + 1)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search all materials..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingMaterials || isSearching ? (
                  <div className="p-8 text-center text-gray-500 text-sm md:text-base">
                    {isSearching ? "Searching entire database..." : "Loading materials..."}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider border-b">
                            <th className="p-3 md:p-4 font-medium">Resource Title</th>
                            <th className="p-3 md:p-4 font-medium">Course / Subject</th>
                            <th className="p-3 md:p-4 font-medium">Uploaded By</th>
                            <th className="p-3 md:p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {displayMaterials.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm md:text-base">No materials found.</td></tr>
                          ) : (
                            displayMaterials.map((material) => (
                              <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 md:p-4 max-w-[200px]">
                                  <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{material.resourceTitle || "Untitled Resource"}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500 truncate">{material.description || "No description"}</p>
                                </td>
                                <td className="p-3 md:p-4">
                                  <p className="text-xs md:text-sm text-gray-800 font-medium">{material.courseCode || "N/A"}</p>
                                  <p className="text-[10px] md:text-xs text-gray-500 truncate max-w-[150px]">{material.courseSubject || "N/A"}</p>
                                </td>
                                <td className="p-3 md:p-4">
                                  <p className="text-xs md:text-sm text-gray-800 truncate max-w-[120px]">{material.displayName || "Unknown User"}</p>
                                </td>
                                <td className="p-3 md:p-4 flex justify-center gap-1 md:gap-2">
                                  {material.fileLink && (
                                    <a href={material.fileLink} target="_blank" rel="noopener noreferrer" className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Material">
                                      <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                                    </a>
                                  )}
                                  <button onClick={() => handleDeleteMaterial(material)} className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Material">
                                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!searchTerm && (
                      <PaginationControls 
                        totalPages={Math.ceil(stats.materials / itemsPerPage)} 
                        totalCount={stats.materials}
                        currentPage={materialsPage}
                        hasNextPage={materialsHasNext}
                        handlePrevPage={() => loadMaterialsPage(materialsPage - 1)}
                        handleNextPage={() => loadMaterialsPage(materialsPage + 1)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "kuppi" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search all active sessions..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingKuppis || isSearching ? (
                  <div className="p-8 text-center text-gray-500 text-sm md:text-base">
                    {isSearching ? "Searching entire database..." : "Loading sessions..."}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider border-b">
                            <th className="p-3 md:p-4 font-medium">Session Topic</th>
                            <th className="p-3 md:p-4 font-medium">Host</th>
                            <th className="p-3 md:p-4 font-medium">Date & Time</th>
                            <th className="p-3 md:p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {displayKuppis.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm md:text-base">No active sessions found.</td></tr>
                          ) : (
                            displayKuppis.map((session) => (
                              <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 md:p-4">
                                  <p className="font-semibold text-gray-800 text-sm md:text-base">{session.title || "Untitled Session"}</p>
                                  {session.link && (
                                    <a href={session.link} target="_blank" rel="noopener noreferrer" className="text-[10px] md:text-xs text-blue-500 hover:underline truncate inline-block max-w-[150px]">Join Link</a>
                                  )}
                                </td>
                                <td className="p-3 md:p-4">
                                  <p className="text-xs md:text-sm text-gray-800 truncate max-w-[100px]">{session.host || "Anonymous"}</p>
                                </td>
                                <td className="p-3 md:p-4">
                                  <p className="text-xs md:text-sm text-gray-800">{session.time ? session.time.replace("T", " ") : "Not set"}</p>
                                </td>
                                <td className="p-3 md:p-4 flex justify-center gap-2">
                                  <button onClick={() => handleDeleteKuppi(session.id, session.title)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Session">
                                    <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {!searchTerm && (
                      <PaginationControls 
                        totalPages={Math.ceil(stats.kuppis / itemsPerPage)} 
                        totalCount={stats.kuppis}
                        currentPage={kuppisPage}
                        hasNextPage={kuppisHasNext}
                        handlePrevPage={() => loadKuppisPage(kuppisPage - 1)}
                        handleNextPage={() => loadKuppisPage(kuppisPage + 1)}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "notices" && (
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingNotices ? (
                  <div className="p-8 text-center text-gray-500 text-sm md:text-base">Loading notices...</div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider border-b">
                          <th className="p-3 md:p-4 font-medium">Notice Title & Desc</th>
                          <th className="p-3 md:p-4 font-medium">Author</th>
                          <th className="p-3 md:p-4 font-medium">Status</th>
                          <th className="p-3 md:p-4 font-medium text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {noticesList.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm md:text-base">No notices found.</td></tr>
                        ) : (
                          noticesList.map((notice) => (
                            <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 md:p-4 max-w-[200px]">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{notice.title}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 truncate">{notice.description}</p>
                              </td>
                              <td className="p-3 md:p-4">
                                <p className="text-xs md:text-sm text-gray-800 truncate max-w-[120px]">{notice.authorName}</p>
                              </td>
                              <td className="p-3 md:p-4">
                                <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-semibold rounded-full ${
                                  notice.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {notice.status || 'pending'}
                                </span>
                              </td>
                              <td className="p-3 md:p-4 flex justify-center gap-1 md:gap-2">
                                <button 
                                  onClick={() => setViewNotice(notice)} 
                                  className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                  title="View Full Notice"
                                >
                                  <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                {notice.status !== "approved" && (
                                  <button 
                                    onClick={() => handleApproveNotice(notice.id)} 
                                    className="p-1.5 md:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                    title="Approve & Publish"
                                  >
                                    <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDeleteNotice(notice)} 
                                  className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Delete Notice Permanently"
                                >
                                  <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden flex flex-col">
                {loadingReports ? (
                  <div className="p-8 text-center text-gray-500 text-sm md:text-base">Loading reports...</div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-red-50 text-red-700 text-xs md:text-sm uppercase tracking-wider border-b border-red-100">
                          <th className="p-3 md:p-4 font-medium">Material Details</th>
                          <th className="p-3 md:p-4 font-medium">Reason</th>
                          <th className="p-3 md:p-4 font-medium">Reported By</th>
                          <th className="p-3 md:p-4 font-medium text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {reportsList.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-gray-500 text-sm md:text-base">No pending reports! 🎉</td></tr>
                        ) : (
                          reportsList.map((report) => (
                            <tr key={report.id} className="hover:bg-red-50/50 transition-colors">
                              <td className="p-3 md:p-4 max-w-[200px]">
                                <p className="font-semibold text-gray-800 text-sm md:text-base truncate">{report.resourceTitle}</p>
                                <p className="text-[10px] md:text-xs text-gray-500 truncate">{report.courseCode}</p>
                              </td>
                              <td className="p-3 md:p-4">
                                <p className="text-xs md:text-sm text-red-600 font-medium line-clamp-2 max-w-xs">{report.reason}</p>
                              </td>
                              <td className="p-3 md:p-4">
                                <p className="text-xs md:text-sm text-gray-800 truncate max-w-[120px]">{report.reportedByName}</p>
                                <p className="text-[10px] text-gray-500 truncate">{report.reportedByEmail}</p>
                              </td>
                              <td className="p-3 md:p-4 flex justify-center gap-1 md:gap-2 items-center">
                                <button 
                                  onClick={() => navigate(`/material/${report.materialId}`)} 
                                  className="p-1.5 md:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                  title="View Material"
                                >
                                  <Eye size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteReportedMaterial(report)} 
                                  className="p-1.5 md:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Delete Material & Close Report"
                                >
                                  <Trash2 size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>

                                <button 
                                  onClick={() => handleDismissReport(report.id)} 
                                  className="p-1.5 md:p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                  title="Dismiss Report"
                                >
                                  <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BAN USER MODAL */}
      {banModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setBanModal({ isOpen: false, user: null, timeValue: 1, timeUnit: "days" })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-2 text-gray-800 flex items-center gap-2">
              <Ban className="text-orange-500" /> Ban User
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Suspend <span className="font-bold text-gray-800">{banModal.user?.displayName || "this user"}</span> from logging in.
            </p>

            <div className="flex gap-3 mb-6">
              <input 
                type="number" 
                min="1"
                value={banModal.timeValue}
                onChange={(e) => setBanModal({...banModal, timeValue: e.target.value})}
                disabled={banModal.timeUnit === "permanent"}
                className="w-1/3 border border-gray-300 rounded-lg p-2 text-center outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <select 
                value={banModal.timeUnit}
                onChange={(e) => setBanModal({...banModal, timeUnit: e.target.value})}
                className="w-2/3 border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="permanent">Permanent</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setBanModal({ isOpen: false, user: null, timeValue: 1, timeUnit: "days" })}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmBanUser}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition shadow-sm font-medium text-sm flex items-center gap-2"
              >
                <Ban size={16} /> Enforce Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {viewNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 md:p-6 max-w-lg w-full shadow-xl relative transform transition-all animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setViewNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-bold mb-2 text-gray-800 pr-8 break-words leading-tight shrink-0">
              {viewNotice.title}
            </h2>
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <span className={`px-2 py-0.5 text-[10px] md:text-xs font-semibold rounded-full ${
                viewNotice.status === 'approved' ? 'bg-green-100 text-green-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {viewNotice.status || 'pending'}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 font-medium">
                By {viewNotice.authorName}
              </span>
            </div>
            <div className="bg-gray-50 p-3 md:p-4 rounded-xl overflow-y-auto border border-gray-100 shadow-inner flex-1">
              <p className="text-gray-700 text-xs md:text-sm whitespace-pre-wrap break-words leading-relaxed">
                {viewNotice.description}
              </p>
            </div>
            <div className="mt-5 md:mt-6 flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setViewNotice(null)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition"
              >
                Close
              </button>
              {viewNotice.status !== "approved" && (
                <button
                  onClick={() => {
                    handleApproveNotice(viewNotice.id);
                    setViewNotice({ ...viewNotice, status: "approved" }); 
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition shadow-sm flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Approve Now
                </button>
              )}
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
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}