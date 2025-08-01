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
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    try {
      // Fetch user's guilds
      const guildsData = await makeDiscordRequest("/users/@me/guilds", accessToken)

      // Transform guild data to include additional properties
      const transformedGuilds = guildsData.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        iconUrl: guild.icon
          ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=128`
          : null,
        owner: guild.owner,
        permissions: guild.permissions,
        permissions_new: guild.permissions_new || guild.permissions,
        features: guild.features || [],
        hasBot: false, // This would need to be checked separately
        memberCount: guild.approximate_member_count || 0,
      }))

      return NextResponse.json(transformedGuilds)
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Authentication expired" }, { status: 401 })
      }
      throw error
    }
  } catch (error) {
    console.error("Get guilds error:", error)
    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
  }
}
