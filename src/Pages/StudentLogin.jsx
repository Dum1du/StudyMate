import React from "react";
import { Link } from "react-router";
import StartBg from "../Bg images/StartBg.png";
import { FaUser } from "react-icons/fa";
import { SlLock } from "react-icons/sl";

function StudentLogin() {
  return (
    <div
      className="flex justify-center items-center min-h-screen w-full bg-cover bg-center font-sans"
      style={{
        backgroundImage: `linear-gradient(rgba(240, 244, 249, 0.9), rgba(240, 244, 249, 0.9)), url(${StartBg})`,
      }}
    >
      <div className="bg-white/20 backdrop-blur-md p-10 rounded-2xl text-center shadow-xl max-w-lg w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome Back !
        </h1>
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-15 mb-1 mx-1">
            OUSL Student ID / Email
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your student ID or email"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
            />
            {/* Icon inside */}
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your Password"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
            />
            {/* Icon inside */}
            <SlLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <Link className="text-blue-600 py-3 w-full flex justify-end">
          <h1>Forgot your password?</h1>
        </Link>
        <div className="flex justify-center flex-col items-center">
          {/* button */}
          <Link
            className="bg-blue-600 text-amber-50 mt-8 py-3 w-full rounded-lg"
            to={"/home"}
          >
            <h1>Log in</h1>
          </Link>
        </div>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4 text-gray-500">Don't have an account?</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <div className="flex justify-center flex-col items-center">
          {/* button */}
          <Link
            className="text-gray-800 py-3 w-full border-1 border-gray-800 rounded-lg"
            to={"/register"}
          >
            <h1>Register new account</h1>
          </Link>
        </div>
      </div>
    </div>
    // <div className="flex justify-center flex-col items-center">
    //   <h1 className=" text-5xl font-bold text-red-600">Student Login</h1>

    //   button
    //   <Link className="bg-blue-600 text-amber-50 mt-5 p-4" to={"/home"}>
    //     <h1>Login</h1>
    //   </Link>
    //   <h1 className="mt-16">New User?</h1>
    //   <Link className="bg-blue-600 text-amber-50 mt-2  p-4" to={"/register"}>
    //     <h1>Register</h1>
    //   </Link>
    // </div>
  );
}

export default StudentLogin;
