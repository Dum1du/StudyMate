import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

function useCreateUserDoc() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const joinDate = new Date(currentUser.metadata.creationTime);
            const joinMonth = joinDate.toLocaleString("default", {
              month: "long",
            });
            const joinYear = joinDate.getFullYear();

            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || "",
              joinedMonth: joinMonth,
              joinedYear: joinYear,
              createdAt: serverTimestamp(),
              profilePicture: "",
              faculty: "",
              program: "",
              Contact: "",
            });

            console.log("User document created for:", currentUser.email);
          }
        } catch (err) {
          console.error("Error creating user document:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);
}

export default useCreateUserDoc;