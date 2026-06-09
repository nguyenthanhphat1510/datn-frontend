"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiGetProfile, apiLogin, apiRegister } from "@/lib/auth-api";
import type { AuthUser } from "@/types/user";

const TOKEN_KEY = "access_token";
const USER_KEY = "user";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (token && userStr) {
        setUser(JSON.parse(userStr) as AuthUser);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = useCallback((token: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiLogin(email, password);
      persist(data.access_token, data.user);
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const data = await apiRegister(email, password, fullName);
      persist(data.access_token, data.user);
    },
    [persist],
  );

  const loginWithToken = useCallback(
    async (token: string) => {
      localStorage.setItem(TOKEN_KEY, token);
      const profile = await apiGetProfile(token);
      persist(token, profile);
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return ctx;
}
