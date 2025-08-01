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
  global_name?: string
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
  error: string | null
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  refreshGuilds: () => Promise<void>
  clearError: () => void
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

// API Functions with better error handling
class SecureAPI {
  private static async handleResponse(response: Response): Promise<any> {
    const contentType = response.headers.get("content-type")
    const isJson = contentType && contentType.includes("application/json")
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      if (isJson) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          console.warn("Failed to parse error response as JSON")
        }
      }
      
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      
      throw new Error(errorMessage)
    }

    if (isJson) {
      return response.json()
    }
    
    return response.text()
  }

  static async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      return await this.handleResponse(response)
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
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
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const clearError = () => setError(null)

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const userData = await SecureAPI.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)

      // Load guilds in background
      loadGuilds()
    } catch (error) {
      console.error("Auth check failed:", error)
      
      if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
          // Token expired or invalid - clear auth state
          setUser(null)
          setGuilds([])
          setIsAuthenticated(false)
          setError(null) // Don't show error for expired tokens
        } else {
          setError(`Falha na autenticação: ${error.message}`)
        }
      } else {
        setError("Erro desconhecido na autenticação")
      }
      
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
      // Don't set error state for guild loading failures
      // as user is still authenticated
    }
  }

  const login = () => {
    if (!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.redirectUri) {
      setError(
        "Configuração OAuth2 do Discord não encontrada. Verifique as variáveis de ambiente NEXT_PUBLIC_DISCORD_CLIENT_ID e NEXT_PUBLIC_DISCORD_REDIRECT_URI."
      )
      return
    }

    try {
      clearError()
      const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Store state in sessionStorage for validation
      sessionStorage.setItem("oauth_state", state)

      const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        redirect_uri: DISCORD_CONFIG.redirectUri,
        response_type: "code",
        scope: DISCORD_CONFIG.scope,
        state,
        prompt: "consent", // Force consent to ensure fresh tokens
      })

      window.location.href = `https://discord.com/api/oauth2/authorize?${params}`
    } catch (error) {
      console.error("Login initiation failed:", error)
      setError("Falha ao iniciar login com Discord")
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      clearError()
      
      await SecureAPI.logout()
      
      // Clear all auth state
      setUser(null)
      setGuilds([])
      setIsAuthenticated(false)
      
      // Clear session storage
      sessionStorage.removeItem("oauth_state")
      
      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
      
      // Force logout even if API call fails
      setUser(null)
      setGuilds([])
      setIsAuthenticated(false)
      sessionStorage.removeItem("oauth_state")
      
      if (error instanceof Error) {
        setError(`Erro no logout: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      clearError()
      const userData = await SecureAPI.getCurrentUser()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        setUser(null)
        setIsAuthenticated(false)
        setGuilds([])
      } else if (error instanceof Error) {
        setError(`Erro ao atualizar usuário: ${error.message}`)
      }
    }
  }

  const refreshGuilds = async () => {
    try {
      clearError()
      const guildsData = await SecureAPI.getUserGuilds()
      setGuilds(guildsData)
    } catch (error) {
      console.error("Failed to refresh guilds:", error)
      
      if (error instanceof Error) {
        setError(`Erro ao carregar servidores: ${error.message}`)
      }
    }
  }

  const value: AuthContextType = {
    user,
    guilds,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refreshUser,
    refreshGuilds,
    clearError,
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