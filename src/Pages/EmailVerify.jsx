import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../firebase";
import { sendEmailVerification } from "firebase/auth";
import AlertModal from "../AlertModal"; // <-- Added import

function EmailVerify() {
  const [message, setMessage] = useState(
    "📨 Please check your inbox for a verification email."
  );
  const [checking, setChecking] = useState(true);
  const [resendBusy, setResendBusy] = useState(false);
  const [userPresent, setUserPresent] = useState(Boolean(auth.currentUser));
  const navigate = useNavigate();

  // --- ADDED ALERT STATE ---
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: "", 
    message: "", 
    type: "info",
    onConfirm: null 
  });

  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });
  // -------------------------

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
      setAlertConfig({
        isOpen: true,
        title: "Not Signed In",
        message: "You are not signed in. Please sign in again to resend the verification email.",
        type: "warning"
      });
      setUserPresent(false);
      return;
    }

    try {
      setResendBusy(true);
      await sendEmailVerification(auth.currentUser);
      
      // REPLACED INLINE MESSAGE WITH SUCCESS MODAL
      setAlertConfig({
        isOpen: true,
        title: "Email Sent!",
        message: "A new verification email has been sent to your inbox. Please check your spam folder if you don't see it.",
        type: "success"
      });
    } catch (error) {
      console.error("resend error:", error);
      
      // REPLACED INLINE MESSAGE WITH ERROR MODAL
      setAlertConfig({
        isOpen: true,
        title: "Error Sending Email",
        message: error.message || "Failed to resend verification email. Please try again later.",
        type: "error"
      });
    } finally {
      // cooldown to prevent spamming
      setTimeout(() => setResendBusy(false), 3000);
    }
  };

  return (
    <div>
      <div className="verify-page flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-xl font-semibold mb-2">Verify Your Email</h2>
        <p className="text-gray-700 max-w-md px-4">{message}</p>

        {checking && (
          <>
            <div className="mt-4 animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>

            <button
              onClick={resendVerification}
              disabled={!userPresent || resendBusy}
              className={`mt-6 px-4 py-2 rounded transition 
                ${
                  userPresent
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                } 
                ${resendBusy ? "opacity-50" : ""}`}
            >
              {resendBusy ? "Sending..." : "Resend Verification Email"}
            </button>
          </>
        )}
      </div>

      {/* NEW ALERT MODAL INJECTION */}
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

export default EmailVerify;