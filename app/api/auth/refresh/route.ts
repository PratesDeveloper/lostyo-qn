import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  apiEndpoint: "https://discord.com/api/v10",
}

export async function POST(request: NextRequest) {
  console.log('[AUTH] Token refresh requested')
  
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get("discord_refresh_token")?.value

    if (!refreshToken) {
      console.log('[AUTH] No refresh token available')
      return NextResponse.json({ error: "No refresh token available" }, { status: 401 })
    }

    console.log('[AUTH] Refreshing access token...')

    // Refresh the access token
    const tokenResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "LostyoBot/1.0",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        client_secret: DISCORD_CONFIG.clientSecret,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[AUTH] Token refresh failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      
      // Refresh token is invalid, clear cookies
      const response = NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
      response.cookies.delete("discord_access_token")
      response.cookies.delete("discord_refresh_token")
      response.cookies.delete("discord_user")
      return response
    }

    const tokens = await tokenResponse.json()
    console.log('[AUTH] Token refresh successful')

    // Update cookies with new tokens
    const maxAge = tokens.expires_in || 604800 // 7 days default
    const response = NextResponse.json({ success: true })

    const isProduction = process.env.NODE_ENV === "production"
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    }

    response.cookies.set("discord_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge,
    })

    if (tokens.refresh_token) {
      response.cookies.set("discord_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    return response
  } catch (error) {
    console.error('[AUTH] Token refresh error:', error)
    
    let errorMessage = "Failed to refresh token"
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}