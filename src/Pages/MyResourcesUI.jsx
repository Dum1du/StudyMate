import React from "react";
import Navbar from "../NavigationBar";

function MyResourcesUI() {
  return (
    <>
      <Navbar />
      <div className="flex justify-center flex-col items-center">
        <h1 className=" text-5xl font-bold text-red-600">My resources</h1>
      </div>
    </>
  );
}

export default MyResourcesUI;
