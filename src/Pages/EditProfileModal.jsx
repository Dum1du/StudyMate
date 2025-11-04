// EditProfileModal.jsx
import { useState } from "react";

function EditProfileModal({ user, onClose, onSave }) {
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
    // Modal Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
