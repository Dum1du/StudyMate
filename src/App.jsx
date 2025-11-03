import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useCreateUserDoc from "./useCreateUserDoc";

function App() {
  useCreateUserDoc();

  return (
    <div>
      <h1>Main Page</h1>
    </div>
  );
}

export default App;
