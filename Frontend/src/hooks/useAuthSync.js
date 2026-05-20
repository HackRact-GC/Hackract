import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

import { useAuth } from "../context/authContext.jsx";
import useApi from "./useApi";

const useAuthSync = () => {
  const { isAuthenticated, isLoading, user: auth0User } = useAuth0();
  const { user: localUser, setUser } = useAuth();
  const api = useApi();

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && !isLoading && !localUser) {
        try {
          const { data } = await api.get("/auth/me");
          if (data?.data?.user) {
            setUser(data.data.user);
            console.log("User state synchronized with AuthContext.");
          }
        } catch (error) {
          console.error("Backend synchronization failed:", error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, isLoading, api, auth0User, localUser, setUser]);
};

export default useAuthSync;
