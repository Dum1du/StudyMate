import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { Link } from "react-router";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <span className="text-xl font-bold">
          Study<span className="text-black">Mate</span>
        </span>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 text-sm">
          <Link to="/home" className="hover:text-gray-200">
            Dashboard
          </Link>
          <Link to="/resources" className="hover:text-gray-200">
            Browse Resources
          </Link>
          <Link to="#" className="hover:text-gray-200">
            Quiz Generator
          </Link>
          <Link to="#" className="hover:text-gray-200">
            Settings
          </Link>
        </div>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          <button className="hover:text-gray-200">
            <Bell size={20} />
          </button>
          <div className="flex items-center space-x-2">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div className="text-sm leading-tight">
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-200">OUSL Student</p>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded hover:bg-blue-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-2 space-y-3">
          <a href="#" className="block hover:text-gray-200">
            Dashboard
          </a>
          <a href="#" className="block hover:text-gray-200">
            Browse Resources
          </a>
          <a href="#" className="block hover:text-gray-200">
            Quiz Generator
          </a>
          <a href="#" className="block hover:text-gray-200">
            Settings
          </a>
          <div className="flex items-center space-x-2 pt-2 border-t border-blue-500">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="User"
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <div className="text-sm leading-tight">
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-gray-200">OUSL Student</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
