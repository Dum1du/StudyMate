import Navbar from "../NavigationBar";
import { IoCameraOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    // Show a loading message or redirect if not logged in
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex max-w-6xl mx-auto mt-10 space-x-6">
        {/* Sidebar */}
        <div className="w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === "overview"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === "activity"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`text-left px-3 py-2 rounded-md ${
                activeTab === "posts"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Posts
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center space-x-6">
            <div className="relative">
              <img
                src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
                alt="User"
                className="w-30 h-30 rounded-full object-cover border-0"
              />
              <div className="absolute bottom-0 right-0 rounded-full p-2 bg-white border-2 border-white cursor-pointer hover:bg-blue-500 group">
                <IoCameraOutline className="text-blue-500 text-sm group-hover:text-white transition-colors duration-200" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.displayName || "Not set"}
              </h2>
              <p className="text-gray-600">Faculty of Engineering</p>
              <p className="text-gray-500 text-sm">Joined 2021</p>
              <button className="bg-blue-600 text-white px-4 py-1 mt-2 rounded-md hover:scale-105">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Tabs Removed — Directly Show Section */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* About */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Faculty</span>
                      <span className="text-gray-800">
                        Faculty of Engineering
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Program</span>
                      <span className="text-gray-800">
                        B.Sc. in Engineering
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact</span>
                      <span className="text-gray-800">+94 77 123 4567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="text-gray-800">{user?.email}</span>
                    </div>
                  </div>
                </div>

                {/* Contributions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contributions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">15</p>
                      <p className="text-sm text-gray-500">Uploads</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-gray-800">42</p>
                      <p className="text-sm text-gray-500">Ratings Received</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "activity" && (
              <div className="text-center text-gray-500 py-8">
                No activity content yet.
              </div>
            )}

            {activeTab === "posts" && (
              <div className="text-center text-gray-500 py-8">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
