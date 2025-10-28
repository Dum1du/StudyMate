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
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center space-x-6 mt-25">
        <div className="relative">
          <img
            src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-
              person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-
              templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
            alt="User"
            className="w-30 h-30 rounded-full object-cover border-0"
          />
          <div className="absolute bottom-0 right-0 rounded-full p-2 bg-white border-2 border-white cursor-pointer hover:bg-blue-500 group">
            <IoCameraOutline className="text-blue-500 text-sm group-hover:text-white transition-colors duration-200" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {user.displayName || "Not set"}
          </h2>
          <p className="text-gray-600">Faculty of Engineering</p>
          <p className="text-gray-500 text-sm">Joined 2021</p>
          <button className="bg-blue-600 hover:cursor-pointer text-white px-4 py-1 mt-2 rounded-md font-small hover:scale-105">
            Edit Profile
          </button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {["overview", "posts", "activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-4 py-2 text-sm font-medium cursor-pointer ${
                activeTab === tab
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Faculty</span>
                  <span className="text-gray-800">Faculty of Engineering</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Program</span>
                  <span className="text-gray-800">B.Sc. in Engineering</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span className="text-gray-800">+94 77 123 4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-800">{user.email}</span>
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

        {/* Placeholder for other tabs */}
        {activeTab !== "overview" && (
          <div className="text-center text-gray-500 py-8">
            No {activeTab} content yet.
          </div>
        )}
      </div>
    </>
  );
}
export default UserProfile;
