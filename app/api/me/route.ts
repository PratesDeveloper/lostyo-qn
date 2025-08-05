import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const DISCORD_API = "https://discord.com/api/v10"

async function fetchDiscordUser(token: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("UNAUTHORIZED")
  }

  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("discord_access_token")?.value
    const cachedUser = cookieStore.get("discord_user")?.value

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated", code: "NO_ACCESS_TOKEN" },
        { status: 401 }
      )
    }

    if (cachedUser) {
      try {
        return NextResponse.json(JSON.parse(cachedUser))
      } catch {
        // fallback to fetch
      }
    }

    const user = await fetchDiscordUser(token)

    const response = NextResponse.json(user)

    response.cookies.set("discord_user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600,
      path: "/",
    })

    return response
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      const response = NextResponse.json(
        { error: "Token inválido ou expirado", code: "TOKEN_EXPIRED" },
        { status: 401 }
      )

      response.cookies.delete("discord_access_token")
      response.cookies.delete("discord_refresh_token")
      response.cookies.delete("discord_user")

      return response
    }

    return NextResponse.json(
      { error: "Erro inesperado", code: "SERVER_ERROR" },
      { status: 500 }
    )
  }
}
