"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { api, setAuthToken } from "@/services/api";
import { useContext } from "react";

export type UserRole = "ADMIN" | "SELLER" | "BUYER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        setAuthToken(token);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post("/auth/login", { email, password });
    const { user, token } = response.data.data;

    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    setAuthToken(token);

    return user;
  };

  const logout = () => {
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const checkAuth = async (): Promise<User> => {
    const response = await api.get("/auth/me");
    const user = response.data.data;
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        setUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
