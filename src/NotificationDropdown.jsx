import React from "react";
import { BellOff } from "lucide-react";

function NotificationDropdown({ notifications, onClear, onClickNotification, isNotifEnabled }) {
  return (
    // FIXED WIDTH: Replaced 'w-110' with responsive 'w-[300px] sm:w-[380px]'
    <div className="bg-white shadow-2xl border border-gray-200 rounded-xl w-[300px] sm:w-[380px] p-3 z-50">
      
      <style>
        {`
          /* Hide scrollbar for Chrome, Safari and Edge */
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for Firefox */
          .no-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}
      </style>

      
      <div className="flex justify-between items-center mb-3 px-2 pt-1">
        <p className="font-bold text-lg text-gray-800">Notifications</p>
        {/* Only show Clear All if notifications are enabled AND there are notifications to clear */}
        {isNotifEnabled && notifications.length > 0 && (
          <button
            onClick={onClear}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      
      <ul className="max-h-[380px] overflow-y-scroll no-scrollbar">
        {/* 1. CHECK IF MUTED */}
        {!isNotifEnabled ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <BellOff size={36} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-600">Notifications Muted</p>
            <p className="text-xs text-gray-400 mt-1 text-center px-4">
              You can turn them back on in your profile settings.
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* 2. CHECK IF EMPTY */
          <li className="text-gray-500 text-sm text-center py-8">
            No new notifications
          </li>
        ) : (
          /* 3. SHOW NOTIFICATIONS */
          notifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => onClickNotification(notif.id)}
              className={`p-3 mb-1 rounded-xl cursor-pointer flex flex-col transition-all duration-200 ease-in-out
                ${!notif.read
                  ? "bg-blue-50/50 border border-blue-100"
                  : "bg-white hover:bg-gray-50"}
              `}
            >
              <div className="flex justify-between items-start gap-2">
                <span className={`text-sm ${!notif.read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                  {notif.message}
                </span>
                {!notif.read && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>}
              </div>
              <span className="text-[11px] font-medium text-gray-400 mt-2 block">
                {notif.date} at {notif.time}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationDropdown;