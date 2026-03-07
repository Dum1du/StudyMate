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
import Settings from "./Pages/Settings.jsx";
import QuizeGenerator from "./Pages/QuizGenerator.jsx";
import NoticeBoard  from "./Pages/NoticeBoard.jsx";
import EmailVerify from "./Pages/EmailVerify.jsx";
import UploadResouces from "./Pages/UploadResouces.jsx";
import Discussions from "./Pages/Discussions.jsx";
import AdminRoute from "./AdminRoute.jsx";
import AdminDashboard from "./Pages/AdminDashboard.jsx";

import Layout from "./Layout.jsx";
import Dashboard from "./Pages/Home.jsx";
import ResourcePage from "./ResourceWindow.jsx";
import { ResourcesProvider } from "./ResourcesContext.jsx";


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
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },

  {
    element: <Layout/>,
    children: [
      {
        path: "/resources",
        element: <MyResourcesUI />,
      },
        {path:"/home", element:<Home/>},
        {path:"/browseresources", element:<BrowseResources/>},
   
      {
        path: "/userProfile",
        element: <UserProfile />,
      },
      {
        path: "/kuppisessions",
        element: <KuppiSession />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "quizeGenerator",
        element: <QuizeGenerator/>
      },
      {
        path: "/noticeboard",
        element: <NoticeBoard />
      },
      {
        path:"/verify",
        element: <EmailVerify />
      },
      {
        path:"/upload",
        element:<UploadResouces />
      },
      {
        path:"/discussions",
        element:<Discussions />
      },
      {
        path:"/material/:resourceId",
        element:<ResourcePage />
      },
    ],
  },
 
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ResourcesProvider>
    <RouterProvider router={router} />
    </ResourcesProvider>
  </StrictMode>
);
