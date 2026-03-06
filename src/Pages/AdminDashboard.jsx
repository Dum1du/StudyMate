import React, { useState, useEffect } from "react";
import { Users, FileText, Video, LayoutDashboard, LogOut, Trash2, Eye, Search, ChevronLeft, ChevronRight, Bell, CheckCircle, X } from "lucide-react";
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
  Timestamp
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";

// SearchBar
const SearchBar = ({ placeholder, searchTerm, setSearchTerm }) => (
  <div className="mb-4 relative flex-shrink-0">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <input 
      type="text" 
      placeholder={placeholder} 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
    />
  </div>
);

// PaginationControls
const PaginationControls = ({ totalPages, totalCount, currentPage, setCurrentPage, itemsPerPage }) => {
  if (totalCount === 0) return null;
  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
      </p>
      <div className="flex gap-2">
        <button 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
          className="p-1 rounded bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-600 px-3 py-1">Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-1 rounded bg-white border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT STARTS HERE ---
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/logins");
    } catch (error) {
      console.error("Error loggin out: ", error);
    }
  }

  // STATE: Dashboard Stats
  const [stats, setStats] = useState({ users: 0, materials: 0, kuppis: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // STATE: Data Lists
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [materialsList, setMaterialsList] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [kuppiList, setKuppiList] = useState([]);
  const [loadingKuppis, setLoadingKuppis] = useState(false);

  // STATE: Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; //how many rows per page

  const [noticesList, setNoticesList] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [viewNotice, setViewNotice] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      if (activeTab !== "notices") return;
      setLoadingNotices(true);
      try {
        const querySnapshot = await getDocs(collection(db, "notices"));
        setNoticesList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error:", error); } 
      finally { setLoadingNotices(false); }
    };
    fetchNotices();
  }, [activeTab]);

  // Reset search and page when switching tabs
  useEffect(() => {
    setSearchTerm("");
    setCurrentPage(1);
  }, [activeTab]);

  // Reset to page 1 when typing in search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    const fetchStats = async () => {
      if (activeTab !== "dashboard") return;
      setLoadingStats(true);
      try {
        const userCount = await getCountFromServer(collection(db, "users"));
        const materialCount = await getCountFromServer(collectionGroup(db, "Materials"));
        const kuppiCount = await getCountFromServer(collection(db, "sessions")); 
        setStats({
          users: userCount.data().count,
          materials: materialCount.data().count,
          kuppis: kuppiCount.data().count,
        });
      } catch (error) { console.error("Error fetching stats:", error); } 
      finally { setLoadingStats(false); }
    };
    fetchStats();
  }, [activeTab]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeTab !== "users") return;
      setLoadingUsers(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        setUsersList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error:", error); } 
      finally { setLoadingUsers(false); }
    };
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (activeTab !== "materials") return;
      setLoadingMaterials(true);
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "Materials"));
        setMaterialsList(querySnapshot.docs.map((doc) => ({ id: doc.id, ref: doc.ref, ...doc.data() })));
      } catch (error) { console.error("Error:", error); } 
      finally { setLoadingMaterials(false); }
    };
    fetchMaterials();
  }, [activeTab]);

  useEffect(() => {
    const fetchKuppis = async () => {
      if (activeTab !== "kuppi") return;
      setLoadingKuppis(true);
      try {
        const querySnapshot = await getDocs(collection(db, "sessions"));
        setKuppiList(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error:", error); } 
      finally { setLoadingKuppis(false); }
    };
    fetchKuppis();
  }, [activeTab]);

  // --- DELETE HANDLERS ---
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Remove ${userName || "this user"}?`)) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsersList(usersList.filter(user => user.id !== userId));
      } catch (error) { console.error("Error:", error); }
    }
  };

  const handleDeleteMaterial = async (material) => {
    if (window.confirm(`Delete "${material.resourceTitle}"?`)) {
      try {
        await deleteDoc(material.ref);
        setMaterialsList(materialsList.filter(m => m.id !== material.id));
      } catch (error) { console.error("Error:", error); }
    }
  };

  const handleDeleteKuppi = async (sessionId, sessionTitle) => {
    if (window.confirm(`Delete session "${sessionTitle}"?`)) {
      try {
        await deleteDoc(doc(db, "sessions", sessionId));
        setKuppiList(kuppiList.filter(session => session.id !== sessionId));
      } catch (error) { console.error("Error:", error); }
    }
  };

  // --- BROADCAST NOTIFICATION TO ALL USERS (STRUCTURED) ---
  const notifyAllUsers = async (noticeTitle, noticeId) => {
    try {
      const message = `New Notice: ${noticeTitle}`;
      const timestamp = serverTimestamp();

      let batch = writeBatch(db);
      let count = 0;

      // 1. Create ONE main notification document in the root collection
      const mainNotifRef = doc(collection(db, "notifications"));
      batch.set(mainNotifRef, {
        title: "Notice Approval",
        message: message,
        createdAt: timestamp,
        type: "notice",
        targetId: noticeId
      });
      count++;

      // 2. Add each user to the "userNotifications" subcollection INSIDE that document
      const usersSnap = await getDocs(collection(db, "users"));

      usersSnap.forEach((userDoc) => {
        // Path: notifications/{mainNotifId}/userNotifications/{userId}
        const userNotifRef = doc(db, "notifications", mainNotifRef.id, "userNotifications", userDoc.id);
        
        batch.set(userNotifRef, {
          userId: userDoc.id,
          message: message, // We duplicate the message here so the frontend can read it instantly
          read: false,
          createdAt: timestamp,
          type: "notice",
          targetId: noticeId
        });

        count++;
        // Firestore batches max out at 500. Commit and reset if we get close.
        if (count >= 490) {
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });

      // Commit any remaining writes
      if (count > 0) {
        await batch.commit();
      }
      
      console.log("Successfully broadcasted structured notifications!");
    } catch (error) {
      console.error("Error broadcasting notifications:", error);
    }
  };

  const handleApproveNotice = async (noticeId) => {
    try {
      // Update the notice status in Firestore
      await updateDoc(doc(db, "notices", noticeId), { status: "approved" });
      
      const approvedNotice = noticesList.find(n => n.id === noticeId);
      const noticeTitle = approvedNotice ? approvedNotice.title : "Check the Notice Board";

      setNoticesList(noticesList.map(n => n.id === noticeId ? { ...n, status: "approved" } : n));
      
      alert("Notice Approved and Published!");

      // Send the notification
      notifyAllUsers(noticeTitle, noticeId);

    } catch (error) {
      console.error("Error approving notice:", error);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm("Delete this notice permanently?")) {
      try {
        await deleteDoc(doc(db, "notices", noticeId));
        setNoticesList(noticesList.filter(n => n.id !== noticeId));
      } catch (error) { console.error("Error deleting notice:", error); }
    }
  };

  // --- FILTER & PAGINATION FUNCTION ---
  const getFilteredAndPaginatedData = (dataList, searchKeys) => {
    // 1. Filter
    const filtered = dataList.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return searchKeys.some(key => {
        const val = item[key];
        return val && String(val).toLowerCase().includes(term);
      });
    });

    // 2. Paginate
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = filtered.slice(indexOfFirst, indexOfLast);

    return { currentItems, totalPages, totalCount: filtered.length };
  };

  // Process Data for current active tab
  const usersData = getFilteredAndPaginatedData(usersList, ['displayName', 'email', 'faculty', 'role']);
  const materialsData = getFilteredAndPaginatedData(materialsList, ['resourceTitle', 'courseCode', 'courseSubject', 'displayName']);
  const kuppiData = getFilteredAndPaginatedData(kuppiList, ['title', 'host']);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-blue-400">StudyMate Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {["dashboard", "users", "materials", "kuppi", "notices"].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg capitalize transition-colors ${activeTab === tab ? "bg-blue-600" : "hover:bg-gray-800"}`}
            >
              {tab === "dashboard" && <LayoutDashboard size={20} />}
              {tab === "users" && <Users size={20} />}
              {tab === "materials" && <FileText size={20} />}
              {tab === "kuppi" && <Video size={20} />}
              {tab === "notices" && <Bell size={20} />}
              {tab === "dashboard" ? "Overview" : tab === "kuppi" ? "Kuppi Sessions" : `Manage ${tab}`}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-red-400">
            <LogOut size={20} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ----- DASHBOARD TAB ----- */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.users}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Total Materials</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.materials}</p>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-gray-500 text-sm font-medium">Active Kuppis</h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{loadingStats ? "..." : stats.kuppis}</p>
               </div>
            </div>
          )}

          {/* ----- USERS TAB ----- */}
          {activeTab === "users" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search users by name, email, or faculty..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingUsers ? (
                  <div className="p-8 text-center text-gray-500">Loading users...</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b">
                            <th className="p-4 font-medium">User Details</th>
                            <th className="p-4 font-medium">Contact</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {usersData.currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">No users found.</td></tr>
                          ) : (
                            usersData.currentItems.map((user) => (
                              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.displayName || "User"}&background=EBF4FF&color=1E3A8A`} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                      <p className="font-semibold text-gray-800">{user.displayName || "No Name Set"}</p>
                                      <p className="text-xs text-gray-500">{user.faculty || "No Faculty"} • {user.program || "No Program"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <p className="text-sm text-gray-800">{user.email}</p>
                                </td>
                                <td className="p-4">
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {user.role || 'user'}
                                  </span>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                  <button onClick={() => handleDeleteUser(user.id, user.displayName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls 
                      totalPages={usersData.totalPages} 
                      totalCount={usersData.totalCount}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ----- MATERIALS TAB ----- */}
          {activeTab === "materials" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search materials by title, course code, or uploader..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingMaterials ? (
                  <div className="p-8 text-center text-gray-500">Loading materials...</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b">
                            <th className="p-4 font-medium">Resource Title</th>
                            <th className="p-4 font-medium">Course / Subject</th>
                            <th className="p-4 font-medium">Uploaded By</th>
                            <th className="p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {materialsData.currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">No materials found.</td></tr>
                          ) : (
                            materialsData.currentItems.map((material) => (
                              <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <p className="font-semibold text-gray-800">{material.resourceTitle || "Untitled Resource"}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-xs">{material.description || "No description"}</p>
                                </td>
                                <td className="p-4">
                                  <p className="text-sm text-gray-800">{material.courseCode || "N/A"}</p>
                                  <p className="text-xs text-gray-500">{material.courseSubject || "N/A"}</p>
                                </td>
                                <td className="p-4">
                                  <p className="text-sm text-gray-800">{material.displayName || "Unknown User"}</p>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                  {material.fileLink && (
                                    <a href={material.fileLink} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Material">
                                      <Eye size={18} />
                                    </a>
                                  )}
                                  <button onClick={() => handleDeleteMaterial(material)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Material">
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls 
                      totalPages={materialsData.totalPages} 
                      totalCount={materialsData.totalCount}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ----- KUPPI SESSIONS TAB ----- */}
          {activeTab === "kuppi" && (
            <div className="flex flex-col h-full">
              <SearchBar 
                placeholder="Search sessions by topic or host..." 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
              />
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingKuppis ? (
                  <div className="p-8 text-center text-gray-500">Loading sessions...</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b">
                            <th className="p-4 font-medium">Session Topic</th>
                            <th className="p-4 font-medium">Host</th>
                            <th className="p-4 font-medium">Date & Time</th>
                            <th className="p-4 font-medium text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {kuppiData.currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">No active sessions found.</td></tr>
                          ) : (
                            kuppiData.currentItems.map((session) => (
                              <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <p className="font-semibold text-gray-800">{session.title || "Untitled Session"}</p>
                                  {session.link && (
                                    <a href={session.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate inline-block max-w-xs">Join Link</a>
                                  )}
                                </td>
                                <td className="p-4">
                                  <p className="text-sm text-gray-800">{session.host || "Anonymous"}</p>
                                </td>
                                <td className="p-4">
                                  <p className="text-sm text-gray-800">{session.time ? session.time.replace("T", " ") : "Not set"}</p>
                                </td>
                                <td className="p-4 flex justify-center gap-2">
                                  <button onClick={() => handleDeleteKuppi(session.id, session.title)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Session">
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <PaginationControls 
                      totalPages={kuppiData.totalPages} 
                      totalCount={kuppiData.totalCount}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                      itemsPerPage={itemsPerPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* ----- NOTICES TAB ----- */}
          {activeTab === "notices" && (
            <div className="flex flex-col h-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                {loadingNotices ? (
                  <div className="p-8 text-center text-gray-500">Loading notices...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider border-b">
                          <th className="p-4 font-medium">Notice Title & Desc</th>
                          <th className="p-4 font-medium">Author</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {noticesList.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-gray-500">No notices found.</td></tr>
                        ) : (
                          noticesList.map((notice) => (
                            <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                              <td className="p-4">
                                <p className="font-semibold text-gray-800">{notice.title}</p>
                                <p className="text-xs text-gray-500 max-w-sm truncate">{notice.description}</p>
                              </td>
                              <td className="p-4">
                                <p className="text-sm text-gray-800">{notice.authorName}</p>
                              </td>
                              <td className="p-4">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${notice.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {notice.status || 'pending'}
                                </span>
                              </td>
                              <td className="p-4 flex justify-center gap-2">
                                {/* 1. NEW VIEW BUTTON */}
                                <button 
                                  onClick={() => setViewNotice(notice)} 
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                  title="View Full Notice"
                                >
                                  <Eye size={18} />
                                </button>

                                {/* 2. APPROVE BUTTON */}
                                {notice.status !== "approved" && (
                                  <button 
                                    onClick={() => handleApproveNotice(notice.id)} 
                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                    title="Approve & Publish"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                )}

                                {/* 3. DELETE BUTTON */}
                                <button 
                                  onClick={() => handleDeleteNotice(notice.id)} 
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                  title="Delete Notice"
                                >
                                  <Trash2 size={18} />
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
      {/* ----- VIEW NOTICE MODAL ----- */}
      {viewNotice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl relative transform transition-all animate-in fade-in zoom-in duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setViewNotice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            {/* Header / Topic */}
            <h2 className="text-xl font-bold mb-2 text-gray-800 pr-8 break-words leading-tight">
              {viewNotice.title}
            </h2>
            
            {/* Meta Info */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${viewNotice.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {viewNotice.status || 'pending'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                By {viewNotice.authorName}
              </span>
            </div>

            {/* Full Description Box */}
            <div className="bg-gray-50 p-4 rounded-xl max-h-96 overflow-y-auto border border-gray-100 shadow-inner">
              <p className="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
                {viewNotice.description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setViewNotice(null)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
              
              {/* Allow approving directly from the modal! */}
              {viewNotice.status !== "approved" && (
                <button
                  onClick={() => {
                    handleApproveNotice(viewNotice.id);
                    setViewNotice({ ...viewNotice, status: "approved" }); // Update modal state so it turns green immediately
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Approve Now
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}