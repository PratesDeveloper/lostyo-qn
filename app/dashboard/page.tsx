"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Users,
  Shield,
  BarChart3,
  ShoppingCart,
  Ticket,
  UserPlus,
  Command,
  FileText,
  Moon,
  Sun,
  Bell,
  Search,
  Plus,
  Check,
  X,
  Crown,
  Bot,
  LogOut,
  ChevronRight,
  Zap,
  Globe,
  Hash,
  Coins,
  TrendingUp,
  Star,
  Award,
  Target,
  Palette,
  Type,
  Sparkles,
  DollarSign,
  Package,
  ShoppingBag,
  Edit3,
  Trash2,
  Eye,
  Activity,
  ImageIcon,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth"

// Mock data expandido (mantido para demonstração)
const mockStats = {
  totalMembers: 1247,
  commandsThisMonth: 3421,
  topCommands: [
    { name: "/music play", uses: 892 },
    { name: "/economy balance", uses: 654 },
    { name: "/level rank", uses: 432 },
    { name: "/shop buy", uses: 321 },
    { name: "/profile view", uses: 287 },
  ],
  totalCoins: 45678,
  economyStats: {
    totalCoinsInCirculation: 2847392,
    dailyTransactions: 1247,
    topRichestUsers: [
      { username: "RichPlayer#1234", coins: 15420 },
      { username: "CoinMaster#5678", coins: 12890 },
      { username: "Wealthy#9012", coins: 9876 },
    ],
  },
  xpStats: {
    totalXpGiven: 892456,
    averageLevel: 12.4,
    topUsers: [
      { username: "ActiveUser#1111", level: 45, xp: 125430 },
      { username: "Grinder#2222", level: 42, xp: 118920 },
      { username: "Chatter#3333", level: 38, xp: 98765 },
    ],
  },
}

const mockShopItems = [
  {
    id: "1",
    name: "VIP Role",
    description: "Get access to exclusive channels and perks",
    price: 5000,
    stock: -1, // unlimited
    category: "roles",
    icon: "👑",
    sales: 45,
  },
  {
    id: "2",
    name: "Custom Color",
    description: "Choose your own role color",
    price: 2500,
    stock: 100,
    category: "cosmetics",
    icon: "🎨",
    sales: 23,
  },
  {
    id: "3",
    name: "Boost Multiplier",
    description: "2x XP for 7 days",
    price: 1500,
    stock: 50,
    category: "boosts",
    icon: "⚡",
    sales: 67,
  },
]

// Componente de partículas para o dashboard
const DashboardParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            background: `radial-gradient(circle, #5865f2${Math.floor(Math.random() * 50 + 20).toString(16)}, transparent)`,
            animation: `dashboardFloat ${Math.random() * 20 + 15}s infinite linear`,
            filter: "blur(1px)",
          }}
        />
      ))}

      <style jsx>{`
        @keyframes dashboardFloat {
          0% { transform: translateY(100vh) translateX(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(10px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default function Dashboard() {
  const { user, guilds, isLoading, isAuthenticated, login, logout, refreshGuilds } = useAuth()
  const searchParams = useSearchParams()
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [darkMode, setDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [authError, setAuthError] = useState<string | null>(null)
  const [serverConfig, setServerConfig] = useState({
    prefix: "!",
    language: "en",
    logChannel: "",
    welcomeMessage: "Welcome to the server, {user}!",
    welcomeEnabled: true,
    logsEnabled: true,
    memberLogs: true,
    commandLogs: true,
    errorLogs: true,
    moderationLogs: true,
    shopEnabled: true,
    ticketEnabled: true,
    inviteTrackerEnabled: true,
    economyEnabled: true,
    xpEnabled: true,
    profileCustomization: true,
    // Economy settings
    dailyAmount: 100,
    workAmount: 250,
    crimeSuccessRate: 60,
    // XP settings
    xpPerMessage: 15,
    xpCooldown: 60,
    levelUpReward: 50,
    // Profile settings
    customBanners: true,
    customBadges: true,
    profileCards: true,
  })

  // Check for auth errors from URL params
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      switch (error) {
        case "access_denied":
          setAuthError("Authorization was denied or cancelled")
          break
        case "missing_code":
          setAuthError("Missing authorization code")
          break
        case "auth_failed":
          setAuthError("Authentication failed")
          break
        default:
          setAuthError("An error occurred during authentication")
      }
    }
  }, [searchParams])

  // Refresh guilds when authenticated
  useEffect(() => {
    if (isAuthenticated && guilds.length === 0) {
      refreshGuilds()
    }
  }, [isAuthenticated, guilds.length, refreshGuilds])

  // Filtrar servidores
  const filteredServers = guilds.filter((server) => server.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center relative overflow-hidden">
        <DashboardParticles />
        <div className="relative z-20 text-center">
          <Bot className="w-20 h-20 text-[#5865f2] mx-auto mb-8 animate-pulse drop-shadow-2xl" />
          <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Loading...
          </h1>
        </div>
      </div>
    )
  }

  // Tela de login/erro
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center relative overflow-hidden">
        <DashboardParticles />

        <div className="relative z-20 text-center">
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-12 shadow-2xl shadow-[#5865f2]/30 border-0 max-w-md">
            {authError ? (
              <>
                <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-8 drop-shadow-2xl" />
                <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Authentication Error
                </h1>
                <p className="text-gray-300 mb-8 text-lg">{authError}</p>
                <Button
                  size="lg"
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl shadow-[#5865f2]/50 transition-all duration-500 hover:scale-110 border-0 mb-4"
                  onClick={() => {
                    setAuthError(null)
                    login()
                  }}
                >
                  <Bot className="w-6 h-6 mr-3" />
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white border-0"
                  onClick={() => setAuthError(null)}
                >
                  Dismiss
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Lostyo Dashboard
                </h1>
                <p className="text-gray-300 mb-8 text-lg">Connect with Discord to manage your servers</p>
                <Button
                  size="lg"
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-8 py-4 text-lg font-bold rounded-2xl shadow-2xl shadow-[#5865f2]/50 transition-all duration-500 hover:scale-110 border-0"
                  onClick={login}
                >
                  <Bot className="w-6 h-6 mr-3" />
                  Login with Discord
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Seleção de servidor
  if (!selectedServer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative overflow-hidden">
        <DashboardParticles />

        {/* Header */}
        <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Lostyo Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-4">

                <div className="flex items-center space-x-3 bg-white/5 rounded-2xl px-4 py-2 backdrop-blur-xl">
                  <img
                    src={
                      user?.avatar
                        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
                        : "/placeholder.svg"
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-white font-medium">{user?.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white border-0"
                    onClick={logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Server Selection */}
        <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Select a Server
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose a server to configure Lostyo's features and settings
            </p>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/5 border-white/10 text-white placeholder-gray-400 rounded-2xl h-14 text-lg backdrop-blur-xl focus:border-[#5865f2] border-0"
              />
            </div>
          </div>

          {/* Server Grid */}
          {filteredServers.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Servers Found</h3>
              <p className="text-gray-300 mb-6">
                {guilds.length === 0
                  ? "You don't have permission to manage any servers, or no servers were found."
                  : "No servers match your search criteria."}
              </p>
              <Button variant="ghost" onClick={refreshGuilds} className="text-[#5865f2] hover:text-[#4752c4] border-0">
                Refresh Servers
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServers.map((server) => (
                <Card
                  key={server.id}
                  className="group bg-white/5 backdrop-blur-3xl hover:bg-white/10 transition-all duration-500 rounded-[2rem] shadow-2xl hover:shadow-[#5865f2]/30 hover:scale-105 cursor-pointer border-0"
                  onClick={() => setSelectedServer(server.id)}
                >
                  <CardContent className="p-8 text-center border-0">
                    <div className="relative mb-6">
                      <img
                        src={server.iconUrl || "/placeholder.svg"}
                        alt={server.name}
                        className="w-20 h-20 rounded-2xl mx-auto shadow-2xl"
                      />
                      <div
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                          server.hasBot ? "bg-green-500" : "bg-red-500"
                        } shadow-lg`}
                      >
                        {server.hasBot ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <X className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-gray-100 transition-colors">
                      {server.name}
                    </h3>

                    <div className="flex items-center justify-center space-x-4 mb-6 text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{server.memberCount.toLocaleString()}</span>
                      </div>
                      <Badge variant={server.hasBot ? "default" : "secondary"} className="border-0">
                        {server.hasBot ? "Bot Active" : "Bot Missing"}
                      </Badge>
                    </div>

                    {!server.hasBot && (
                      <Button
                        size="sm"
                        className="bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl mb-4 border-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(
                            "https://discord.com/oauth2/authorize?client_id=1399625245585051708&response_type=code&redirect_uri=https%3A%2F%2Flostyo.vercel.app%2Fapi%2Fauth%2Fcallback%2Fdiscord&scope=identify+guilds",
                            "_blank",
                          )
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Bot
                      </Button>
                    )}

                    <div className="flex items-center justify-center text-[#5865f2] group-hover:text-[#4752c4] transition-colors">
                      <span className="font-medium">Configure</span>
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Dashboard principal
  const currentServer = guilds.find((s) => s.id === selectedServer)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white relative overflow-hidden">
      <DashboardParticles />

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedServer(null)}
                className="text-gray-300 hover:text-white border-0"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <img
                src={currentServer?.iconUrl || "/placeholder.svg"}
                alt={currentServer?.name}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold text-white">{currentServer?.name}</h1>
                <p className="text-sm text-gray-400">{currentServer?.memberCount.toLocaleString()} members</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white border-0">
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className="text-gray-300 hover:text-white border-0"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <div className="flex items-center space-x-3 bg-white/5 rounded-2xl px-4 py-2 backdrop-blur-xl">
                <img
                  src={
                    user?.avatar
                      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=32`
                      : "/placeholder.svg"
                  }
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white font-medium">{user?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Navigation Tabs */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-2 shadow-2xl border-0">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 bg-transparent h-auto p-0 border-0">
              {[
                { id: "general", icon: Settings, label: "General" },
                { id: "economy", icon: Coins, label: "Economy" },
                { id: "xp", icon: TrendingUp, label: "XP System" },
                { id: "shop", icon: ShoppingCart, label: "Shop" },
                { id: "profile", icon: Star, label: "Profiles" },
                { id: "logs", icon: FileText, label: "Logs" },
                { id: "stats", icon: BarChart3, label: "Statistics" },
                { id: "tickets", icon: Ticket, label: "Tickets" },
                { id: "invites", icon: UserPlus, label: "Invites" },
                { id: "users", icon: Users, label: "Users" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center space-y-2 p-4 rounded-2xl data-[state=active]:bg-[#5865f2] data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300 border-0"
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Economy System */}
          <TabsContent value="economy" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Coins,
                  label: "Total Coins",
                  value: mockStats.economyStats.totalCoinsInCirculation,
                  color: "text-yellow-400",
                },
                {
                  icon: Activity,
                  label: "Daily Transactions",
                  value: mockStats.economyStats.dailyTransactions,
                  color: "text-green-400",
                },
                { icon: TrendingUp, label: "Active Users", value: "89%", color: "text-blue-400" },
                { icon: DollarSign, label: "Shop Revenue", value: "12.4K", color: "text-purple-400" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-300 border-0"
                >
                  <CardContent className="p-6 text-center border-0">
                    <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                    <div className="text-3xl font-black text-white mb-2">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Economy Settings */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <Coins className="w-6 h-6 text-[#5865f2]" />
                      <span>Economy Settings</span>
                    </div>
                    <Switch
                      checked={serverConfig.economyEnabled}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, economyEnabled: checked })}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Daily Reward Amount</label>
                    <Input
                      type="number"
                      value={serverConfig.dailyAmount}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, dailyAmount: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Work Command Reward</label>
                    <Input
                      type="number"
                      value={serverConfig.workAmount}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, workAmount: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Crime Success Rate (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={serverConfig.crimeSuccessRate}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, crimeSuccessRate: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Top Rich Users */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <Crown className="w-6 h-6 text-[#5865f2]" />
                    <span>Richest Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-0">
                  <div className="space-y-4">
                    {mockStats.economyStats.topRichestUsers.map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold ${
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{user.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-bold">{user.coins.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* XP System */}
          <TabsContent value="xp" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: TrendingUp,
                  label: "Total XP Given",
                  value: mockStats.xpStats.totalXpGiven,
                  color: "text-blue-400",
                },
                { icon: Star, label: "Average Level", value: mockStats.xpStats.averageLevel, color: "text-purple-400" },
                { icon: Award, label: "Level Ups Today", value: 47, color: "text-green-400" },
                { icon: Target, label: "Active Levelers", value: "156", color: "text-orange-400" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-300 border-0"
                >
                  <CardContent className="p-6 text-center border-0">
                    <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                    <div className="text-3xl font-black text-white mb-2">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* XP Settings */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-6 h-6 text-[#5865f2]" />
                      <span>XP System Settings</span>
                    </div>
                    <Switch
                      checked={serverConfig.xpEnabled}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, xpEnabled: checked })}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">XP Per Message</label>
                    <Input
                      type="number"
                      value={serverConfig.xpPerMessage}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, xpPerMessage: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">XP Cooldown (seconds)</label>
                    <Input
                      type="number"
                      value={serverConfig.xpCooldown}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, xpCooldown: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Level Up Coin Reward</label>
                    <Input
                      type="number"
                      value={serverConfig.levelUpReward}
                      onChange={(e) =>
                        setServerConfig({ ...serverConfig, levelUpReward: Number.parseInt(e.target.value) })
                      }
                      className="bg-white/5 border-white/10 text-white rounded-xl border-0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Top XP Users */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <Award className="w-6 h-6 text-[#5865f2]" />
                    <span>Top XP Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-0">
                  <div className="space-y-4">
                    {mockStats.xpStats.topUsers.map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold ${
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <span className="text-white font-medium block">{user.username}</span>
                            <span className="text-gray-400 text-sm">Level {user.level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-400 font-bold">{user.xp.toLocaleString()} XP</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Enhanced Shop System */}
          <TabsContent value="shop" className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ShoppingCart className="w-8 h-8 text-[#5865f2]" />
                <div>
                  <h2 className="text-3xl font-bold text-white">Shop Management</h2>
                  <p className="text-gray-300">Manage your server's virtual shop and items</p>
                </div>
              </div>
              <Button className="bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Shop Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Package, label: "Total Items", value: mockShopItems.length, color: "text-blue-400" },
                {
                  icon: ShoppingBag,
                  label: "Total Sales",
                  value: mockShopItems.reduce((acc, item) => acc + item.sales, 0),
                  color: "text-green-400",
                },
                { icon: DollarSign, label: "Revenue", value: "45.2K", color: "text-yellow-400" },
                { icon: TrendingUp, label: "Conversion", value: "12.4%", color: "text-purple-400" },
              ].map((stat, index) => (
                <Card key={index} className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                  <CardContent className="p-6 text-center border-0">
                    <stat.icon className={`w-10 h-10 ${stat.color} mx-auto mb-3`} />
                    <div className="text-2xl font-black text-white mb-1">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Shop Items */}
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardHeader className="border-0">
                <CardTitle className="flex items-center justify-between text-white">
                  <span>Shop Items</span>
                  <div className="flex items-center space-x-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="roles">Roles</SelectItem>
                        <SelectItem value="cosmetics">Cosmetics</SelectItem>
                        <SelectItem value="boosts">Boosts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="border-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockShopItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border-0 hover:bg-white/10 transition-all duration-300"
                    >
                      <CardContent className="p-6 border-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-3xl">{item.icon}</div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white border-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white border-0">
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 border-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-gray-300 text-sm mb-4">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">{item.price.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge variant="secondary" className="bg-white/10 text-white border-0">
                              {item.sales} sold
                            </Badge>
                            <Badge
                              variant={item.stock === -1 ? "default" : item.stock > 0 ? "default" : "destructive"}
                              className="border-0"
                            >
                              {item.stock === -1 ? "Unlimited" : `${item.stock} left`}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Customization */}
          <TabsContent value="profile" className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Star className="w-8 h-8 text-[#5865f2]" />
                <div>
                  <h2 className="text-3xl font-bold text-white">Profile Customization</h2>
                  <p className="text-gray-300">Configure user profile features and customization options</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Profile Settings */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <Palette className="w-6 h-6 text-[#5865f2]" />
                      <span>Profile Features</span>
                    </div>
                    <Switch
                      checked={serverConfig.profileCustomization}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, profileCustomization: checked })}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-0">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-[#5865f2]" />
                      <div>
                        <span className="text-white font-medium block">Custom Banners</span>
                        <span className="text-gray-400 text-sm">Allow users to set custom profile banners</span>
                      </div>
                    </div>
                    <Switch
                      checked={serverConfig.customBanners}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, customBanners: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-[#5865f2]" />
                      <div>
                        <span className="text-white font-medium block">Custom Badges</span>
                        <span className="text-gray-400 text-sm">Enable custom achievement badges</span>
                      </div>
                    </div>
                    <Switch
                      checked={serverConfig.customBadges}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, customBadges: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center space-x-3">
                      <Type className="w-5 h-5 text-[#5865f2]" />
                      <div>
                        <span className="text-white font-medium block">Profile Cards</span>
                        <span className="text-gray-400 text-sm">Customizable profile card designs</span>
                      </div>
                    </div>
                    <Switch
                      checked={serverConfig.profileCards}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, profileCards: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Profile Preview */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <Sparkles className="w-6 h-6 text-[#5865f2]" />
                    <span>Profile Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-0">
                  {/* Mock Profile Card */}
                  <div className="bg-gradient-to-br from-[#5865f2]/20 via-purple-500/10 to-pink-500/20 rounded-2xl p-6 backdrop-blur-xl border border-white/10">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src="/placeholder.svg?height=60&width=60"
                        alt="Profile"
                        className="w-15 h-15 rounded-full border-2 border-[#5865f2]"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-white">ExampleUser#1234</h3>
                        <p className="text-gray-300">Level 25 • 12,450 XP</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">5,420</div>
                        <div className="text-xs text-gray-400">Coins</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">847</div>
                        <div className="text-xs text-gray-400">Messages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">23</div>
                        <div className="text-xs text-gray-400">Days Active</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border-0">
                        🏆 Top Chatter
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 border-0">
                        💎 VIP Member
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border-0">
                        🎯 Level Master
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Configuration */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center space-x-3 text-white">
                    <Settings className="w-6 h-6 text-[#5865f2]" />
                    <span>Basic Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 border-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bot Prefix</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={serverConfig.prefix}
                        onChange={(e) => setServerConfig({ ...serverConfig, prefix: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 text-white rounded-xl border-0"
                        placeholder="!"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    <Select
                      value={serverConfig.language}
                      onValueChange={(value) => setServerConfig({ ...serverConfig, language: value })}
                    >
                      <SelectTrigger>
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="pt">🇧🇷 Português</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                        <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Log Channel</label>
                    <Select
                      value={serverConfig.logChannel}
                      onValueChange={(value) => setServerConfig({ ...serverConfig, logChannel: value })}
                    >
                      <SelectTrigger>
                        <Hash className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Select a channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general"># general</SelectItem>
                        <SelectItem value="logs"># logs</SelectItem>
                        <SelectItem value="admin"># admin</SelectItem>
                        <SelectItem value="bot-commands"># bot-commands</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Welcome System */}
              <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
                <CardHeader className="border-0">
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-6 h-6 text-[#5865f2]" />
                      <span>Welcome System</span>
                    </div>
                    <Switch
                      checked={serverConfig.welcomeEnabled}
                      onCheckedChange={(checked) => setServerConfig({ ...serverConfig, welcomeEnabled: checked })}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 border-0">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Message</label>
                    <Textarea
                      value={serverConfig.welcomeMessage}
                      onChange={(e) => setServerConfig({ ...serverConfig, welcomeMessage: e.target.value })}
                      className="bg-white/5 border-white/10 text-white rounded-xl resize-none border-0"
                      rows={3}
                      placeholder="Welcome to the server, {user}!"
                    />
                    <p className="text-xs text-gray-400 mt-1">Use {`{user}`} to mention the new member</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Total Members", value: mockStats.totalMembers, color: "text-blue-400" },
                { icon: Command, label: "Commands Used", value: mockStats.commandsThisMonth, color: "text-green-400" },
                { icon: Crown, label: "Total Coins", value: mockStats.totalCoins, color: "text-yellow-400" },
                { icon: Zap, label: "Uptime", value: "99.9%", color: "text-purple-400" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl hover:scale-105 transition-all duration-300 border-0"
                >
                  <CardContent className="p-6 text-center border-0">
                    <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                    <div className="text-3xl font-black text-white mb-2">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </div>
                    <p className="text-gray-300 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Top Commands */}
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardHeader className="border-0">
                <CardTitle className="flex items-center space-x-3 text-white">
                  <BarChart3 className="w-6 h-6 text-[#5865f2]" />
                  <span>Top Commands This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="border-0">
                <div className="space-y-4">
                  {mockStats.topCommands.map((command, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-[#5865f2] rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium">{command.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/10 text-white border-0">
                        {command.uses.toLocaleString()} uses
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Configuration */}
          <TabsContent value="logs" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardHeader className="border-0">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-[#5865f2]" />
                    <span>Logging System</span>
                  </div>
                  <Switch
                    checked={serverConfig.logsEnabled}
                    onCheckedChange={(checked) => setServerConfig({ ...serverConfig, logsEnabled: checked })}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 border-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: "memberLogs", label: "Member Join/Leave", icon: Users },
                    { key: "commandLogs", label: "Command Usage", icon: Command },
                    { key: "errorLogs", label: "Error Logs", icon: X },
                    { key: "moderationLogs", label: "Moderation Actions", icon: Shield },
                  ].map((log) => (
                    <div
                      key={log.key}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <log.icon className="w-5 h-5 text-[#5865f2]" />
                        <span className="text-white font-medium">{log.label}</span>
                      </div>
                      <Switch
                        checked={serverConfig[log.key as keyof typeof serverConfig] as boolean}
                        onCheckedChange={(checked) => setServerConfig({ ...serverConfig, [log.key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ticket System */}
          <TabsContent value="tickets" className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardHeader className="border-0">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <Ticket className="w-6 h-6 text-[#5865f2]" />
                    <span>Ticket System</span>
                  </div>
                  <Switch
                    checked={serverConfig.ticketEnabled}
                    onCheckedChange={(checked) => setServerConfig({ ...serverConfig, ticketEnabled: checked })}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="border-0">
                {serverConfig.ticketEnabled ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Ticket Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">🎫 Support</SelectItem>
                          <SelectItem value="reports">📋 Reports</SelectItem>
                          <SelectItem value="general">💬 General</SelectItem>
                          <SelectItem value="appeals">⚖️ Appeals</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Support Message</label>
                      <Textarea
                        className="bg-white/5 border-white/10 text-white rounded-xl resize-none border-0"
                        rows={3}
                        placeholder="Thank you for creating a ticket. Our team will be with you shortly."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Ticket System Disabled</h3>
                    <p className="text-gray-300">Enable tickets to provide better support to your members</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs */}
          <TabsContent value="invites">
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardContent className="text-center py-12 border-0">
                <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Invite Tracker</h3>
                <p className="text-gray-300">Track who invites new members to your server</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-2xl border-0">
              <CardContent className="text-center py-12 border-0">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
                <p className="text-gray-300">Manage user permissions and roles</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global Styles */}
      <style jsx global>{`
        * {
          border: 0 !important;
        }
        
        .border-0 {
          border: 0 !important;
        }
      `}</style>
    </div>
  )
}
