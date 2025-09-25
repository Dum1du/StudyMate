import { Link } from "react-router";

function StartScreen() {
  return (
    <>
      <div className="flex justify-center flex-col items-center">
        <h1 className=" text-5xl font-bold text-red-600">Start Screen</h1>

        {/* buttons */}
        <Link className="bg-blue-600 text-amber-50 mt-16 p-4" to={"/logins"}>
          <h1>Student?</h1>
        </Link>
        <Link className="bg-cyan-800 text-amber-50 mt-16 p-4" to={"/logint"}>
          <h1>Teacher?</h1>
        </Link>
      </div>
    </>
  );
}

export default StartScreen;
