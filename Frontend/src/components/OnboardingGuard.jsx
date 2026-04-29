import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

const HACKER_READY_STATUSES = new Set(["SUBMITTED", "UNDER_REVIEW", "APPROVED"]);

const OnboardingGuard = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="text-[#00c477] font-mono animate-pulse tracking-widest uppercase">Validating Session...</div>
            </div>
        );
    }

    if (!user) {
        // Redirect completely unauthenticated users to login
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    const roles = user.roles?.map(r => r.type) || [];
    const isPentester = roles.includes('PENTESTER');
    const isOrgAdmin = roles.includes('ORG_ADMIN');

    let needsOnboarding = false;
    let targetOnboardingRoute = '/onboarding';

    if (isPentester) {
        // Evaluate HackerProfile status
        const profile = user.hackerProfile;
        const status = profile?.status;
        if (!profile || !HACKER_READY_STATUSES.has(status)) {
            needsOnboarding = true;
            targetOnboardingRoute = '/onboarding/hacker';
        }
    } else if (isOrgAdmin) {
        // Evaluate Organization status
        const orgs = user.organizations || [];
        if (orgs.length === 0) {
            needsOnboarding = true;
            targetOnboardingRoute = '/onboarding/organization';
        }
    }

    // Is the user already trying to access an onboarding route?
    const isOnboardingRoute = location.pathname.startsWith('/onboarding');

    if (isOnboardingRoute) {
        // If they don't need onboarding anymore, push them to the role-based dashboard
        if (!needsOnboarding) {
            const destination = isPentester ? '/hacker-dashboard' : '/dashboard';
            return <Navigate to={destination} replace />;
        }
        // Otherwise let them render the onboarding page
        return <>{children}</>;
    }

    // If they need onboarding but are trying to access a protected route (like /dashboard)
    if (needsOnboarding) {
        return <Navigate to={targetOnboardingRoute} replace />;
    }

    // All clear, render the protected component
    return <>{children}</>;
};

export default OnboardingGuard;
