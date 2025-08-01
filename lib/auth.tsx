"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"

// Types
export interface User {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
  locale?: string
  mfa_enabled?: boolean
  premium_type?: number
  public_flags?: number
}

export interface Guild {
  id: string
  name: string
  icon: string | null
  iconUrl: string | null
  owner: boolean
  permissions: string
  permissions_new: string
  features: string[]
  hasBot: boolean
  memberCount: number
}

export interface AuthContextType {
  user: User | null
  guilds: Guild[]
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshGuilds: () => Promise<void>
}

// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "",
  scope: "identify email guilds",
}

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null)

// Utility functions
export const getAvatarUrl = (userId: string, avatarHash: string | null, size = 128): string => {
  if (!avatarHash) {
    const defaultAvatarNumber = Number.parseInt(userId) % 5
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${avatarHash.startsWith("a_") ? "gif" : "png"}?size=${size}`
}

// API Functions
class SecureAPI {
  static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(endpoint, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `API Error: ${response.status}`)
    }

    return response.json()
  }

  static async getCurrentUser(): Promise<User> {
    return this.makeRequest("/api/me")
  }

  static async getUserGuilds(): Promise<Guild[]> {
    return this.makeRequest("/api/guilds")
  }

  static async refreshToken(): Promise<void> {
    await this.makeRequest("/api/auth/refresh", { method: "POST" })
  }

  static async logout(): Promise<void> {
    await this.makeRequest("/api/auth/logout", { method: "POST" })
  }
}

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      const userData = await SecureAPI.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)

      // Load guilds in background
      loadGuilds()
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setGuilds([])
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGuilds = async () => {
    try {
      const guildsData = await SecureAPI.getUserGuilds()
      setGuilds(guildsData)
    } catch (error) {
      console.error("Failed to load guilds:", error)
    }
  }

  const login = () => {
    if (!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.redirectUri) {
      console.error(
        "Discord OAuth2 not configured. Please set NEXT_PUBLIC_DISCORD_CLIENT_ID and NEXT_PUBLIC_DISCORD_REDIRECT_URI environment variables.",
      )
      return
    }

    const state = Math.random().toString(36).substring(2, 15)
    sessionStorage.setItem("oauth_state", state)

    const params = new URLSearchParams({
      client_id: DISCORD_CONFIG.clientId,
      redirect_uri: DISCORD_CONFIG.redirectUri,
      response_type: "code",
      scope: DISCORD_CONFIG.scope,
      state,
    })

    window.location.href = `https://discord.com/api/oauth2/authorize?${params}`
  }

  const logout = async () => {
    try {
      await SecureAPI.logout()
      setUser(null)
      setGuilds([])
      setIsAuthenticated(false)
      sessionStorage.removeItem("oauth_state")
    } catch (error) {
      console.error("Logout failed:", error)
      // Force logout even if API call fails
      setUser(null)
      setGuilds([])
      setIsAuthenticated(false)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await SecureAPI.getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        setUser(null)
        setIsAuthenticated(false)
      }
    }
  }

  const refreshGuilds = async () => {
    try {
      const guildsData = await SecureAPI.getUserGuilds()
      setGuilds(guildsData)
    } catch (error) {
      console.error("Failed to refresh guilds:", error)
    }
  }

  const value: AuthContextType = {
    user,
    guilds,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    refreshGuilds,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export API for external use
export { SecureAPI }
