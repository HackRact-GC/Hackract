import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import useApi from "./useApi";

const useAuthSync = () => {
    const { isAuthenticated, isLoading, user } = useAuth0();
    const api = useApi();

    useEffect(() => {
        const syncUser = async () => {
            if (isAuthenticated && !isLoading) {
                try {
                    // This call triggers the 'protect' middleware on the backend
                    // which handles the PostgreSQL user creation/sync logic.
                    await api.get("/auth/me");
                    console.log("User synchronized with backend database.");
                } catch (error) {
                    console.error("Backend synchronization failed:", error);
                }
            }
        };

        syncUser();
    }, [isAuthenticated, isLoading, api, user]);
};

export default useAuthSync;
