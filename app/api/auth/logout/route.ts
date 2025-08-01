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
    const accessToken = cookieStore.get("discord_access_token")?.value

    // Revoke Discord token if available
    if (accessToken) {
      try {
        await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: DISCORD_CONFIG.clientId,
            client_secret: DISCORD_CONFIG.clientSecret,
            token: accessToken,
          }),
        })
      } catch (error) {
        console.error("Failed to revoke Discord token:", error)
      }
    }

    // Clear all cookies
    const response = NextResponse.json({ success: true })
    response.cookies.delete("discord_access_token")
    response.cookies.delete("discord_refresh_token")
    response.cookies.delete("discord_user")

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
  }
}
