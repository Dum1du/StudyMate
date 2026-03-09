import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import StartBg from "../Bg images/StartBg.png";
import { FaUser } from "react-icons/fa";
import { SlLock } from "react-icons/sl";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AlertModal from "../AlertModal"; 

function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const userlogingHelper = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      setAlertConfig({
        isOpen: true,
        title: "Missing Fields",
        message: "Please fill all the fields before logging in!",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    // --- FIXED: Separated the .endsWith() check from the === check ---
    const isStudent = email.startsWith("s") && email.endsWith("@ousl.lk");
    const isTeacher = email.endsWith("@ou.ac.lk") || email === "wijerathneasitha@gmail.com";

    if (!isStudent && !isTeacher) {
      setAlertConfig({
        isOpen: true,
        title: "Invalid Email",
        message: "Please enter a valid OUSL student (@ousl.lk) or teacher (@ou.ac.lk) email.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    if (password.length <= 5) {
      setAlertConfig({
        isOpen: true,
        title: "Invalid Password",
        message: "Check the password again! It must be at least 6 characters.",
        type: "warning"
      });
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Logged in:", userCredential.user);
      const user = userCredential.user;

      await user.reload();

      if (user.emailVerified) {
        console.log("Email verified — proceed to dashboard");
        navigate("/home");
      } else {
        console.log("Email not verified");
        setAlertConfig({
          isOpen: true,
          title: "Email Not Verified",
          message: "Please verify your email before logging in. Check your inbox or spam folder.",
          type: "warning"
        });
        await auth.signOut(); 
      }
    } catch (err) {
      console.error("Login error:", err);

      let errorMsg = "Something went wrong. Please try again later.";
      switch (err.code) {
        case "auth/user-not-found":
          errorMsg = "No account found for this email.";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          errorMsg = "Incorrect email or password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMsg = "Please enter a valid email address.";
          break;
        default:
          errorMsg = "Something went wrong. Please try again later.";
      }

      setAlertConfig({
        isOpen: true,
        title: "Login Failed",
        message: errorMsg,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
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
          Welcome Back !
        </h1>

        <form onSubmit={userlogingHelper}>
          {/* Email */}
          <div className="w-full max-w-md">
            <label className="font-medium flex justify-start mt-15 mb-1 mx-1">
              OUSL Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                placeholder="Enter your OUSL email"
                required
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
              />
              <FaUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="w-full max-w-md">
            <label className="font-medium flex justify-start mt-5 mb-1 mx-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your Password"
                className="w-full border border-gray-400 rounded-lg pl-4 pr-10 py-2 focus:outline-none"
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
          <Link className="text-blue-600 py-3 w-full flex justify-end">
            <h1>Forgot your password?</h1>
          </Link>
          <div className="flex justify-center flex-col items-center">
            <button
              type="submit"
              className="bg-blue-600 text-amber-50 mt-8 py-3 w-full rounded-lg hover:bg-blue-700 transition"
              disabled={loading}
            >
              <h1>{loading ? "Logging in..." : "Log in"}</h1>
            </button>
          </div>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-400"></div>
          <span className="mx-4 text-gray-500">Don't have an account?</span>
          <div className="flex-grow border-t border-gray-400"></div>
        </div>
        <div className="flex justify-center flex-col items-center">
          <Link
            className="text-gray-800 py-3 w-full border-1 border-gray-800 rounded-lg hover:bg-gray-100 transition"
            to={"/register"}
          >
            <h1>Register new account</h1>
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

export default StudentLogin;