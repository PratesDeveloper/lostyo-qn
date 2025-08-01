import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  apiEndpoint: "https://discord.com/api/v10",
}

async function makeDiscordRequest(endpoint: string, accessToken: string) {
  console.log('[DEBUG] Making Discord request to:', endpoint)
  console.log('[DEBUG] Access token:', accessToken ? `${accessToken.substring(0, 5)}...` : 'MISSING')

  try {
    const response = await fetch(`${DISCORD_CONFIG.apiEndpoint}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      let errorBody = {}
      try {
        errorBody = await response.json()
      } catch (e) {
        console.error('[DEBUG] Failed to parse error response:', e)
      }
      
      console.error('[DEBUG] Discord API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries()),
        errorBody,
      })

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      throw new Error(`Discord API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('[DEBUG] Request failed:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  console.log('[DEBUG] /api/user request started')
  
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value
    const refreshToken = cookieStore.get("discord_refresh_token")?.value
    const cachedUser = cookieStore.get("discord_user")?.value

    console.log('[DEBUG] Cookie check:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCachedUser: !!cachedUser,
      allCookies: cookieStore.getAll().map(c => c.name)
    })

    if (!accessToken) {
      console.error('[DEBUG] 401: No access token in cookies')
      return NextResponse.json(
        { error: "Not authenticated", code: "NO_ACCESS_TOKEN" }, 
        { status: 401 }
      )
    }

    // Return cached user if available
    if (cachedUser) {
      try {
        console.log('[DEBUG] Returning cached user data')
        return NextResponse.json(JSON.parse(cachedUser))
      } catch (e) {
        console.error('[DEBUG] Cached user data corrupted:', e)
      }
    }

    try {
      console.log('[DEBUG] Fetching fresh user data from Discord')
      const userData = await makeDiscordRequest("/users/@me", accessToken)

      console.log('[DEBUG] User data fetched successfully:', {
        id: userData.id,
        username: userData.username,
      })

      // Update cache
      const response = NextResponse.json(userData)
      response.cookies.set("discord_user", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600,
        path: "/",
      })

      return response
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        console.error('[DEBUG] 401 Unauthorized - Potential causes:', {
          tokenExpired: true,
          tokenInvalid: true,
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL: process.env.VERCEL,
            DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? "set" : "not set",
            DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET ? "set" : "not set",
          },
          requestDetails: {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
          }
        })

        // Clear invalid tokens
        const response = NextResponse.json(
          { 
            error: "Authentication expired", 
            code: "TOKEN_EXPIRED_OR_INVALID",
            solution: "Reauthenticate with Discord"
          }, 
          { status: 401 }
        )
        
        response.cookies.delete("discord_access_token")
        response.cookies.delete("discord_refresh_token")
        response.cookies.delete("discord_user")
        
        console.log('[DEBUG] Cleared auth cookies due to 401')
        return response
      }

      console.error('[DEBUG] Unexpected error:', error)
      throw error
    }
  } catch (error) {
    console.error('[DEBUG] Critical error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    })
    
    return NextResponse.json(
      { 
        error: "Failed to fetch user data",
        code: "SERVER_ERROR"
      }, 
      { status: 500 }
    )
  }
}