import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  apiEndpoint: "https://discord.com/api/v10",
}

async function makeDiscordRequest(endpoint: string, accessToken: string) {
  const response = await fetch(`${DISCORD_CONFIG.apiEndpoint}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED")
    }
    throw new Error(`Discord API Error: ${response.status}`)
  }

  return response.json()
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value
    const cachedUser = cookieStore.get("discord_user")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Return cached user if available
    if (cachedUser) {
      try {
        return NextResponse.json(JSON.parse(cachedUser))
      } catch (e) {
        // If cached data is corrupted, fetch fresh data
      }
    }

    try {
      // Fetch fresh user data
      const userData = await makeDiscordRequest("/users/@me", accessToken)

      // Update cache
      cookieStore.set("discord_user", JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 3600, // 1 hour
        path: "/",
      })

      return NextResponse.json(userData)
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        // Try to refresh token
        const refreshResponse = await fetch(new URL("/api/auth/refresh", request.url), {
          method: "POST",
        })

        if (refreshResponse.ok) {
          // Retry with new token
          const newAccessToken = cookieStore.get("discord_access_token")?.value
          if (newAccessToken) {
            const userData = await makeDiscordRequest("/users/@me", newAccessToken)
            return NextResponse.json(userData)
          }
        }

        return NextResponse.json({ error: "Authentication expired" }, { status: 401 })
      }

      throw error
    }
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
