import React, { useState, useEffect } from "react";
import { collectionGroup, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import Discuss from "../Discuss.jsx";
import ed_bg from "../Bg images/ed_bg.jpg";
import AlertModal from "../AlertModal"; // <-- Imported AlertModal

function Discussion() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({ displayName: "", photoURL: "" });
  const [userProfiles, setUserProfiles] = useState({}); // Stores { uid: { displayName, profilePicture } }

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

  // --- Fetch all materials and uploader profiles ---
  useEffect(() => {
    const q = query(collectionGroup(db, "Materials"));
    
    // Added error handling to onSnapshot
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const allMaterials = snapshot.docs.map((doc) => ({
          id: doc.id,
          deptId: doc.ref.parent.parent?.id || "default",
          ...doc.data(),
        }));

        setMaterials(allMaterials);
        setLoading(false);

        const newProfiles = { ...userProfiles };
        for (const mat of allMaterials) {
          const uid = mat.uploaderUid;
          if (uid && !newProfiles[uid]) {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
              newProfiles[uid] = userDoc.data();
            }
          }
        }
        setUserProfiles(newProfiles);
      } catch (err) {
        console.error("Error processing discussions:", err);
      }
    }, (error) => {
      console.error("Error fetching discussions:", error);
      setLoading(false);
      // Show AlertModal if Firestore fails to load the feed
      setAlertConfig({
        isOpen: true,
        title: "Connection Error",
        message: "Failed to load the discussion feed. Please check your internet connection and try again.",
        type: "error"
      });
    });

    return () => unsubscribe();
  }, [userProfiles]); 

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto mt-6 p-5">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Study Discussion Wall</h2>

        {loading && <p className="text-center text-blue-600">Loading Feed...</p>}

        <div className="grid gap-6">
          {materials.map((mat) => {
            const uploaderProfile = userProfiles[mat.uploaderUid]; 

            return (
              <Discuss
                key={mat.id}
                docId={mat.id}
                deptId={mat.deptId}
                uploaderName={uploaderProfile?.displayName || "OUSL Student"}
                uploaderImage={uploaderProfile?.profilePicture || "https://ui-avatars.com/api/?name=U"}
                currentUserEmail={currentUser?.email || "guest@ousl.lk"}
                currentUserName={currentUserProfile.displayName || "User"}
                currentUserImage={currentUserProfile.photoURL || "https://ui-avatars.com/api/?name=User"}
                message={mat.description || mat.resourceTitle}
                pdfUrl={mat.fileLink}
                fileType={mat.fileType || "application/pdf"}
                courseName={mat.courseSubject}
                courseCode={mat.courseCode}
                initialLikes={mat.likedBy || []}
                initialComments={mat.comments || []}
                initialRatings={mat.ratings || {}}
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