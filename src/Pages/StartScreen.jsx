import { Link } from "react-router";
import StartBg from "../Bg images/StartBg.png"; 

function StartScreen() {

  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(240, 244, 249, 0.9), rgba(240, 244, 249, 0.9)), url(${StartBg})`,
      }}
    >
      <div className="bg-white/20 backdrop-blur-md p-10 rounded-2xl text-center shadow-xl max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome To StudyMate!
        </h1>
        <p className="text-gray-600 mb-6">
          This is your collaborative learning space.
        </p>
        <div className="flex flex-col sm:flex-row sm:gap-4 sm:justify-center mt-5">
          <Link
            to={"/logins"}
            className="flex-1 block text-white bg-blue-600 hover:bg-blue-700 transition-all py-4 px-8 rounded-lg font-bold min-w-[180px] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Begin Collaboration
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;