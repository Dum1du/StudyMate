import Navbar from "../NavigationBar";
import { IoCameraOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { MdLogout } from "react-icons/md";
import { useNavigate } from "react-router";
import { doc, updateDoc, getDoc } from "firebase/firestore";

function UserProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image || !user) return;
    setUploading(true);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { profilePicture: image });

      // ✅ Instantly update local user state to show the new profile pic
      setUser((prevUser) => ({
        ...prevUser,
        profilePicture: image,
      }));

      alert("Profile picture updated successfully!");
      setPreview(null);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload picture!");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/logins");
    } catch (error) {
      console.error("Logout failed!", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // derive join month & year from Auth metadata
        const joinDate = new Date(currentUser.metadata.creationTime);
        const joinMonth = joinDate.toLocaleString("default", { month: "long" });
        const joinYear = joinDate.getFullYear();

        // reference to Firestore document
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          // merge Auth + Firestore data
          setUser({
            ...currentUser,
            ...docSnap.data(),
            joinedMonth: docSnap.data().joinedMonth || joinMonth,
            joinedYear: docSnap.data().joinedYear || joinYear,
          });
        } else {
          // if Firestore doc doesn’t exist yet
          setUser({
            ...currentUser,
            joinedMonth: joinMonth,
            joinedYear: joinYear,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
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

      {/* Desktop View */}
      <div className="hidden md:flex max-w-6xl mx-auto mt-10 space-x-6 px-4">
        {/* Sidebar */}
        <div className="w-64 bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="flex flex-col space-y-3">
            {["overview", "posts"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-left px-3 py-2 rounded-md capitalize ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            onClick={handleLogout}
            className="flex items-center space-x-6 border-none bg-gray-50 p-2 justify-center rounded-2xl mt-45 hover:scale-105 cursor-pointer"
          >
            <div>
              <MdLogout className="size-6" />
            </div>
            <div className="text-m leading-tight">
              <p className="font-medium">Log Out</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Header */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center space-x-6">
            <div className="relative">
              <img
                src={
                  preview ||
                  user.profilePicture ||
                  "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
                }
                alt="User"
                className="w-30 h-30 rounded-full object-cover border-0"
              />
              <label className="absolute bottom-0 right-0 rounded-full p-2 bg-white border-2 border-white cursor-pointer hover:bg-blue-500 group">
                <IoCameraOutline className="text-blue-500 text-sm group-hover:text-white transition-colors duration-200" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {preview && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md"
              >
                {uploading ? "Saving..." : "Save Picture"}
              </button>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user.displayName || user.email || "Not set"}
              </h2>
              <p className="text-gray-600">Faculty of Engineering</p>
              <p className="text-gray-500 text-sm">
                Joined {user?.joinedYear} {user?.joinedMonth}
              </p>
              <button className="bg-blue-600 text-white px-4 py-1 mt-2 rounded-md hover:scale-105">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
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

            {activeTab === "posts" && (
              <div className="text-center text-gray-500 py-8">
                No posts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden px-4 mt-6">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center space-x-6">
          <div className="relative">
            <img
              src={
                preview ||
                user.profilePicture ||
                "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
              }
              alt="User"
              className="w-30 h-30 rounded-full object-cover border-0"
            />
            <label className="absolute bottom-0 right-0 rounded-full p-2 bg-white border-2 border-white cursor-pointer hover:bg-blue-500 group">
              <IoCameraOutline className="text-blue-500 text-sm group-hover:text-white transition-colors duration-200" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {preview && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded-md"
            >
              {uploading ? "Saving..." : "Save Picture"}
            </button>
          )}

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {user.displayName || user.email || "Not set"}
            </h2>
            <p className="text-gray-600 text-sm">Faculty of Engineering</p>
            <p className="text-gray-500 text-xs">
              Joined {user?.joinedYear} {user?.joinedMonth}
            </p>

            <button className="bg-blue-600 text-white px-4 py-1 mt-2 rounded-md">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Tabs (Mobile Only) */}
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <div className="flex border-b border-gray-200 mb-6">
            {["overview", "posts"].map((tab) => (
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

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6">
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
                    <span className="text-gray-800">B.Sc. in Engineering</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-800">{user.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contributions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">15</p>
                    <p className="text-sm text-gray-500">Uploads</p>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">42</p>
                    <p className="text-sm text-gray-500">Ratings</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="text-center text-gray-500 py-8">
              No {activeTab} content yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserProfile;
