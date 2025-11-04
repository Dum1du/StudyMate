import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useCreateUserDoc from "./useCreateUserDoc";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import BrowseResources from "./Pages/BrowseResources";

function App() {
  useCreateUserDoc();

  return (
    <div></div>
  );
}

export default App;
