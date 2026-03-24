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
import OrganizationDashboard from "../pages/OrganizationDashboard.jsx";
import HackerDashboard from "../pages/HackerDashboard.jsx";
import WorkflowEditor from "../pages/WorkflowEditor/WorkflowEditor.jsx";
import HackerVerification from "../pages/HackerVerification.jsx";
import OrganizationVerification from "../pages/OrganizationVerification.jsx";
import Onboarding from "../pages/Onboarding.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
<<<<<<< HEAD
import Projects from "../pages/Projects.jsx";
import ProjectWorkspace from "../pages/ProjectWorkspace.jsx";

// Phase 17 Onboarding Imports
import OnboardingGuard from "../components/OnboardingGuard.jsx";
import OnboardingLayout from "../layouts/OnboardingLayout.jsx";
import HackerOnboarding from "../pages/Onboarding/HackerOnboarding.jsx";
import OrgOnboarding from "../pages/Onboarding/OrgOnboarding.jsx";

// Phase 18 Admin Imports
import ApprovalsDashboard from "../pages/Admin/ApprovalsDashboard.jsx";
import OperatorReview from "../pages/Admin/OperatorReview.jsx";
import OrgReview from "../pages/Admin/OrgReview.jsx";
=======
import LegalAgreementCreate from "../pages/LegalAgreementCreate.jsx";
>>>>>>> origin/main

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
        element: <OnboardingGuard><Home /></OnboardingGuard>,
      },
      {
        path: "hacker-profile",
        element: <OnboardingGuard><HackerProfile /></OnboardingGuard>,
      },
      {
        path: "hacker-dashboard",
        element: <HackerDashboard />,
      },
      {
        path: "hacker-verification",
        element: <OnboardingGuard><HackerVerification /></OnboardingGuard>,
      },
      {
        path: "organization-profile",
        element: <OnboardingGuard><OrganizationProfile /></OnboardingGuard>,
      },
      {
        path: "organization-dashboard",
        element: <OrganizationDashboard />,
      },
      {
        path: "organization-verification/:organizationId",
        element: <OnboardingGuard><OrganizationVerification /></OnboardingGuard>,
      },
      {
        path: "onboarding",
        element: <Onboarding />,
      },
      {
        path: "workflows/:workflowId",
        element: <OnboardingGuard><WorkflowEditor /></OnboardingGuard>,
      },
      {
        path: "projects",
        element: <OnboardingGuard><Projects /></OnboardingGuard>,
      },
      {
        path: "projects/:projectId",
        element: <OnboardingGuard><ProjectWorkspace /></OnboardingGuard>,
      },
      {
        path: "onboarding",
        element: <OnboardingGuard><OnboardingLayout /></OnboardingGuard>,
        children: [
            {
                path: "hacker",
                element: <HackerOnboarding />,
            },
            {
                path: "organization",
                element: <OrgOnboarding />,
            }
        ]
      },
      {
        path: "admin/approvals",
        element: <OnboardingGuard><ApprovalsDashboard /></OnboardingGuard>,
      },
      {
        path: "admin/approvals/hacker/:id",
        element: <OnboardingGuard><OperatorReview /></OnboardingGuard>,
      },
      {
        path: "admin/approvals/org/:id",
        element: <OnboardingGuard><OrgReview /></OnboardingGuard>,
      },
      {
        path: "legal-agreements/new",
        element: <LegalAgreementCreate />,
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
