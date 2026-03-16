// src/routes/index.jsx or similar

import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import VerifyEmail from "../pages/VerifyEmail.jsx";
import Home from "../pages/Home.jsx";
import Landing from "../pages/Landing.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import HackerProfile from "../pages/HackerProfile.jsx";
import OrganizationProfile from "../pages/OrganizationProfile.jsx";
import WorkflowEditor from "../pages/WorkflowEditor/WorkflowEditor.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "dashboard",
        element: <Home />,
      },
      {
        path: "hacker-profile",
        element: <HackerProfile />,
      },
      {
        path: "organization-profile",
        element: <OrganizationProfile />,
      },
      {
        path: "workflows/:workflowId",
        element: <WorkflowEditor />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
          {
            path: "verify-email",
            element: <VerifyEmail />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password",
            element: <ResetPassword />,
          },
        ]
      },
    ]
  },
]);

export default router;
