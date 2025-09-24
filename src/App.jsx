import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import "./NavigationBar";
import "./index.css";

import NavigationBar from "./NavigationBar";

function App() {
  return (
    <>
      <NavigationBar />
      <h1>Main Page</h1>
    </>
  );
}

export default App;
