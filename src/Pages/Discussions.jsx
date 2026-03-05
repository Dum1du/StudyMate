import React, { useState } from "react";
import Discuss from "../Discuss.jsx";
import Navbar from "../NavigationBar.jsx"; 

function Discussion() {
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: "Supun",
      message: "Here is the lecture notes PDF for reference.",
      time: "2 hours ago",
      pdfUrl: "https://example.com/lecture1.pdf",
      courseName: "Data Structures and Algorithms",
      courseCode: "EEI4465",
    },
    {
      id: 2,
      user: "Dumidu",
      message: "Important tips from yesterday's session.",
      time: "1 hour ago",
      pdfUrl: "",
      courseName: "OOP",
      courseCode: "EEI3262",
    },
    {
      id: 3,
      user: "Asitha",
      message: "Check out this new study guide PDF!",
      time: "30 mins ago",
      pdfUrl: "https://example.com/guide.pdf",
      courseName: "OOD",
      courseCode: "EEI4362",
    },
  ]);

  return (
    <div>

      <div className="max-w-3xl mx-auto mt-6 p-5">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">Discussions</h2>

        
        {posts.map((post) => (
          <Discuss
            key={post.id}
            user={post.user}          
            message={post.message}
            time={post.time}
            pdfUrl={post.pdfUrl}
            courseName={post.courseName}
            courseCode={post.courseCode}
          />
        ))}
      </div>
    </div>
  );
}

export default Discussion;
