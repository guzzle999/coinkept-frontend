import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clearError = () => setError(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      apiService.setToken(token);
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("accessToken");
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiService.login(credentials);

      apiService.setToken(response.accessToken);
      setUser(response.user);

      return { success: true, user: response.user };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      if (!response.success) {
        return { success: false, message: response.message };
      }
      apiService.setToken(response.accessToken);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      apiService.setToken(null);
      setUser(null);
      setError(null);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await apiService.forgotPassword(email);
      return { success: true, message: response.message };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    clearError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
