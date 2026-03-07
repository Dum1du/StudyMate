import React from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

function AlertModal({ isOpen, title, message, type = "info", onClose, onConfirm }) {
  if (!isOpen) return null;

  // Determine colors and icons based on the alert type
  let config = {
    icon: <Info className="text-blue-500 w-8 h-8" />,
    bg: "bg-blue-50",
    btnColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  if (type === "success") {
    config = {
      icon: <CheckCircle className="text-green-500 w-8 h-8" />,
      bg: "bg-green-50",
      btnColor: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    };
  } else if (type === "error" || type === "warning") {
    config = {
      icon: <AlertTriangle className="text-red-500 w-8 h-8" />,
      bg: "bg-red-50",
      btnColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    };
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Top bar styling */}
        <div className={`flex items-center justify-between px-6 py-4 ${config.bg} border-b border-gray-100`}>
          <div className="flex items-center gap-3">
            {config.icon}
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-white/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Content */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          {/* If onConfirm exists, it means we need a Cancel button too! */}
          {onConfirm && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold text-sm transition-all focus:outline-none"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.btnColor}`}
          >
            {onConfirm ? "Yes, Confirm" : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;