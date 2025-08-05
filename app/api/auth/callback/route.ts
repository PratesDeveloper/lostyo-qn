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
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(new URL(`/?error=${error}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL("/?error=missing_code", request.url))
    }

    const tokenRes = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, {
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

    const tokens = await tokenRes.json()
    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/?error=token_failed", request.url))
    }

    const userRes = await fetch(`${DISCORD_CONFIG.apiEndpoint}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    const userData = await userRes.json()
    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/?error=user_failed", request.url))
    }

    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    }

    response.cookies.set("discord_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in || 3600,
    })

    if (tokens.refresh_token) {
      response.cookies.set("discord_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      })
    }

    response.cookies.set("discord_user", JSON.stringify(userData), {
      ...cookieOptions,
      maxAge: 3600,
    })

    return response
  } catch (err) {
    return NextResponse.redirect(new URL("/?error=callback_exception", request.url))
  }
}
