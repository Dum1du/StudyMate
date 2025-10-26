import { useEffect, useState } from "react";
import { Bell, Mail, Menu, X } from "lucide-react";
import { Link } from "react-router";
import {  auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User found:", user.displayName);
        setUsername(user.displayName || "");
        setEmail(user.email || "");
      } else {
        console.log("User not found");
        setUsername("");
        setEmail("");
      }
    });

    return () => unsubscribe();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="w-full flex items-center justify-between px-6 py-2">
        {/* LEFT: Logo + Tabs */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <span className="text-xl font-bold">
            Study<span className="text-black">Mate</span>
          </span>

          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-6 text-sm">
            <Link to="/home" className="hover:text-gray-200">
              Dashboard
            </Link>
            <Link to="/BrowseResources" className="hover:text-gray-200">
              Browse Resources
            </Link>
            <Link to="#" className="hover:text-gray-200">
              Quiz Generator
            </Link>
            <Link to="#" className="hover:text-gray-200">
              Settings
            </Link>
          </div>
        </div>

        {/* RIGHT: Bell + Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Bell Icon */}
          <button className="hover:text-gray-200">
            <Bell size={20} />
          </button>

          {/* Profile */}
          <div className="flex items-center space-x-2">
            <img
              src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-
              person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-
              templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div className="text-sm leading-tight">
              <p className="font-medium">{username}</p>
              <p className="text-xs text-gray-200">{email}</p>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 px-6 py-2 space-y-3">
          <a href="#" className="block hover:text-gray-200">
            Dashboard
          </a>
          <a href="#" className="block hover:text-gray-200">
            Browse Resources
          </a>
          <a href="#" className="block hover:text-gray-200">
            Quiz Generator
          </a>
          <a href="#" className="block hover:text-gray-200">
            Settings
          </a>

          <div className="flex items-center space-x-2 pt-2 border-t border-blue-500">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div className="text-sm leading-tight">
              <p className="font-medium">{username}</p>
              <p className="text-xs text-gray-200">{email}</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
