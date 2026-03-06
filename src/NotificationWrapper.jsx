import React, { useState, useEffect, useRef } from "react";
import NotificationDropdown from "./NotificationDropdown";
import { db, auth } from "./firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  writeBatch,
  collectionGroup // <--- NEW IMPORT
} from "firebase/firestore";
import { Bell } from "lucide-react"; 

function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // 1. Use a collectionGroup query to find the subcollections!
    const q = query(
      collectionGroup(db, "userNotifications"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifs = snapshot.docs.map((doc) => {
        const data = doc.data();
        const dateObj = data.createdAt ? data.createdAt.toDate() : new Date();
        
        return {
          id: doc.ref.path, // <--- CRITICAL FIX: We now store the full database path instead of just the ID
          message: data.message || "New Notification",
          read: data.read || false,
          date: dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
          time: dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })
        };
      });
      setNotifications(fetchedNotifs);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (path) => {
    try {
      // Because 'id' is now the full path, we pass it directly to doc()
      const notifRef = doc(db, path);
      await updateDoc(notifRef, { read: true });
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handleClear = async () => {
    if (notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const notifRef = doc(db, notif.id); // notif.id is the full path
        batch.delete(notifRef);
      });
      await batch.commit();
      setIsOpen(false); 
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative text-white hover:text-gray-200 transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-600">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-8 right-0 z-50">
          <NotificationDropdown
            notifications={notifications}
            onClear={handleClear}
            onClickNotification={handleNotificationClick}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationWrapper;