"use client"

import {
  createContext, useContext, useState, useEffect, type ReactNode, useCallback
} from "react"
import { useSession, signIn, signOut } from "next-auth/react"

interface AuthContextType {
    user: any;
    guilds: any[];
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    refreshGuilds: () => Promise<void>;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const [guilds, setGuilds] = useState([])
  const [error, setError] = useState<string | null>(null)

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  const fetchGuilds = useCallback(async () => {
    if (session?.accessToken) {
      try {
        const res = await fetch("/api/guilds");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch guilds');
        }
        const data = await res.json();
        setGuilds(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
  }, [session]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds])

  const value: AuthContextType = {
    user: session?.user,
    guilds,
    isLoading,
    isAuthenticated,
    error,
    login: () => signIn("discord"),
    logout: () => signOut(),
    refreshUser: async () => { await update() },
    refreshGuilds: fetchGuilds,
    clearError: () => setError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth precisa estar dentro do AuthProvider")
  return context
}