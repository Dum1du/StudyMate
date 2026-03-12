import { useState } from "react";

function EditProfileModal({ user, onClose, onSave, onRemovePhoto }) {
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    faculty: user.faculty || "",
    program: user.program || "",
    contact: user.contact || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all animate-in zoom-in-95">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="faculty"
              className="block text-sm font-medium text-gray-700"
            >
              Faculty
            </label>
            <input
              type="text"
              name="faculty"
              id="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g., Faculty of Engineering"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="program"
              className="block text-sm font-medium text-gray-700"
            >
              Program
            </label>
            <input
              type="text"
              name="program"
              id="program"
              value={formData.program}
              onChange={handleChange}
              placeholder="e.g., B.Sc. in Engineering"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700"
            >
              Contact Number
            </label>
            <input
              type="tel"
              name="contact"
              id="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="e.g., +94 77 123 4567"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 mt-6 border-t border-gray-100">
            <div>
              {user.profilePicture && (
                <button
                  type="button"
                  onClick={onRemovePhoto}
                  className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>

            {/* Cancel and Save Buttons */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;