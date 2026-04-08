import { createBrowserRouter, Navigate } from "react-router-dom";
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
import HackerVerification from "../pages/HackerVerification.jsx";
import OrganizationVerification from "../pages/OrganizationVerification.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import FindingDetails from "../pages/FindingDetails.jsx";
import HackerLayout from "../layouts/HackerLayout.jsx";

// Phase 2 Marketplace Imports
import EngagementBoard from "../pages/EngagementBoard.jsx";
import MyApplications from "../pages/MyApplications.jsx";
import Projects from "../pages/Projects.jsx";

// Phase 17 Onboarding Imports
import OnboardingGuard from "../components/OnboardingGuard.jsx";
import OnboardingLayout from "../layouts/OnboardingLayout.jsx";
import HackerOnboarding from "../pages/Onboarding/HackerOnboarding.jsx";
import OrgOnboarding from "../pages/Onboarding/OrgOnboarding.jsx";

// Phase 18 Admin Imports
import ApprovalsDashboard from "../pages/Admin/ApprovalsDashboard.jsx";
import OperatorReview from "../pages/Admin/OperatorReview.jsx";
import OrgReview from "../pages/Admin/OrgReview.jsx";
import DashboardPreview from "../pages/DashboardPreview.jsx";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "preview-dashboard",
        element: <DashboardPreview />,
      },
      {
        index: true,
        element: <Landing />,
      },
      // ── Hacker routes (sidebar layout) ──────────────────────────────
      {
        element: <OnboardingGuard><HackerLayout /></OnboardingGuard>,
        children: [
          {
            path: "dashboard",
            element: <DashboardPreview />,
          },
          {
            path: "hacker-profile",
            element: <HackerProfile />,
          },
          {
            path: "hacker-verification",
            element: <HackerVerification />,
          },
          {
            path: "projects",
            element: <Projects />,
          },
          {
            path: "findings/:findingId",
            element: <FindingDetails />,
          },
          {
            path: "engagements",
            element: <EngagementBoard />,
          },
          {
            path: "my-applications",
            element: <MyApplications />,
          },
        ],
      },
      // ── Org-admin routes (no hacker sidebar) ────────────────────────
      {
        element: <OnboardingGuard><Home /></OnboardingGuard>,
        children: [],
      },
      {
        path: "org-dashboard",
        element: <OnboardingGuard><Home /></OnboardingGuard>,
      },
      {
        path: "organization-profile",
        element: <OnboardingGuard><OrganizationProfile /></OnboardingGuard>,
      },
      {
        path: "organization-verification/:organizationId",
        element: <OnboardingGuard><OrganizationVerification /></OnboardingGuard>,
      },
      {
        path: "workflows/:workflowId",
        element: <OnboardingGuard><WorkflowEditor /></OnboardingGuard>,
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
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Navigate to="/register/hacker" replace />,
          },
          {
            path: "register/hacker",
            element: <Register />,
          },
          {
            path: "register/organization",
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
