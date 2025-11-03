import React, { useState, useEffect } from "react";
import NotificationDropdown from "./NotificationDropdown";

function NotificationWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, message: "New assignment uploaded!", read: false, time: "10:15 AM", date: "2025-11-03" },
    { id: 2, message: "Message from your lecturer", read: false, time: "09:45 AM", date: "2025-11-03" },
    { id: 3, message: "Lab results released", read: false, time: "08:30 AM", date: "2025-11-02" },
    { id: 4, message: "Exam schedule updated", read: false, time: "07:50 AM", date: "2025-11-02" },
    { id: 5, message: "New message in group chat", read: false, time: "07:20 AM", date: "2025-11-02" },
    { id: 6, message: "Library notice posted", read: false, time: "06:50 AM", date: "2025-11-01" },
    { id: 7, message: "Event reminder", read: false, time: "06:20 AM", date: "2025-11-01" },
    { id: 8, message: "Assignment graded", read: false, time: "05:50 AM", date: "2025-10-31" },
    { id: 9, message: "New course material", read: false, time: "05:20 AM", date: "2025-10-31" },
    { id: 10, message: "Meeting scheduled", read: false, time: "04:50 AM", date: "2025-10-30" },
    { id: 11, message: "Payment receipt issued", read: false, time: "04:20 AM", date: "2025-10-30" },
    { id: 12, message: "System maintenance notice", read: false, time: "03:50 AM", date: "2025-10-29" },
    { id: 13, message: "New forum post", read: false, time: "03:20 AM", date: "2025-10-29" },
    { id: 14, message: "Profile updated successfully", read: false, time: "02:50 AM", date: "2025-10-28" },
    { id: 15, message: "New message from admin", read: false, time: "02:20 AM", date: "2025-10-28" },
  ]);

  useEffect(() => {
    const bell = document.querySelector("button > svg"); 
    if (!bell) return;

    const handleClick = () => setIsOpen((prev) => !prev);

    bell.parentElement.addEventListener("click", handleClick);

    const handleClickOutside = (event) => {
      if (!bell.parentElement.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      bell.parentElement.removeEventListener("click", handleClick);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, read: true } 
          : n
      )
    );
  };

  const handleClear = () => setNotifications([]);

  return isOpen ? (
    <div
      className="absolute z-50"
      style={{
        top: "50px", 
        right: "20px", 
      }}
    >
      <NotificationDropdown
        notifications={notifications}
        onClear={handleClear}
        onClickNotification={handleNotificationClick}
      />
    </div>
  ) : null;
}

export default NotificationWrapper;
