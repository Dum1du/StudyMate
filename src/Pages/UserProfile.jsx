import React, { useEffect, useState } from "react";
import Navbar from "../NavigationBar";
import { IoCameraOutline } from "react-icons/io5";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { MdLogout, MdVerified } from "react-icons/md"; 
import { useNavigate } from "react-router-dom"; 
import { doc, updateDoc, getDoc, deleteField } from "firebase/firestore"; 
import { FaFileAlt, FaTrash, FaEye } from "react-icons/fa"; 
import EditProfileModal from "./EditProfileModal";
import Footer from "../Footer";
import axios from "axios";
import AlertModal from "../AlertModal"; 

const DEFAULT_AVATAR = "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  
  const [authLoading, setAuthLoading] = useState(true); 
  const [postsLoading, setPostsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const handleViewResource = (post) => {
    const fullResource = {
      ...post,
      uploaderUid: post.uploaderUid || user.uid,
      displayName: post.displayName || user.displayName,
      uploaderEmail: post.uploaderEmail || user.email,
      fileLink: post.fileLink || post.fileUrl || "" 
    };
    
    navigate(`/material/${post.id}`, { state: { resource: fullResource } });
  };

  const handleProfileUpdate = async (updatedData) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: updatedData.displayName,
        faculty: updatedData.faculty,
        program: updatedData.program,
        contact: updatedData.contact,
      });

      await updateProfile(auth.currentUser, {
        displayName: updatedData.displayName
      });
      
      setUser((prevUser) => ({ ...prevUser, ...updatedData }));
      
      setAlertConfig({ isOpen: true, title: "Profile Updated", message: "Your profile information has been updated successfully!", type: "success" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlertConfig({ isOpen: true, title: "Update Failed", message: "Failed to update your profile. Please try again.", type: "error" });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image || !user) return;
    setUploading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { profilePicture: image });
      setUser((prevUser) => ({ ...prevUser, profilePicture: image }));
      
      setAlertConfig({ isOpen: true, title: "Picture Updated", message: "Profile picture updated successfully!", type: "success" });
      setPreview(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setAlertConfig({ isOpen: true, title: "Upload Failed", message: "Failed to upload picture! Please try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = () => {
    setAlertConfig({
      isOpen: true,
      title: "Remove Profile Picture",
      message: "Are you sure you want to remove your profile picture? You will be reverted to the default avatar.",
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        setIsModalOpen(false); 
        setUploading(true);
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { profilePicture: deleteField() });
          
          setUser((prevUser) => {
            const updatedUser = { ...prevUser };
            delete updatedUser.profilePicture;
            return updatedUser;
          });
          setPreview(null);
          setImage(null);

          setAlertConfig({ isOpen: true, title: "Picture Removed", message: "Your profile picture has been removed successfully.", type: "success", onConfirm: null });
        } catch (error) {
          console.error("Error removing profile picture:", error);
          setAlertConfig({ isOpen: true, title: "Error", message: "Failed to remove your profile picture. Please try again.", type: "error", onConfirm: null });
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Confirm Logout",
      message: "Are you sure you want to log out?",
      type: "warning",
      onConfirm: async () => {
        try {
          await signOut(auth);
          navigate("/logins"); 
        } catch (error) {
          console.error("Logout failed!", error);
        } finally {
          closeAlert();
        }
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const joinDate = new Date(currentUser.metadata.creationTime);
        const joinMonth = joinDate.toLocaleString("default", { month: "long" });
        const joinYear = joinDate.getFullYear();

        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUser({ ...currentUser, ...docSnap.data(), joinedMonth: docSnap.data().joinedMonth || joinMonth, joinedYear: docSnap.data().joinedYear || joinYear });
        } else {
          setUser({ ...currentUser, joinedMonth: joinMonth, joinedYear: joinYear });
        }
      } else {
        setUser(null);
        navigate("/logins"); 
      }
      setAuthLoading(false); 
    });
    return () => unsubscribe();
  }, [navigate]);


  // --- FIXED: Uses backend to fetch files safely, then enriches with Firebase ratings ---
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.uid) return;
      try {
        setPostsLoading(true);
        const token = await auth.currentUser.getIdToken();
        
        // 1. Fetch files from your working backend
        const res = await axios.get("http://localhost:4000/user-uploads", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const backendPosts = res.data;

        // 2. Loop through those files and fetch their live ratings from Firebase
        const enrichedPosts = await Promise.all(
          backendPosts.map(async (post) => {
            try {
              const dept = post.courseCode?.slice(0, 3).toUpperCase();
              if (dept && post.id) {
                const matRef = doc(db, "studyMaterials", dept, "Materials", post.id);
                const matSnap = await getDoc(matRef);
                if (matSnap.exists()) {
                  const data = matSnap.data();
                  return {
                    ...post,
                    avgRating: data.avgRating || 0,
                    ratingCount: data.ratingCount || 0,
                  };
                }
              }
            } catch (err) {
              console.error("Error fetching live rating for post", post.id, err);
            }
            return post; 
          })
        );

        setUserPosts(enrichedPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  const handleDelete = (docId, title, courseCode) => {
    const diptId = courseCode.slice(0, 3).toUpperCase();

    setAlertConfig({
      isOpen: true,
      title: "Delete Resource",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      type: "warning",
      onConfirm: async () => {
        closeAlert();
        setDeletingId(docId);

        try {
          const token = await auth.currentUser.getIdToken();
          await axios.delete(`http://localhost:4000/delete-upload/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { diptId }
          });
          setUserPosts((prev) => prev.filter((item) => item.id !== docId));
          
          setAlertConfig({ isOpen: true, title: "Resource Deleted", message: "The resource was deleted successfully.", type: "success", onConfirm: null });
        } catch (error) {
          console.error("Delete failed:", error);
          setAlertConfig({ isOpen: true, title: "Delete Failed", message: "Failed to delete the resource. Please try again.", type: "error", onConfirm: null });
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // --- DYNAMIC RATING CALCULATION ---
  const totalRatingSum = userPosts.reduce((sum, post) => sum + ((post.avgRating || 0) * (post.ratingCount || 0)), 0);
  const totalRatingCount = userPosts.reduce((sum, post) => sum + (post.ratingCount || 0), 0);
  const averageUserRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(1) : "0.0";

  const PostList = () => {
    if (postsLoading) return <div className="text-center text-gray-500 py-8">Loading uploads...</div>;
    if (userPosts.length === 0) return <div className="text-center text-gray-500 py-8">No uploads found.</div>;

    return (
      <div className="w-full">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider">
                <th className="p-4 rounded-tl-lg">Title</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {userPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <FaFileAlt />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{post.resourceTitle}</p>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                          {post.courseCode}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{post.courseSubject}</td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(post.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => handleViewResource(post)}
                        className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-700 rounded-full transition"
                        title="View File"
                      >
                        <FaEye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id, post.resourceTitle, post.courseCode)}
                        disabled={deletingId === post.id}
                        className={`p-2 rounded-full transition ${ deletingId === post.id ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-red-500 hover:bg-red-50 hover:text-red-700" }`}
                        title="Delete File"
                      >
                        {deletingId === post.id ? "..." : <FaTrash size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {userPosts.map((post) => (
            <div key={post.id} className="flex flex-col p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                    <FaFileAlt />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {post.resourceTitle}
                    </h4>
                    <p className="text-xs text-gray-500">{post.courseSubject} • {post.courseCode}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between border-t pt-3">
                <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleViewResource(post)}
                    className="flex items-center space-x-1 text-blue-500 text-xs font-medium hover:text-blue-700"
                  >
                    <FaEye /> <span>View</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(post.id, post.resourceTitle, post.courseCode)}
                    disabled={deletingId === post.id}
                    className="flex items-center space-x-1 text-red-500 text-xs font-medium hover:text-red-700"
                  >
                     {deletingId === post.id ? <span>Deleting...</span> : <><FaTrash /> <span>Delete</span></>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500 text-lg">Loading Profile...</p></div>;
  if (!user) return null;

  return (
    <>
      <div className="hidden md:flex max-w-6xl w-full mx-auto mt-10 space-x-6 px-4 mb-20">
        <div className="w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-fit shrink-0">
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="flex flex-col space-y-3">
            {["overview", "uploads"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-3 py-2 rounded-md transition-colors ${ activeTab === tab ? "bg-blue-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-100" }`}
              >
                {tab === "uploads" ? "My Uploads" : "Overview"}
              </button>
            ))}
          </div>
          <div onClick={handleLogout} className="flex items-center space-x-6 border-none bg-red-50 text-red-600 p-2 justify-center rounded-xl mt-12 hover:bg-red-100 cursor-pointer transition">
            <MdLogout className="size-5" />
            <p className="font-medium">Log Out</p>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center space-x-6">
             <div className="relative shrink-0">
              <img src={preview || user.profilePicture || DEFAULT_AVATAR} alt="User" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-sm" />
              <label className="absolute bottom-1 right-1 rounded-full p-2 bg-blue-600 border-2 border-white cursor-pointer hover:bg-blue-700 transition shadow-sm group">
                <IoCameraOutline className="text-white text-lg" />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {user.displayName || user.email || "Not set"}
                {user?.role === "teacher" && (
                  <MdVerified className="text-blue-500 mt-1" title="Verified Teacher" size={24} />
                )}
              </h2>

              <p className="text-gray-600 font-medium">{user.faculty || "Faculty not set"}</p>
              <div className="flex items-center mt-2 text-gray-500 text-sm">
                <span>Joined {user?.joinedMonth} {user?.joinedYear}</span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Edit Profile</button>
                {preview && ( <button onClick={handleUpload} disabled={uploading} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">{uploading ? "Saving..." : "Save Picture"}</button> )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6 min-h-[300px]">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                 <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">About</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Faculty</span><span className="font-medium text-gray-800">{user.faculty || "Not set"}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Program</span><span className="font-medium text-gray-800">{user.program || "Not set"}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Contact</span><span className="font-medium text-gray-800">{user.contact || "Not set"}</span></div>
                    <div className="flex justify-between border-b border-gray-100 pb-2"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">{user.email}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Contributions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-600">{userPosts.length}</p>
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mt-1">Uploads</p>
                    </div>
                    {/* --- DYNAMIC RATING INJECTED HERE --- */}
                    <div className="bg-green-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">{averageUserRating}</p>
                      <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mt-1">Avg Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "uploads" && (
              <div className="w-full animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">My Uploads</h3>
                </div>
                <PostList />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 mt-6 mb-20">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
           <div className="relative mb-4">
            <img src={preview || user.profilePicture || DEFAULT_AVATAR} alt="User" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
            <label className="absolute bottom-0 right-0 rounded-full p-1.5 bg-blue-600 border-2 border-white cursor-pointer hover:bg-blue-700 transition shadow-sm">
              <IoCameraOutline className="text-white text-base" />
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

           <h2 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
             {user.displayName || user.email || "Not set"}
             {user?.role === "teacher" && (
                <MdVerified className="text-blue-500" title="Verified Teacher" size={20} />
             )}
           </h2>

           <p className="text-gray-500 text-sm mt-1">{user.faculty || "Faculty not set"}</p>
           <div className="flex flex-col gap-2 mt-4">
             <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 border border-gray-300 rounded-full text-sm font-medium mb-2">Edit Profile</button>
             {preview && ( <button onClick={handleUpload} disabled={uploading} className="px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700">{uploading ? "Saving..." : "Save Picture"}</button> )}
           </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <div className="flex border-b border-gray-200 mb-6">
            {["overview", "uploads"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium cursor-pointer transition-colors ${ activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500" }`}
              >
                {tab === "uploads" ? "My Uploads" : "Overview"}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6">
               <div className="space-y-3 text-sm">
                   <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Program</span><span className="text-gray-800">{user.program || "Not set"}</span></div>
                   <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Email</span><span className="text-gray-800 truncate ml-4">{user.email}</span></div>
                   <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Uploads</span><span className="text-gray-800 font-bold">{userPosts.length}</span></div>
                   {/* --- DYNAMIC RATING INJECTED HERE --- */}
                   <div className="flex justify-between py-2 border-b border-gray-50"><span className="text-gray-500">Avg Rating</span><span className="text-green-600 font-bold">{averageUserRating}</span></div>
                </div>
                <div onClick={handleLogout} className="flex items-center justify-center space-x-2 text-red-500 font-medium py-2 cursor-pointer">
                  <MdLogout /> <span>Log Out</span>
                </div>
            </div>
          )}

          {activeTab === "uploads" && <PostList />}
        </div>
      </div>
      
      {isModalOpen && (
        <EditProfileModal user={user} onClose={() => setIsModalOpen(false)} onSave={handleProfileUpdate} onRemovePhoto={handleRemovePicture} />
      )}

      <AlertModal isOpen={alertConfig.isOpen} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={closeAlert} onConfirm={alertConfig.onConfirm} />
    </>
  );
}

export default UserProfile;