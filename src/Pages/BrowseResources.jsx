import React, { useState, useEffect } from "react";
import { Search, Star } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Navbar from "../NavigationBar";
import Footer from "../Footer";

export default function BrowseResources() {
  const [search, setSearch] = useState("");

  const resources = [
    {
      id: "res-1",
      title: "Introduction to Programming Notes",
      description: "A comprehensive set of notes covering the basics of programming.",
      uploader: "Anjali Silva",
      rating: 4.5,
      reviews: 23,
      image: "https://via.placeholder.com/120x80?text=Programming",
    },
    {
      id: "res-2",
      title: "Calculus I Practice Problems",
      description: "A collection of practice problems to help you master Calculus I concepts.",
      uploader: "Chamara Perera",
      rating: 4.2,
      reviews: 18,
      image: "https://via.placeholder.com/120x80?text=Calculus",
    },
    {
      id: "res-3",
      title: "Linear Algebra Cheat Sheet",
      description: "A handy cheat sheet with key formulas and theorems for Linear Algebra.",
      uploader: "Dinil Fernando",
      rating: 4.8,
      reviews: 35,
      image: "https://via.placeholder.com/120x80?text=Algebra",
    },
    {
      id: "res-4",
      title: "Data Structures and Algorithms Slides",
      description: "Lecture slides from the DSA course, perfect for revision.",
      uploader: "Kavindu Rajapaksha",
      rating: 4.6,
      reviews: 28,
      image: "https://via.placeholder.com/120x80?text=DSA",
    },
  ];

  const filteredResources = resources.filter((res) =>
    res.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder */}
      <Navbar />

      {/* Main content */}
      <main className="max-w-6xl mx-auto py-10 px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Browse Resources</h2>
        <p className="text-gray-600 mb-6">Find the study materials you need to succeed.</p>

        {/* Search bar */}
        <div className="flex items-center border border-gray-300 rounded-lg shadow-sm bg-white p-2 mb-6">
          <Search className="text-gray-500 ml-2" size={18} />
          <input
            type="text"
            aria-label="Search resources"
            placeholder="Search for lecture notes, past papers, etc."
            className="w-full p-2 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["Course", "Subject", "Material Type", "Tags"].map((filter) => (
            <button
              key={filter}
              className="border border-gray-300 rounded-md px-4 py-1 text-sm hover:bg-gray-100"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Search Results</h3>

        <div className="space-y-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-green-100 p-4 rounded-lg flex items-center gap-4 shadow-sm hover:bg-green-200 transition"
            >
              <img src={res.image} alt={res.title} className="w-24 h-16 rounded-md object-cover" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{res.title}</h4>
                <p className="text-sm text-gray-600 mb-1">{res.description}</p>
                <p className="text-xs text-gray-500">
                  Uploaded by <span className="font-medium">{res.uploader}</span>
                </p>
              </div>
              <div className="flex items-center text-yellow-500 text-sm">
                <Star size={16} className="text-yellow-400" />
                <span className="ml-1 text-gray-800">
                  {res.rating} <span className="text-gray-500">({res.reviews} reviews)</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-2">
          {[1, 2, 3, "...", 10].map((num, i) => (
            <button
              key={i}
              aria-current={num === 1 ? "page" : undefined}
              className={`px-3 py-1 rounded-md text-sm ${
                num === 1
                  ? "bg-blue-700 text-white"
                  : "bg-white border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// AuthHeader removed in favor of shared `Navbar` which displays user info
