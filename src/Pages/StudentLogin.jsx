import React from "react";
import { Link } from "react-router";

function StudentLogin() {
  return (
    <div className="flex justify-center flex-col items-center">
      <h1 className=" text-5xl font-bold text-red-600">Student Login</h1>
      

      {/* button */}
      <Link className="bg-blue-600 text-amber-50 mt-5 p-4" to={"/home"}>
        <h1>Login</h1>
      </Link>
      <h1 className="mt-16">New User?</h1>
      <Link className="bg-blue-600 text-amber-50 mt-2  p-4" to={"/register"}>
        <h1>Register</h1>
      </Link>
    </div>
  );
}

export default StudentLogin;
