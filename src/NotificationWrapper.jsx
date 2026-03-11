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
  collectionGroup
} from "firebase/firestore";
import { Bell } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // 1. Listen for User Auth & Fetch their Notification Settings
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // If user logs in, fetch their settings
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setIsNotifEnabled(data.notificationsEnabled ?? true); 
            }
          });
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Notifications (Only if enabled!)
  useEffect(() => {
    if (!user || !isNotifEnabled) {
      setNotifications([]);
      return;
    }

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
          id: doc.ref.path,
          message: data.message || "New Notification",
          read: data.read || false,
          date: dateObj.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }),
          time: dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
          type: data.type || null,
          targetId: data.targetId || null
        };
      });
      setNotifications(fetchedNotifs);
    });

    return () => unsubscribe();
  }, [user, isNotifEnabled]);

  // 3. Handle clicking outside the dropdown
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
      const notifRef = doc(db, path);
      await updateDoc(notifRef, { read: true });

      const clickedNotif = notifications.find(n => n.id === path);

      if (clickedNotif) {
        if (clickedNotif.type === "notice") {
          setIsOpen(false);
          navigate("/noticeboard");
        } 
        else if (clickedNotif.type === "comment" || clickedNotif.type === "reply") {
          setIsOpen(false);
          navigate(`/material/${clickedNotif.targetId}`);
        }
        else if (clickedNotif.type === "quiz") {
          // FIXED: Removed navigation for quizzes. 
          // Just close the dropdown and acknowledge the read status.
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.error("Error updating notification status:", error);
    }
  };

  const handleClear = async () => {
    if (notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        const notifRef = doc(db, notif.id);
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
        <Bell size={20} className={isNotifEnabled ? "" : "opacity-50"} />
        
        {isNotifEnabled && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-blue-600">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-10 -right-12 md:-right-2 z-50 origin-top-right">
          <NotificationDropdown
            notifications={isNotifEnabled ? notifications : []}
            onClear={handleClear}
            onClickNotification={handleNotificationClick}
            isNotifEnabled={isNotifEnabled}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationWrapper;