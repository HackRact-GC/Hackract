import { useAuth0 } from "@auth0/auth0-react";
import api from "../api/axiosConfig";
import { useEffect } from "react";

const useApi = () => {
    const { getAccessTokenSilently, isAuthenticated } = useAuth0();

    useEffect(() => {
        const interceptor = api.interceptors.request.use(
            async (config) => {
                if (isAuthenticated) {
                    try {
                        const token = await getAccessTokenSilently();
                        config.headers.Authorization = `Bearer ${token}`;
                    } catch (error) {
                        console.error("Error getting transition token", error);
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(interceptor);
        };
    }, [getAccessTokenSilently, isAuthenticated]);

    return api;
};

export default useApi;
