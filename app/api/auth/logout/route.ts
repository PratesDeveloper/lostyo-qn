import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  apiEndpoint: "https://discord.com/api/v10",
}

export async function POST(request: NextRequest) {
  console.log('[AUTH] Logout requested')
  
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value

    // Revoke Discord token if available
    if (accessToken) {
      try {
        console.log('[AUTH] Revoking Discord token...')
        const revokeResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token/revoke`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "LostyoBot/1.0",
          },
          body: new URLSearchParams({
            client_id: DISCORD_CONFIG.clientId,
            client_secret: DISCORD_CONFIG.clientSecret,
            token: accessToken,
          }),
        })

        if (revokeResponse.ok) {
          console.log('[AUTH] Discord token revoked successfully')
        } else {
          console.warn('[AUTH] Failed to revoke Discord token:', revokeResponse.status)
        }
      } catch (error) {
        console.error('[AUTH] Failed to revoke Discord token:', error)
        // Continue with logout even if revocation fails
      }
    }

    // Clear all cookies
    const response = NextResponse.json({ success: true })
    
    // Delete auth cookies
    response.cookies.delete("discord_access_token")
    response.cookies.delete("discord_refresh_token")
    response.cookies.delete("discord_user")

    console.log('[AUTH] Logout successful, cookies cleared')
    return response
  } catch (error) {
    console.error('[AUTH] Logout error:', error)
    
    // Even if there's an error, try to clear cookies
    const response = NextResponse.json({ error: "Logout failed, but cookies cleared" }, { status: 500 })
    response.cookies.delete("discord_access_token")
    response.cookies.delete("discord_refresh_token")
    response.cookies.delete("discord_user")
    
    return response
  }
}