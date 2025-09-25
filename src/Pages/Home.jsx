import React from "react";
import Navbar from "../NavigationBar";

function Home() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center flex-col items-center">
        <h1 className=" text-5xl font-bold text-red-600">Home</h1>
      </div>
    </>
  );
}

export default Home;
