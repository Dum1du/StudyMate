import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import StartScreen from "./Pages/StartScreen.jsx";
import StudentLogin from "./Pages/StudentLogin.jsx";
import TeacherLogin from "./Pages/AdminLogin.jsx";
import RegisterUI from "./Pages/RegisterUI.jsx";
import Home from "./Pages/Home.jsx";
import MyResourcesUI from "./Pages/MyResourcesUI.jsx";
import BrowseResources from "./Pages/BrowseResources.jsx";
import UserProfile from "./Pages/UserProfile.jsx";
import KuppiSession from "./Pages/KuppiSessions.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartScreen />,
  },
  {
    path: "/logins",
    element: <StudentLogin />,
  },
  {
    path: "/logint",
    element: <TeacherLogin />,
  },
  { path: "/register", element: <RegisterUI /> },
  {
    path: "/home",
    element: <Home />,
  },
  {
    path: "/resources",
    element: <MyResourcesUI />,
  },
  {
    path: "/browseResources",
    element: <BrowseResources />,
  },
  {
    path: "/userProfile",
    element: <UserProfile />,
  },
  {
    path: "/kuppisessions",
    element: <KuppiSession />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
