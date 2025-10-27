import React, { useState } from "react";
import { Link,  useNavigate } from "react-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import StartBg from "../Bg images/StartBg.png";
import { FaUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { SlLock } from "react-icons/sl";
import {  auth } from "../firebase";

function RegisterUI() {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfiPass, setConfirPass] = useState(false);
  
  const handleRegister = async (e) =>{
    e.preventDefault();
    setLoading(true);
    setError("");

    if(!email || !name || !password || !confirmPassword){
      setError("Please fill all the fields!");
      setLoading(false);
      return;
    }

    if(!email.startsWith("s") || !email.endsWith("@ousl.lk")){
      setError("Please use a Valid OUSL email");
      setLoading(false);
      return;
    }

    if(password != confirmPassword){
        setError("Passwords not matching!")
        setLoading(false);
         return;
    }else{
      if (confirmPassword.length <= 5){
        setError("Passwords at least need 6 characters")
        setLoading(false);
         return;
      }
    }
    

    try{

      const userCredintials = await createUserWithEmailAndPassword(auth, email, confirmPassword);

      await updateProfile(userCredintials.user, {
        displayName: name,
      })

      console.log("User registered:", userCredintials.user);
      navigate("/home")

    }catch(err){

      if (typeof err?.message === "string") {
    if (err.message.includes("email-already-in-use") || err.message.includes("auth/email-already-in-use")) {
      setError("This email already have an account");
    } else if (err.message.includes("invalid-email") || err.message.includes("auth/invalid-email")) {
      setError("auth/invalid-email");
    } else if (err.message.includes("weak-password") || err.message.includes("auth/weak-password")) {
      setError("auth/weak-password");
    }
  }
        console.error(err);  // setError(err.message);
    }finally{
      setLoading(false);
    }
  }

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
        <p className="text-gray-600">
          Sign in to access your collaborative learning space
        </p>
      <form onSubmit={handleRegister}>
        {/* email */}
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-10 mb-1 mx-1">
            OUSL Student ID / Email
          </label>
          <div className="relative">
            <input
            id="mail"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              type="text"
              placeholder="Enter your student ID or email"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
              required
            />
            {/* Icon inside */}
            <AiOutlineMail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* name */}
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Name
          </label>
          <div className="relative">
            <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your name"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
              required
            />
            {/* Icon inside */}
            <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

      {/* password */}
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Create Password
          </label>
          <div className="relative">
            <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your Password"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
              required
            />
            {/* Icon inside */}
            <SlLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

            {password && (<button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 p-1.5"
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            >
            {
              showPassword ? "Hide" : "Show"
            }
            
            </button>)} 

          </div>
        </div>

        {/* confirm password */}
        <div className="w-full max-w-md">
          <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
            Re-Enter Password
          </label>
          <div className="relative">
            <input
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
              type={showConfiPass ? "text" : "password"}
              placeholder="Enter your Password"
              className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
              required
            />
            {/* Icon inside */}
            <SlLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

            {confirmPassword && (<button className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 p-1.5"
            type="button"
            onClick={() => setConfirPass((prev) => !prev)}
            >
            {
              showConfiPass ? "Hide" : "Show"
            }
            
            </button>)}   


          </div>
        </div>


        <div className="flex justify-center flex-col items-center">
          {/* button */}
          <button
            className="bg-blue-600 text-amber-50 mt-8 py-3 w-full rounded-lg hover:bg-blue-700 transition"
            type="submit"
              disabled={loading}
                   >
            {loading ? "Registering..." : "Create an account"}
             </button>
          
        </div>
</form>
            <p className="text-red-700 text-[14px]">{error}</p>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4 text-gray-500">Already have an account?</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <div className="flex justify-center flex-col items-center">
          {/* button */}
          <Link
            className="text-gray-800 py-3 w-full border-1 border-gray-800 rounded-lg"
            to={"/logins"}
          >
            <h1>Log in</h1>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterUI;
