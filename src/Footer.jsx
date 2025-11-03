import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-600 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="md:w-1/3">
            <Link to="/home" className="text-2xl font-bold inline-block">
              Study<span className="text-black">Mate</span>
            </Link>
            <p className="mt-3 text-sm text-blue-100/90 max-w-md">
              A friendly place to find and share study resources, join sessions and collaborate with peers.
            </p>

            <div className="mt-4 flex items-center space-x-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="Github"
                className="w-9 h-9 flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 transition"
              >
                <FaGithub />
              </a>
            </div>
          </div>

          {/* hide link columns on small screens to keep footer compact on mobile */}
          <div className="hidden md:grid grid-cols-3 gap-6 md:w-2/3">
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="text-sm space-y-2 text-blue-100/90">
                <li>
                  <Link to="/BrowseResources" className="hover:underline">
                    Browse Resources
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="hover:underline">
                    Upload Resources
                  </Link>
                </li>
                <li>
                  <Link to="/kuppisessions" className="hover:underline">
                    Kuppi Sessions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="text-sm space-y-2 text-blue-100/90">
                <li>
                  <Link to="/noticeboard" className="hover:underline">
                    Notices
                  </Link>
                </li>
                <li>
                  <Link to="/quizgenerator" className="hover:underline">
                    Quiz Generator
                  </Link>
                </li>
                <li>
                  <Link to="/myresources" className="hover:underline">
                    My Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="text-sm space-y-2 text-blue-100/90">
                <li>
                  <Link to="/settings" className="hover:underline">
                    Settings
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="hover:underline">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between text-sm text-blue-100">
          <span>© {new Date().getFullYear()} StudyMate. All rights reserved.</span>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
