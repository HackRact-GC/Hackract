import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
/* eslint-disable react-refresh/only-export-components */
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  ACCESS: "hackract_access_token",
  REFRESH: "hackract_refresh_token",
};

export const AuthProvider = ({ children }) => {
  const { isAuthenticated, logout: auth0Logout } = useAuth0();
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(STORAGE_KEYS.ACCESS));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(STORAGE_KEYS.REFRESH));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(localStorage.getItem(STORAGE_KEYS.ACCESS)));

  const persistTokens = useCallback((nextAccess, nextRefresh) => {
    if (nextAccess) {
      localStorage.setItem(STORAGE_KEYS.ACCESS, nextAccess);
      setAccessToken(nextAccess);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACCESS);
      setAccessToken(null);
    }

    if (nextRefresh) {
      localStorage.setItem(STORAGE_KEYS.REFRESH, nextRefresh);
      setRefreshToken(nextRefresh);
    } else {
      localStorage.removeItem(STORAGE_KEYS.REFRESH);
      setRefreshToken(null);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    const storedAccess = localStorage.getItem(STORAGE_KEYS.ACCESS);
    if (!storedAccess) {
      setIsBootstrapping(false);
      return;
    }
    try {
      // axiosConfig interceptor auto-attaches the Bearer token
      const { data } = await api.get('/auth/local/me');
      setUser(data?.data?.user || null);
    } catch (error) {
      console.error('[auth] fetchProfile failed — clearing session', error?.response?.status);
      // Clear BOTH tokens so the refresh interceptor has nothing stale to retry
      persistTokens(null, null);
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, [persistTokens]);

  // Only run once on mount — axiosConfig handles token attachment/refresh from here
  useEffect(() => {
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extractMessage = (error) => {
    const detail = error?.response?.data?.details?.errors?.[0]?.message;
    return (
      detail ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong"
    );
  };

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/local/login", credentials);
        const { user: loggedInUser, tokens } = data.data;
        persistTokens(tokens.accessToken, tokens.refreshToken);
        setUser(loggedInUser);
        toast.success("Logged in successfully");
        return data.data;
      } catch (error) {
        toast.error(extractMessage(error));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistTokens]
  );

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/local/register", payload);
        console.info("[auth] registration success", data);
        const { data: payloadData, message: topMessage } = data || {};
        const { user: newUser, tokens, message: nestedMessage } = payloadData || {};
        const successMessage = nestedMessage || topMessage || "Registration successful. Please verify your email.";

        if (tokens?.accessToken && tokens?.refreshToken) {
          persistTokens(tokens.accessToken, tokens.refreshToken);
          setUser(newUser);
        } else {
          persistTokens(null, null);
          setUser(null);
        }

        toast.success(successMessage);
        return payloadData;
      } catch (error) {
        console.error("[auth] registration failed", error?.response?.data || error);
        toast.error(extractMessage(error));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistTokens]
  );

  const refreshTokens = useCallback(async () => {
    if (!refreshToken) throw new Error("No refresh token available");
    const { data } = await api.post("/auth/local/refresh", { refreshToken });
    const { tokens, user: refreshedUser } = data.data;
    persistTokens(tokens.accessToken, tokens.refreshToken);
    if (refreshedUser) setUser(refreshedUser);
    return tokens.accessToken;
  }, [persistTokens, refreshToken]);

  const logout = useCallback(async (options = {}) => {
    const { skipAuth0Redirect = false } = options;
    try {
      if (refreshToken) {
        const { data } = await api.post("/auth/logout", { refreshToken });
        const message = data?.message || "Logged out from local session";
        toast.success(message);
      } else {
        toast.success("Logged out");
      }
    } catch (error) {
      console.warn("Logout warning:", error?.message);
      toast.error("Logout failed. Clearing local session.");
    } finally {
      persistTokens(null, null);
      setUser(null);
      if (isAuthenticated && !skipAuth0Redirect) {
        auth0Logout({
          logoutParams: {
            returnTo: `${window.location.origin}/login`,
          },
        });
      }
    }
  }, [persistTokens, refreshToken, isAuthenticated, auth0Logout]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading: loading || isBootstrapping,
      login,
      register,
      logout,
      refreshTokens,
      setUser,
    }),
    [user, accessToken, refreshToken, loading, isBootstrapping, login, register, logout, refreshTokens]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
