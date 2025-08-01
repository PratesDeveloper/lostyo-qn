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

export async function GET(request: NextRequest, { params }: { params: Promise<{ guildId: string }> }) {
  try {
    const { guildId } = await params
    const cookieStore = await cookies()
    const accessToken = cookieStore.get("discord_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Fetch guild details
    const guildData = await makeDiscordRequest(`/guilds/${guildId}`, accessToken)

    // Add additional info
    const enrichedGuild = {
      ...guildData,
      iconUrl: guildData.icon
        ? `https://cdn.discordapp.com/icons/${guildData.id}/${guildData.icon}.${guildData.icon.startsWith("a_") ? "gif" : "png"}?size=128`
        : null,
      hasBot: Math.random() > 0.3, // Mock data - replace with actual bot presence check
    }

    return NextResponse.json(enrichedGuild)
  } catch (error) {
    console.error("Get guild error:", error)
    return NextResponse.json({ error: "Failed to fetch guild data" }, { status: 500 })
  }
}
