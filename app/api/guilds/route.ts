import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const guildsRes = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  })

  if (!guildsRes.ok) {
    const errorData = await guildsRes.json();
    return new Response(JSON.stringify({ error: "Failed to fetch guilds", details: errorData }), { status: guildsRes.status })
  }

  const guilds = await guildsRes.json()


  const botId = process.env.DISCORD_CLIENT_ID;
  const guildsWithBotStatus = await Promise.all(guilds.map(async (guild: any) => {
    const iconUrl = guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` : null;
    try {
        const res = await fetch(`https://discord.com/api/guilds/${guild.id}/members/${botId}`, {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        });
        return { ...guild, hasBot: res.ok, iconUrl };
    } catch (e) {
        return { ...guild, hasBot: false, iconUrl };
    }
  }));

  return new Response(JSON.stringify(guildsWithBotStatus))
}