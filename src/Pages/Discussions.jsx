import React, { useState, useEffect } from "react";
import { collectionGroup, query, onSnapshot, doc, getDoc, orderBy, limit, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import Discuss from "../Discuss.jsx";
import ed_bg from "../Bg images/ed_bg.jpg";
import AlertModal from "../AlertModal"; // <-- Imported AlertModal
import { useNavigate } from "react-router";

function Discussion() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({ displayName: "", photoURL: "" });
  const [userProfiles, setUserProfiles] = useState({}); // Stores { uid: { displayName, profilePicture } }

  const PAGE_SIZE = 8;

  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const navigateTo = async (discussionDoc) => {
  try {
    // 1. Check if the reference exists in the document
    if (discussionDoc.materialRef) {
      // 2. Fetch the actual material document from its location
      const materialSnap = await getDoc(discussionDoc.materialRef);
      
      if (materialSnap.exists()) {
        const materialData = { id: materialSnap.id, ...materialSnap.data() };
        
        // 3. Navigate using the REAL material data
        navigate(`/material/${materialSnap.id}`, { 
          state: { resource: materialData } 
        });
      } else {
        alert("The original resource has been deleted.");
      }
    }
  } catch (error) {
    console.error("Error fetching referenced material:", error);
    alert("Could not load the resource details.");
  }
};

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

  // --- Fetch logged-in user info ---
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setCurrentUserProfile({
              displayName: userDoc.data().displayName,
              photoURL: userDoc.data().profilePicture,
            });
            setUserProfiles((prev) => ({ ...prev, [user.uid]: userDoc.data() }));
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    });
    return () => unsubAuth();
  }, []);

  const fetchProfiles = async (materialsList) => {

  const newProfiles = { ...userProfiles };

  for (const mat of materialsList) {

    const uid = mat.uploaderUid;

    if (uid && !newProfiles[uid]) {

      const userDoc = await getDoc(doc(db, "users", uid));

      if (userDoc.exists()) {
        newProfiles[uid] = userDoc.data();
      }
    }
  }

  setUserProfiles(newProfiles);
};

  // --- Fetch all materials and uploader profiles ---
  const loadDiscussions = async () => {
  try {

    const q = query(
      collection(db, "discussions"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const allMaterials = snapshot.docs.map((doc) => ({
      id: doc.id,
      deptId: doc.ref.parent.parent?.id || "default",
      ...doc.data(),
    }));

    setMaterials(allMaterials);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    setLoading(false);

    fetchProfiles(allMaterials);

  } catch (err) {
    console.error("Error loading discussions:", err);

    setAlertConfig({
      isOpen: true,
      title: "Connection Error",
      message: "Failed to load discussions.",
      type: "error"
    });

    setLoading(false);
  }
};

useEffect(() => {
  loadDiscussions();
}, []);

const loadMore = async () => {

  if (!lastDoc || !hasMore || loadingMore) return;

  setLoadingMore(true);

  try {

    const q = query(
      collectionGroup(db, "discussions"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE)
    );

    const snapshot = await getDocs(q);

    const newMaterials = snapshot.docs.map((doc) => ({
      id: doc.id,
      deptId: doc.ref.parent.parent?.id || "default",
      ...doc.data(),
    }));

    setMaterials(prev => [...prev, ...newMaterials]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === PAGE_SIZE);

    fetchProfiles(newMaterials);

  } catch (err) {
    console.error("Error loading more discussions:", err);
  }

  setLoadingMore(false);
};

useEffect(() => {

  const handleScroll = () => {

    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 300
    ) {
      loadMore();
    }

  };

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);

}, [lastDoc, hasMore, loadingMore]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto mt-6 p-5">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Study Discussion Wall</h2>

        {loading && <p className="text-center text-blue-600">Loading Feed...</p>}

        <div className="grid gap-6">
          {materials.map((mat) => {
            return (
              <Discuss
                key={mat.id}
                id={mat.id}
                courseCode={mat.courseCode}
                resourceTitle={mat.resourceTitle}
                firstCommentText={mat.firstCommentText}
                creatorName={mat.creatorName || "Unknown User"}
                creatorImage={mat.creatorImage || `https://ui-avatars.com/api/?name=${userProfiles[mat.creatorName || "User"]?.displayName || "User"}`}
                createdAt={mat.createdAt}
                onOpen={() => navigateTo(mat)}
              />
            );
          })}
        </div>
      </div>

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

export default Discussion;