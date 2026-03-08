import React from "react";
import { BellOff } from "lucide-react";

function NotificationDropdown({ notifications, onClear, onClickNotification, isNotifEnabled }) {
  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-lg w-110 max-h-110 p-3 z-50">
      
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

      
      <div className="flex justify-between items-center mb-2 px-1">
        <p className="font-bold text-xl text-gray-700">Notifications</p>
        {/* Only show Clear All if notifications are enabled AND there are notifications to clear */}
        {isNotifEnabled && notifications.length > 0 && (
          <button
            onClick={onClear}
            className="text-blue-600 text-sm hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      
      <ul className="max-h-[360px] overflow-y-scroll no-scrollbar">
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
          <li className="text-gray-500 text-sm text-center py-6">
            No new notifications
          </li>
        ) : (
          /* 3. SHOW NOTIFICATIONS */
          notifications.map((notif) => (
            <li
              key={notif.id}
              onClick={() => onClickNotification(notif.id)}
              className={`p-3 mb-1 rounded-lg cursor-pointer flex justify-between items-center transition-all duration-200 ease-in-out transform
                ${!notif.read
                  ? "font-bold text-gray-800 bg-gray-50"
                  : "font-normal text-gray-600"}
                hover:bg-blue-50 hover:scale-[1.02] hover:shadow-sm
              `}
            >
              <span>{notif.message}</span>
              <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">
                {notif.date} {notif.time}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotificationDropdown;