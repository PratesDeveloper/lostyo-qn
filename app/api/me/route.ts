import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  apiEndpoint: "https://discord.com/api/v10",
}

async function makeDiscordRequest(endpoint: string, accessToken: string) {
  const url = `${DISCORD_CONFIG.apiEndpoint}${endpoint}`
  console.log(`Making Discord request to: ${url}`)
  
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`Discord API Error (${response.status}) for ${url}:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries()),
      })

      if (response.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      throw new Error(`Discord API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error(`Network error while making Discord request to ${url}:`, error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  console.log("GET /api/user invoked")
  
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value
    const cachedUser = cookieStore.get("discord_user")?.value

    console.log("Auth check:", {
      hasAccessToken: !!accessToken,
      hasCachedUser: !!cachedUser,
      cookieNames: cookieStore.getAll().map(c => c.name)
    })

    if (!accessToken) {
      console.error("No access token found in cookies")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Return cached user if available
    if (cachedUser) {
      try {
        console.log("Returning cached user data")
        return NextResponse.json(JSON.parse(cachedUser))
      } catch (e) {
        console.error("Failed to parse cached user data:", e)
      }
    }

    try {
      console.log("Fetching fresh user data from Discord")
      const userData = await makeDiscordRequest("/users/@me", accessToken)

      console.log("Successfully fetched user data:", {
        userId: userData.id,
        username: userData.username,
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
        console.error("401 Unauthorized error - possible causes:", {
          accessToken: accessToken ? "present" : "missing",
          tokenLength: accessToken?.length,
          first10Chars: accessToken?.substring(0, 10),
          env: {
            NODE_ENV: process.env.NODE_ENV,
            DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ? "set" : "not set",
          },
          requestHeaders: Object.fromEntries(request.headers.entries()),
        })

        // Clear invalid tokens
        const response = NextResponse.json(
          { error: "Authentication expired" }, 
          { status: 401 }
        )
        response.cookies.delete("discord_access_token")
        response.cookies.delete("discord_refresh_token")
        response.cookies.delete("discord_user")
        
        console.log("Cleared authentication cookies due to 401 error")
        return response
      }

      console.error("Unexpected error while fetching user data:", error)
      throw error
    }
  } catch (error) {
    console.error("Critical error in GET /api/user:", {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      requestDetails: {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      }
    })
    
    return NextResponse.json(
      { error: "Failed to fetch user data" }, 
      { status: 500 }
    )
  }
}