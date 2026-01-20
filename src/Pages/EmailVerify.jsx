import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";

function EmailVerify() {
  const [message, setMessage] = useState(
    "📨 Please check your inbox for a verification email."
  );
  const [checking, setChecking] = useState(true);
  const [resendBusy, setResendBusy] = useState(false);
  const [userPresent, setUserPresent] = useState(Boolean(auth.currentUser));
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (!auth.currentUser) {
        setUserPresent(false);
        return;
      }
      setUserPresent(true);

      await auth.currentUser.reload(); // refresh user data
      if (auth.currentUser.emailVerified) {
        clearInterval(intervalId);
        setChecking(false);
        setMessage("✅ Email verified! Redirecting to home...");
        setTimeout(() => navigate("/home"), 1200);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const resendVerification = async () => {
    if (!auth.currentUser) {
      setMessage(
        "You are not signed in. Please sign in again to resend the verification email."
      );
      setUserPresent(false);
      return;
    }

    try {
      setResendBusy(true);
      // CORRECT USAGE: pass the user to the standalone function
      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email re-sent! Check your inbox 📧");
    } catch (error) {
      console.error("resend error:", error);
      setMessage(error.message || "Failed to resend verification email.");
    } finally {
      // cooldown to prevent spamming
      setTimeout(() => setResendBusy(false), 3000);
    }
  };

  return (
    <div>
      <div className="verify-page flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-xl font-semibold mb-2">Verify Your Email</h2>
        <p className="text-gray-700">{message}</p>

        {checking && (
          <>
            <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>

            <button
              onClick={resendVerification}
              disabled={!userPresent || resendBusy}
              className={`mt-6 px-4 py-2 rounded transition 
                ${
                  userPresent
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                } 
    ${resendBusy ? "opacity-50" : ""}`}
            >
              {resendBusy ? "Sending..." : "Resend Verification Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerify;
