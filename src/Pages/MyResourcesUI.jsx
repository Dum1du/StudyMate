import React, { useState } from "react";
import Navbar from "../NavigationBar"; // Adjust path if needed

const MyResourcesUI = () => {
  // Sample state for comments and ratings
  const [comments, setComments] = useState([
    { user: "Nimal Perera", text: "Excellent notes!", time: "2 weeks ago" },
    { user: "Priya Fernando", text: "Very detailed and well-organized.", time: "1 month ago" },
  ]);

  const [newComment, setNewComment] = useState("");

  const [ratings] = useState([5, 4, 3, 2, 1]); // static ratings for table
  const percentMap = { 5: 40, 4: 30, 3: 15, 2: 10, 1: 5 }; // sample percentages

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      setComments([...comments, { user: "You", text: newComment, time: "Just now" }]);
      setNewComment("");
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 px-10 py-8 lg:px-20 bg-gray-50 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Resource Card */}
          <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Operating Systems - Lecture Notes
                </h1>
                <p className="text-gray-600 max-w-2xl">
                  Comprehensive lecture notes covering all key concepts of Operating Systems. Prepared by Dr. Silva.
                </p>
              </div>
              <button className="flex items-center gap-2 min-w-[84px] rounded-md h-11 px-5 bg-blue-600 text-white text-sm font-bold shadow-sm hover:bg-blue-700">
                <span className="truncate">Download</span>
              </button>
            </div>

            <div className="mt-8 border rounded-lg overflow-hidden">
              <iframe className="w-full h-[600px]" src="" title="Resource Viewer"></iframe>
            </div>
          </div>

          {/* Comments Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div className="bg-[#94F687] p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Comments</h3>
                <div className="space-y-6">
                  {comments.map((c, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0 mt-1" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ZtLz6ml-9BUL4CpXPe5Y-SdMk-QYuFw1rNyHBH6otwKxZGJu9-JxCoHuJnts4GrVKPjApxAZ04OnbUbzm4QwTxmo_9qLFbqIAbMxeoGlri21C0DXb6KGRIi3syAchj-xA_hnYUbvUlRcC9L1oFPPNDbKwC72hmgJseHVtlHnRZ2elP1Mmn9pUvtivcdccEqdUTuPBP4GvfT5yoGtSnBtcKOGMcEUo_b_6_onwHWXNTuBrbftV1CW1tozFYA_LelFihfMekoGD8y")' }}></div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-bold text-gray-800">{c.user}</p>
                          <p className="text-xs text-gray-500">{c.time}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment Box */}
                <div className="mt-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-white form-textarea w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition"
                    placeholder="Add your comment..."
                    rows="4"
                  ></textarea>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleAddComment}
                      className="flex items-center gap-2 min-w-[84px] rounded-md h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
                    >
                      <span className="truncate">Add Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Uploaded by */}
              <div className="p-8 rounded-lg shadow-sm mb-8" style={{ backgroundColor: "#A0F7FA" }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Uploaded by</h3>
                <div className="flex items-center gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14"
                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACfZKvViF5CWMhCd3AAY55bJ-e5B7b0ZHWYNdRyFsMsUFYkmo9PUPYkZhz7LV2EHWvQyetE9sVX_hLJiKtAaTJnW_KmGGlmfg20Vc2412D34QbS1AjFli2HG_FaXdnkfScFL8sunxjuEJbtRzXj8WdfXl9XNvBlK6IjDs_r6duLhZcIwwEfWuL3CQ2vyyF-qjSkh60nn2l41sB7E_GSEism1v4KZo6UEXYRKWowBXPPcT41ne4OzBo1zqYtTkiOz3NBpa5B83kiHjg")' }}
                  ></div>
                  <div>
                    <p className="text-gray-800 text-base font-semibold">Dr. Silva</p>
                    <p className="text-gray-500 text-sm">Computer Science</p>
                  </div>
                </div>
              </div>

              {/* Rating Table */}
              <div className="bg-[#DAA2F0] p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rating</h3>
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-4xl font-bold text-gray-900">4.5</p>
                  <div className="flex flex-col">
                    <div className="flex text-yellow-400">  
                      <span className="material-symbols-outlined text-gray-300">star</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Based on 12 reviews</p>
                  </div>
                </div>

                {/* Rating table */}
                <div className="space-y-2">
                  {ratings.map((star) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">{star}</span>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full">
                        <div
                          className="h-1.5 bg-yellow-400 rounded-full"
                          style={{ width: `${percentMap[star]}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-500 text-xs w-8 text-right">{percentMap[star]}%</span>
                    </div>
                  ))}
                </div>

                <button className="mt-6 w-full flex items-center justify-center gap-2 min-w-[84px] rounded-md h-10 px-4 bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200">
                  <span className="material-symbols-outlined">star_rate</span>
                  Rate Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default MyResourcesUI;
