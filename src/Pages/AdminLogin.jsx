import React from "react";
import { Link } from "react-router";

function TeacherLogin() {
  return (
    <div className="flex justify-center flex-col items-center">
      <h1 className=" text-5xl font-bold text-red-600">Admin Login</h1>

      {/* button */}
      <Link
        className="bg-blue-600 text-amber-50 mt-16 p-4"
        to={"#"}
        onClick={() => showAlert()}
      >
        <h1>Show Admin pannel</h1>
      </Link>
    </div>
  );
}

const showAlert = () => {
  window.alert("Please make other pages befor go here 😒");
};

export default TeacherLogin;
