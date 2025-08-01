import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  apiEndpoint: "https://discord.com/api/v10",
}

async function makeDiscordRequest(endpoint: string, accessToken: string) {
  console.log('[API] Making Discord request to:', endpoint)
  
  const response = await fetch(`${DISCORD_CONFIG.apiEndpoint}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "LostyoBot/1.0",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    console.error('[API] Discord API Error:', {
      status: response.status,
      statusText: response.statusText,
      endpoint,
    })

    if (response.status === 401) {
      throw new Error("UNAUTHORIZED")
    }
    
    let errorMessage = `Discord API Error: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorMessage
    } catch (e) {
      // Response is not JSON
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  console.log('[API] /api/me request started')
  
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value
    const cachedUser = cookieStore.get("discord_user")?.value

    console.log('[API] Cookie check:', {
      hasAccessToken: !!accessToken,
      hasCachedUser: !!cachedUser,
    })

    if (!accessToken) {
      console.log('[API] No access token found')
      return NextResponse.json(
        { error: "Not authenticated", code: "NO_ACCESS_TOKEN" }, 
        { status: 401 }
      )
    }

    // Return cached user if available and valid
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser)
        console.log('[API] Returning cached user data for:', userData.username)
        return NextResponse.json(userData)
      } catch (e) {
        console.warn('[API] Cached user data corrupted, fetching fresh data')
      }
    }

    try {
      console.log('[API] Fetching fresh user data from Discord')
      const userData = await makeDiscordRequest("/users/@me", accessToken)

      console.log('[API] User data fetched successfully:', {
        id: userData.id,
        username: userData.username,
        global_name: userData.global_name,
      })

      // Update cache
      const response = NextResponse.json(userData)
      response.cookies.set("discord_user", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hour
        path: "/",
      })

      return response
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        console.log('[API] Token expired/invalid, clearing auth cookies')
        
        const response = NextResponse.json(
          { 
            error: "Authentication expired", 
            code: "TOKEN_EXPIRED_OR_INVALID"
          }, 
          { status: 401 }
        )
        
        // Clear invalid tokens
        response.cookies.delete("discord_access_token")
        response.cookies.delete("discord_refresh_token")
        response.cookies.delete("discord_user")
        
        return response
      }

      throw error
    }
  } catch (error) {
    console.error('[API] Unexpected error in /api/me:', error)
    
    let errorMessage = "Failed to fetch user data"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: "SERVER_ERROR"
      }, 
      { status: 500 }
    )
  }
}