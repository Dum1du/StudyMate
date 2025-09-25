import React from "react";
import { Link } from "react-router";

function RegisterUI() {
  return (
    <div className="flex justify-center flex-col items-center">
      <h1 className=" text-5xl font-bold text-red-600">Register Window</h1>

      {/* button */}
      <Link className="bg-blue-600 text-amber-50 mt-16 p-4" to={"/home"}>
        <h1>Register</h1>
      </Link>
    </div>
  );
}

export default RegisterUI;
