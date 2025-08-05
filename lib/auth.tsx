"use client"

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react"
import { useSession, signIn, signOut } from "next-auth/react"

export const AuthContext = createContext(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [guilds, setGuilds] = useState([])
  const [error, setError] = useState(null)

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    if (session?.accessToken) {
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((res) => res.json())
        .then(setUser)
        .catch((err) => setError(err.message))

      fetch("/api/guilds", {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then((res) => res.json())
        .then(setGuilds)
        .catch((err) => setError(err.message))
    }
  }, [session])

  const value = {
    user,
    guilds,
    isLoading,
    isAuthenticated,
    error,
    login: () => signIn("discord"),
    logout: () => signOut(),
    refreshUser: async () => {}, // opcional
    refreshGuilds: async () => {}, // opcional
    clearError: () => setError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth precisa estar dentro do AuthProvider")
  return context
}
