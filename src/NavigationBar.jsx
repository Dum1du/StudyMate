import { useEffect, useState } from "react";
import { Bell, Mail, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { MdLogout } from "react-icons/md";

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
    <nav className="bg-blue-600 text-white shadow-md relative">
      <div className="w-full flex items-center justify-between px-6 py-2">
        {/* LEFT: Logo + Tabs */}
        <div className="flex items-center space-x-8">
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
            <Link to="/QuizeGenerator" className="hover:text-gray-200">
              Quiz Generator
            </Link>
            <Link to="/Settings" className="hover:text-gray-200">
              Settings
            </Link >

          </div>
        </div>

        {/* RIGHT: Bell + Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="hover:text-gray-200">
            <Bell size={20} />
          </button>
          <Link to="/userProfile">
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
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* BACKDROP (faded background) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* RIGHT DRAWER MENU */}
      <div
        className={`fixed top-0 right-0 h-full w-75 bg-blue-700 text-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Link to="/userProfile" onClick={() => setIsOpen(false)}>
          <div className="justify-items-center w-full pt-10 pb-2 border-t border-blue-500">
            <img
              src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-
              person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-
              templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
              alt="User"
              className="w-30 h-30 rounded-full border-2 border-white"
            />
            <div className="w-full justify-items-center border-b border-blue-500 pb-5">
              <p className="font-medium">{username}</p>
              <p className="text-xs text-gray-200">{email}</p>
            </div>
          </div>
        </Link>

        <div className="px-6 py-4 space-y-4">
          <Link
            to="/home"
            className="block hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/BrowseResources"
            className="block hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Browse Resources
          </Link>
          <Link
            to="#"
            className="block hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Quiz Generator
          </Link>
          <Link
            to="#"
            className="block hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
        </div>
        <div className="flex items-center space-x-6 pt-4 border-t border-blue-500 pl-6">
          <div>
            <MdLogout className="size-6" />
          </div>
          <div className="text-m leading-tight">
            <p className="font-medium">Log Out</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
