import { useEffect, useState, useRef } from "react";
import { Bell, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "./firebase"; // Ensure paths are correct
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { MdLogout } from "react-icons/md";
import NotificationWrapper from "./NotificationWrapper";

export default function Navbar() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/logins");
    } catch (error) {
      console.error("Logout failed!", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User found:", user.displayName);
        setUsername(user.displayName || "");
        setEmail(user.email || "");

        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setProfilePic(data.profilePicture || "");

            if (data.displayName) {
              setUsername(data.displayName);
            }
          } else {
            setProfilePic("");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("User not found, redirecting...");
        
        if (location.pathname !== "/logins") {
          navigate("/logins");
        }
        
        setUsername("");
        setEmail("");
        setProfilePic("");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <nav className="bg-blue-600 text-white shadow-md relative">
      <div className="w-full flex items-center justify-between px-6 py-2">
        <div className="flex items-center space-x-8">
          <span
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            Study<span className="text-black">Mate</span>
          </span>

          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-6 text-sm h-fit items-center">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `hover:text-gray-200 ${
                  isActive
                    ? " text-black text-white text-[16px] font-bold"
                    : "text-white"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/Settings"
              className={({ isActive }) =>
                `hover:text-gray-200 ${
                  isActive
                    ? " text-black text-white text-[16px] font-bold"
                    : "text-white"
                }`
              }
            >
              Settings
            </NavLink>
          </div>
        </div>

        {/* RIGHT: Bell + Profile */}
        <div className="hidden md:flex items-center space-x-4">
          <NotificationWrapper />
          
          {/* Conditional rendering: Only show profile if not loading and user exists */}
          {!loading && (
            <Link to="/userProfile">
              <div className="flex items-center space-x-2">
                <img
                  src={
                    profilePic ||
                    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg"
                  }
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-0"
                />
                <div className="text-sm leading-tight">
                  <p className="font-medium">{username || "User"}</p>
                  <p className="text-xs text-gray-200">{email}</p>
                </div>
              </div>
            </Link>
          )}
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
              src={
                profilePic ||
                "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg"
              }
              alt="User"
              className="w-30 h-30 rounded-full object-cover border-0"
            />
            <div className="w-full justify-items-center border-b border-blue-500 pb-5">
              <p className="font-medium">{username || "Guest"}</p>
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
            to="/Settings"
            className="block hover:text-gray-200"
            onClick={() => setIsOpen(false)}
          >
            Settings
          </Link>
        </div>
        <div
          onClick={handleLogout}
          className="flex items-center space-x-6 pt-4 border-t border-blue-500 pl-6 cursor-pointer"
        >
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