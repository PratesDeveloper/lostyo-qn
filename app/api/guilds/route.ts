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

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch user guilds from Discord
    const userGuilds = await makeDiscordRequest("/users/@me/guilds", accessToken)

    // For now, we'll mock the bot presence data
    // In a real implementation, you would check which guilds have your bot
    const result = userGuilds.map((guild: any) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon,
      iconUrl: guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}${guild.icon.startsWith("a_") ? ".gif" : ".png"}?size=128`
        : null,
      owner: guild.owner,
      permissions: guild.permissions,
      permissions_new: guild.permissions_new || guild.permissions,
      features: guild.features || [],
      hasBot: Math.random() > 0.5, // Mock data - replace with actual bot presence check
      memberCount: Math.floor(Math.random() * 10000) + 100, // Mock data
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get guilds error:", error)

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Authentication expired" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to fetch guilds" }, { status: 500 })
  }
}
