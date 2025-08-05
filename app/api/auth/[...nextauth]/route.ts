import NextAuth from "next-auth"
import DiscordProvider from "next-auth/providers/discord"

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email+guilds",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
      }
      if (profile) {
        token.id = profile.id
        token.name = profile.username
        token.image = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        token.global_name = profile.global_name
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        session.user.global_name = token.global_name as string
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }