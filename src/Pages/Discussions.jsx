import React, { useState, useEffect } from "react";
import {
  collectionGroup,
  query,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  limit,
  getDocs,
  collection,
  startAfter,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase.js";
import Discuss from "../Discuss.jsx";
import ed_bg from "../Bg images/ed_bg.jpg";
import AlertModal from "../AlertModal"; 
import { useNavigate } from "react-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Discussion() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({
    displayName: "",
    photoURL: "",
  });
  const [userProfiles, setUserProfiles] = useState({}); // Stores { uid: { displayName, profilePicture } }

  const [discussionText, setDiscussionText] = useState("");
const [selectedDoc, setSelectedDoc] = useState(null);
const [myDocuments, setMyDocuments] = useState([]);
const [loadingDocs, setLoadingDocs] = useState(true);

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
            state: { resource: materialData },
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

  useEffect(() => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user);
    }

    const fetchUserProfile = async (user) => {
    const userDocRef = doc(db, "users", user?.uid);
    const userSnap = await getDoc(userDocRef);

    if(userSnap.exists()) {
      const data = userSnap.data();

      setCurrentUserProfile({
        displayName: data.displayName || "Unknown User",
        photoURL: data.profilePicture || `https://ui-avatars.com/api/?name=${data.displayName || "User"}`,
      });

      console.log("Fetched user profile:", {
        displayName: data.displayName,
        photoURL: data.profilePicture,
      });
    }
    
    }

    fetchUserProfile(user);
  });
  return () => unsubscribe();
}, []);

  useEffect(() => {
    console.log("Current user in Discussions:", auth.currentUser);
  const fetchSavedDocuments = async () => {
    setLoadingDocs(true);
    try {
      const savedRef = collection(
        db,
        "users",
        currentUser.uid,
        "savedResources"
      );

      const snapshot = await getDocs(savedRef);

      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setMyDocuments(docs);
    } catch (err) {
      console.error("Error loading saved documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  if (currentUser?.uid) fetchSavedDocuments();
}, [currentUser]);

const showAlert = (message, title = "Notice", type = "info") => {
  setAlertConfig({
    isOpen: true,
    title,
    message,
    type,
    onConfirm: null,
  });
};


const createDiscussion = async () => {
  if (!discussionText || !selectedDoc) {
    showAlert("Please add message and select document");
    return;
  }

  console.log("Creating discussion for doc:", selectedDoc.resourceTitle);
  const deptId = selectedDoc.courseCode? selectedDoc.courseCode.slice(0, 3).toUpperCase() : "DEFAULT"; // Assuming doc ID format is "deptId_docId"
  const materialId = selectedDoc.id;
try {
  const discussionRef = doc(db, "discussions", materialId);
const discussionSnap = await getDoc(discussionRef);

if (discussionSnap.exists()) {
  showAlert("Discussion already exists for this document");
  return;
}

  
    const materialRef = doc(db, "studyMaterials", deptId, "Materials", materialId); //3PaO2p8yO2GURaAeNaQG"

    const materialSnap = await getDoc(materialRef);

    if (!materialSnap.exists()) {
      showAlert("Document not found", "Error", "error");
      return;
    }

    const materialData = materialSnap.data();

    // add first comment
    const commentsRef = collection(materialRef, "comments");
const firstCommentDoc = await addDoc(commentsRef, {
      text: discussionText,
      userName: currentUserProfile.displayName || "Unknown User",
      userEmail: currentUser.email,
      userProfile: currentUserProfile.photoURL||`https://ui-avatars.com/api/?name=${currentUserProfile.displayName || "User"}`,
      createdAt: serverTimestamp(),
    });

    // Create discussion document in discussions collection
    await setDoc(discussionRef, {
      courseCode: materialData.courseCode,
      createdAt: serverTimestamp(),
      creatorName: currentUserProfile.displayName || "Unknown User",
      creatorImage: currentUserProfile.photoURL||`https://ui-avatars.com/api/?name=${currentUserProfile.displayName || "User"}`,
      deptId: deptId,
      firstCommentId: firstCommentDoc.id,
      firstCommentText: discussionText,
      materialId: materialId,
      materialRef: materialRef,
      resourceTitle: materialData.resourceTitle,
    });

    showAlert("Discussion created successfully", "Success", "success");

  } catch (err) {
    console.error(err);
    showAlert("Something went wrong while creating the discussion.", "Error", "error");
  }
};

  // --- ADDED ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

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
        limit(PAGE_SIZE),
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
        type: "error",
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
        limit(PAGE_SIZE),
      );

      const snapshot = await getDocs(q);

      const newMaterials = snapshot.docs.map((doc) => ({
        id: doc.id,
        deptId: doc.ref.parent.parent?.id || "default",
        ...doc.data(),
      }));

      setMaterials((prev) => [...prev, ...newMaterials]);
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
        <h2 className="text-3xl font-bold text-blue-900 mb-6">
          Study Discussion Wall
        </h2>

        <div className="bg-white p-5 rounded-xl shadow mb-6">
  <h3 className="text-xl font-semibold text-blue-900 mb-3">
    Start a Discussion
  </h3>

  <textarea
    placeholder="What do you want to discuss about this document?"
    value={discussionText}
    onChange={(e) => setDiscussionText(e.target.value)}
    className="w-full border rounded-lg p-3 mb-3"
  />

  {/* document selector */}
  <select
    className="w-full border rounded-lg p-3 mb-3"
    onChange={(e) => {
      const docId = e.target.value;
      const selected = myDocuments.find((doc) => doc.id === docId);
      setSelectedDoc(selected);
    }}
  >
    <option value="">Select a document</option>
    {loadingDocs && <option className="animate-pulse">Loading documents...</option>}
    {myDocuments.map((doc) => (
      <option key={doc.id} value={doc.id}>
        {doc.resourceTitle}
      </option>
    ))}
  </select>

  <button
    onClick={createDiscussion}
    className="bg-blue-900 text-white px-4 py-2 rounded-lg"
  >
    Create Discussion
  </button>
</div>

        {loading && (
          <div className="blur-sm animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <Discuss
                key={i}
                courseCode="courseCode"
                resourceTitle="title"
                firstCommentText="Loading discussions..."
                creatorName="user"
                creatorImage={`https://ui-avatars.com/api/?name=username`}
              />
            ))}
          </div>
        )}

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
                creatorImage={
                  mat.creatorImage ||
                  `https://ui-avatars.com/api/?name=${userProfiles[mat.creatorName || "User"]?.displayName || "User"}`
                }
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