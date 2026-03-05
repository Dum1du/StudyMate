import React, { useState, useEffect } from "react";
import { collectionGroup, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import Discuss from "../Discuss.jsx";
import Navbar from "../Navigationbar.jsx";
import ed_bg from "../Bg images/ed_bg.jpg";

function Discussion() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState({ displayName: "", photoURL: "" });
  const [userProfiles, setUserProfiles] = useState({}); // Stores { uid: { displayName, profilePicture } }

  // --- Fetch logged-in user info ---
  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUserProfile({
            displayName: userDoc.data().displayName,
            photoURL: userDoc.data().profilePicture,
          });
          // also store in userProfiles so we can use it for uploader info if needed
          setUserProfiles((prev) => ({ ...prev, [user.uid]: userDoc.data() }));
        }
      }
    });
    return () => unsubAuth();
  }, []);

  // --- Fetch all materials and uploader profiles ---
  useEffect(() => {
    const q = query(collectionGroup(db, "Materials"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
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
    });

    return () => unsubscribe();
  }, [userProfiles]); // depend on userProfiles to ensure we fetch new uploader info

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto mt-6 p-5">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Study Discussion Wall</h2>

        {loading && <p className="text-center text-blue-600">Loading Feed...</p>}

        <div className="grid gap-6">
          {materials.map((mat) => {
            const uploaderProfile = userProfiles[mat.uploaderUid]; // Uploader info

            return (
              <Discuss
                key={mat.id}
                docId={mat.id}
                deptId={mat.deptId}

                // ✅ Uploader info
                uploaderName={uploaderProfile?.displayName || "OUSL Student"}
                uploaderImage={uploaderProfile?.profilePicture || "https://ui-avatars.com/api/?name=U"}

                // ✅ Current logged-in user info
                currentUserEmail={currentUser?.email || "guest@ousl.lk"}
                currentUserName={currentUserProfile.displayName || "User"}
                currentUserImage={currentUserProfile.photoURL || "https://ui-avatars.com/api/?name=User"}

                // Other props
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
    </div>
  );
}

export default Discussion;