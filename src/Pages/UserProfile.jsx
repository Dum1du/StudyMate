import Navbar from "../NavigationBar";
import { IoCameraOutline } from "react-icons/io5";

function UserProfile() {
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
          <div className="absolute bottom-0 right-0 rounded-full p-2 bg-white border-2 border-white cursor-pointer hover:bg-blue-600">
            <IoCameraOutline className="text-blue-500 text-sm" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            Nadeesha Perera
          </h2>
          <p className="text-gray-600">Faculty of Engineering</p>
          <p className="text-gray-500 text-sm">Joined 2021</p>
          <button className="bg-blue-600 hover:cursor-pointer text-white px-4 py-1 mt-2 rounded-md font-small">
            Edit Profile
          </button>
        </div>
      </div>
    </>
  );
}
export default UserProfile;
