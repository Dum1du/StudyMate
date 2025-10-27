import Navbar from "../NavigationBar";
function UserProfile() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center w-full h-50 mt-25">
        <div className="shadow-2xl w-250 h-50 border-s-black rounded-2xs items-center">
          <div className="justify-items-left h-full mt-8 ml-10 border-blue-500">
            <img
              src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-
              person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-
              templatex9xa_719432-2190.jpg?semt=ais_hybrid&w=740&q=80"
              alt="User"
              className="w-40 h-40 rounded-full border-2 border-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}
export default UserProfile;
