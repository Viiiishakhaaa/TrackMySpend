import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import api, { setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore an existing session
  const restoreSession = useCallback(async () => {
    try {
      const response = await api.post("/auth/refresh");

      const token = response.data?.data?.accessToken;

      if (!token) {
        throw new Error("Access token was not returned");
      }

      setAccessToken(token);

      const userResponse = await api.get("/auth/me");
      setUser(userResponse.data.data.user);
    } catch (error) {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Login
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data?.data?.accessToken;

    if (!token) {
      throw new Error("Access token was not returned");
    }

    setAccessToken(token);

    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data.data.user);

    return userResponse.data.data.user;
  };

  // Register
  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    restoreSession,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};