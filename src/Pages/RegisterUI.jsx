import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import StartBg from "../Bg images/StartBg.png";
import { FaUser } from "react-icons/fa";
import { AiOutlineMail } from "react-icons/ai";
import { SlLock } from "react-icons/sl";
import { auth, db } from "../firebase";
import AlertModal from "../AlertModal"; 

function RegisterUI() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfiPass, setConfirPass] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !name || !password || !confirmPassword) {
      setAlertConfig({
        isOpen: true,
        title: "Missing Fields",
        message: "Please fill all the fields before registering!",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    // --- Check for Student OR Teacher Email ---
    const isStudent = email.startsWith("s") && email.endsWith("@ousl.lk");
    const isTeacher = email.endsWith("@ou.ac.lk") || email === "wijerathneasitha@gmail.com";

    if (!isStudent && !isTeacher && email !== "wijerathneasitha@gmail.com") {
      setAlertConfig({
        isOpen: true,
        title: "Invalid Email",
        message: "Please use a valid OUSL student (@ousl.lk) or teacher (@ou.ac.lk) email.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setAlertConfig({
        isOpen: true,
        title: "Password Mismatch",
        message: "The passwords you entered do not match!",
        type: "warning"
      });
      setLoading(false);
      return;
    } else {
      if (confirmPassword.length <= 5) {
        setAlertConfig({
          isOpen: true,
          title: "Weak Password",
          message: "Your password must be at least 6 characters long.",
          type: "warning"
        });
        setLoading(false);
        return;
      }
    }

    try {
      const userCredintials = await createUserWithEmailAndPassword(
        auth,
        email,
        confirmPassword
      );

      await updateProfile(userCredintials.user, {
        displayName: name,
      });

      const user = userCredintials.user;
      
      // Determine the role based on the email domain
      const role = isTeacher ? "teacher" : "student";

      // Pass the role to Firestore
      await addUserToFirestore(user, role);

      await sendEmailVerification(user);
      console.log("Email verification sent");

      console.log("User registered:", userCredintials.user);
      navigate("/verify");
    } catch (err) {
      let errorMsg = "An unexpected error occurred. Please try again.";
      
      if (typeof err?.message === "string") {
        if (
          err.message.includes("email-already-in-use") ||
          err.message.includes("auth/email-already-in-use")
        ) {
          errorMsg = "This email address is already registered to an account.";
        } else if (
          err.message.includes("invalid-email") ||
          err.message.includes("auth/invalid-email")
        ) {
          errorMsg = "The email address is improperly formatted.";
        } else if (
          err.message.includes("weak-password") ||
          err.message.includes("auth/weak-password")
        ) {
          errorMsg = "The password provided is too weak.";
        } else {
          errorMsg = err.message;
        }
      }
      
      setAlertConfig({
        isOpen: true,
        title: "Registration Failed",
        message: errorMsg,
        type: "error"
      });
      
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  // --- Added 'role' parameter to save to database ---
  const addUserToFirestore = async (user, role) => {
    const joinDate = new Date(user.metadata.creationTime);
    const joinMonth = joinDate.toLocaleString("default", { month: "long" });
    const joinYear = joinDate.getFullYear();

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      role: role, // Saves "teacher" or "student"
      joinedMonth: joinMonth,
      joinedYear: joinYear,
      createdAt: serverTimestamp(),
    });
  };

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
              OUSL Email
            </label>
            <div className="relative">
              <input
                id="mail"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                type="text"
                placeholder="Enter your OUSL email"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
                required
              />
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
              <SlLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

              {password && (
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 p-1.5"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              )}
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
              <SlLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />

              {confirmPassword && (
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 p-1.5"
                  type="button"
                  onClick={() => setConfirPass((prev) => !prev)}
                >
                  {showConfiPass ? "Hide" : "Show"}
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-center flex-col items-center">
            <button
              className="bg-blue-600 text-amber-50 mt-8 py-3 w-full rounded-lg hover:bg-blue-700 transition"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Create an account"}
            </button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4 text-gray-500">Already have an account?</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <div className="flex justify-center flex-col items-center">
          <Link
            className="text-gray-800 py-3 w-full border-1 border-gray-800 rounded-lg hover:bg-gray-100 transition"
            to={"/logins"}
          >
            <h1>Log in</h1>
          </Link>
        </div>
      </div>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}

export default RegisterUI;