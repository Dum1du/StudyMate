import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user data from Firestore to check their role
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists() && docSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  // If not admin, kick them back to the home page
  if (!isAdmin) return <Navigate to="/logins" />;

  // If they are admin, render the dashboard
  return children;
}