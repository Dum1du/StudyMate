import React, { useState, useEffect } from "react";
import Navbar from "../NavigationBar"; 
import Footer from "../Footer";       
import { auth, db } from "../firebase";
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaChevronRight, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/logo.png";
import AlertModal from "../AlertModal"; // <-- Added AlertModal Import

// logout
const SettingItem = ({ title, subtitle, onClick, isRed }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition duration-200 mb-4 ${isRed ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
  >
    <div className="flex items-center gap-4">
      <div>
        <h3 className={`font-medium text-lg ${isRed ? 'text-red-600' : 'text-gray-800'}`}>{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
    <div className={isRed ? 'text-red-500' : 'text-gray-400'}>
      {isRed ? <FaSignOutAlt /> : <FaChevronRight />}
    </div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  </div>
);

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); 

  // Form States
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); 
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

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

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsNotifEnabled(docSnap.data().notificationsEnabled ?? true);
        }
      }
    };
    fetchSettings();
  }, [user]);

  // UPGRADED: Added confirmation modal before logging out!
  const handleLogout = () => {
    setAlertConfig({
      isOpen: true,
      title: "Confirm Logout",
      message: "Are you sure you want to log out of StudyMate?",
      type: "warning",
      onConfirm: async () => {
        try {
          await signOut(auth);
          navigate("/logins");
        } catch (error) {
          console.error("Logout Error:", error);
        } finally {
          closeAlert();
        }
      }
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Create credential for re-authentication
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);

    try {
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      // REPLACED SUCCESS ALERT
      setAlertConfig({
        isOpen: true,
        title: "Password Updated",
        message: "Your password has been updated successfully!",
        type: "success"
      });
      
      setActiveModal(null);
      setNewPassword("");
      setCurrentPassword("");
    } catch (error) {
      console.error("Password Update Error:", error);
      
      // REPLACED ERROR ALERT
      setAlertConfig({
        isOpen: true,
        title: "Update Failed",
        message: error.message || "Failed to update password. Please check your current password and try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async () => {
    const newState = !isNotifEnabled;
    setIsNotifEnabled(newState);
    
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { notificationsEnabled: newState });
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* SECTION 1: ACCOUNT */}
        <div className="mb-8">
          <h2 className="text-gray-500 font-semibold mb-3 uppercase text-sm tracking-wider ml-1">Account</h2>
          <SettingItem 
            title="Change Password" 
            onClick={() => setActiveModal('password')} 
          />
        </div>

        {/* SECTION 2: NOTIFICATIONS */}
        <div className="mb-8">
          <h2 className="text-gray-500 font-semibold mb-3 uppercase text-sm tracking-wider ml-1">Notifications</h2>
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div>
              <h3 className="font-medium text-lg text-gray-800">Notification Preferences</h3>
              <p className="text-sm text-gray-500">Receive notifications for new resources and updates.</p>
            </div>
            <button 
              onClick={toggleNotification}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${isNotifEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isNotifEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* SECTION 3: PRIVACY */}
        <div className="mb-8">
          <h2 className="text-gray-500 font-semibold mb-3 uppercase text-sm tracking-wider ml-1">Privacy</h2>
          <SettingItem 
            title="Privacy Policy" 
            onClick={() => setActiveModal('privacy')} 
          />
        </div>

        {/* SECTION 4: GENERAL */}
        <div className="mb-8">
          <h2 className="text-gray-500 font-semibold mb-3 uppercase text-sm tracking-wider ml-1">General</h2>
          <SettingItem 
            title="About StudyMate" 
            onClick={() => setActiveModal('about')} 
          />
          <SettingItem 
            title="Log Out" 
            isRed 
            onClick={handleLogout} 
          />
        </div>
      </div>
      
      {/* --- MODALS --- */}
      {activeModal === 'password' && (
        <Modal title="Change Password" onClose={() => setActiveModal(null)}>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password" 
                required 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required for verification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input 
                type="password" 
                required 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-2 font-medium"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Modal>
      )}

      {activeModal === 'privacy' && (
        <Modal title="Privacy Policy" onClose={() => setActiveModal(null)}>
          <div className="text-gray-600 space-y-3 max-h-[60vh] overflow-y-auto">
            <p><strong>Last Updated:</strong> Oct 2025</p>
            <p>Your privacy is important to us. StudyMate collects data solely for educational resource sharing.</p>
            <ul className="list-disc pl-5">
              <li>We do not share your personal data with third parties.</li>
              <li>Uploaded files are accessible to other students in your batch.</li>
              <li>You can request account deletion at any time.</li>
            </ul>
          </div>
        </Modal>
      )}

      {activeModal === 'about' && (
        <Modal title="About StudyMate" onClose={() => setActiveModal(null)}>
          <div className="text-center">
            <img 
              src={logo} 
              alt="StudyMate Logo" 
              className="w-24 h-24 mx-auto mb-4 object-contain" 
            />
            
            <h4 className="text-xl font-bold text-gray-800">StudyMate v1.0</h4>
            <p className="text-gray-500 mt-2">
              A dedicated platform for OUSL students to share and access study materials efficiently.
            </p>
            <p className="text-sm text-gray-400 mt-6">© {currentYear} StudyMate Inc.</p>
          </div>
        </Modal>
      )}

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

export default Settings;