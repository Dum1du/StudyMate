import { MdLogout } from "react-icons/md";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router";
import Navbar from "../NavigationBar";

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/logins");
    } catch (error) {
      console.error("Logout failed!", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Settings
          </h1>

          {/* Account Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Account
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl">
                <p className="font-medium text-gray-800">Change Password</p>
                <span className="text-gray-400 text-lg">›</span>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Notifications
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl">
                <p className="font-medium text-gray-800">
                  Notification Preferences
                </p>
                <p className="text-sm text-gray-500">
                  Receive notifications for new resources, course updates, and
                  community activity.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              Privacy
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 rounded-t-xl">
                <p className="font-medium text-gray-800">Privacy Policy</p>
                <span className="text-gray-400 text-lg">›</span>
              </div>
            </div>
          </div>

          {/* General Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">
              General
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                <p className="font-medium text-gray-800">About StudyMate</p>
                <span className="text-gray-400 text-lg">›</span>
              </div>

              <div
                onClick={handleLogout}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 rounded-b-xl"
              >
                <p className="font-medium text-red-500">Log Out</p>
                <MdLogout className="text-red-500 text-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
