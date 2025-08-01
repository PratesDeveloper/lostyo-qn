import { type NextRequest, NextResponse } from "next/server"

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!,
  apiEndpoint: "https://discord.com/api/v10",
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      return NextResponse.redirect(new URL("/?error=oauth_error", request.url))
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/?error=missing_params", request.url))
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        client_secret: DISCORD_CONFIG.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_CONFIG.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text())
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url))
    }

    const tokens = await tokenResponse.json()

    // Fetch user data
    const userResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error("Failed to fetch user data")
      return NextResponse.redirect(new URL("/?error=user_fetch_failed", request.url))
    }

    const userData = await userResponse.json()

    // Set cookies
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    response.cookies.set("discord_access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expires_in || 604800, // 7 days default
      path: "/",
    })

    if (tokens.refresh_token) {
      response.cookies.set("discord_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    response.cookies.set("discord_user", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600, // 1 hour
      path: "/",
    })

    return response
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/?error=callback_error", request.url))
  }
}
