

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import apiClient from "@/services/apiService";

interface User {
  id: string;
  email: string;
  country?: string
  fullName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl?: string;
  subscription?: 'free' | 'pro' | 'enterprise';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  signOut: () => void;
  checkAuth: (authToken: string) => Promise<void>;
  builderFiles: File[];
  setBuilderFiles: (files: File[]) => void;
  prompt: string | null;
  setPrompt: (prompt: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [builderFiles, setBuilderFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const isAuthenticated = !!user && !!token;

  const isPublicPage = (path: string) => {
    return (
      path === "/" ||
      path.startsWith("/auth/") ||
      path.startsWith("/privacy-policy") ||
      path.startsWith("/terms-of-service") ||
      path.startsWith("/builder")
    );
  };

  const checkAuth = useCallback(async (authToken: string) => {
    try {
      const response = await apiClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
      setToken(authToken);
      localStorage.setItem("token", authToken);
    } catch (error) {
      console.error("Auth check failed:", error);
      signOut();
      if (!isPublicPage(location.pathname)) {
        navigate("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array as checkAuth doesn't depend on external state that changes

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      checkAuth(storedToken);
    } else {
      setLoading(false);
      if (!isPublicPage(pathname)) {
        navigate("/auth/login");
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicPage(pathname)) {
      navigate("/auth/login");
    }
  }, [isAuthenticated, loading, pathname, navigate, isPublicPage]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      const redirectUrl = localStorage.getItem("redirectUrl");
      localStorage.removeItem("redirectUrl");
      navigate(redirectUrl || "/dashboard");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/register", { email, password, fullName });
      toast.success("Account created successfully! Please log in.");
      navigate("/auth/login");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Signup failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      login,
      signup,
      logout,
      signOut,
      checkAuth,
      builderFiles,
      setBuilderFiles,
      prompt,
      setPrompt,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
