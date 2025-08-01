import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  apiEndpoint: "https://discord.com/api/v10",
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("discord_refresh_token")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token available" }, { status: 401 })
    }

    // Refresh the access token
    const tokenResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        client_secret: DISCORD_CONFIG.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!tokenResponse.ok) {
      // Refresh token is invalid, clear cookies
      cookieStore.delete("discord_access_token")
      cookieStore.delete("discord_refresh_token")
      cookieStore.delete("discord_user")
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    const tokens = await tokenResponse.json()

    // Update cookies with new tokens
    const maxAge = tokens.expires_in || 604800 // 7 days default

    cookieStore.set("discord_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    })

    if (tokens.refresh_token) {
      cookieStore.set("discord_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 })
  }
}
