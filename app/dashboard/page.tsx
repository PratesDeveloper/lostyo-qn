"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bot, 
  LogOut, 
  Server, 
  Users, 
  Settings, 
  Crown, 
  Shield,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react"

export default function Dashboard() {
  const { user, guilds, isLoading, isAuthenticated, error, login, logout, refreshUser, refreshGuilds, clearError } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login()
    }
  }, [isLoading, isAuthenticated, login])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([refreshUser(), refreshGuilds()])
    } catch (error) {
      console.error("Refresh failed:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-red-500/20 max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Erro de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={() => { clearError(); login(); }} variant="outline" className="flex-1">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Bot className="w-16 h-16 text-[#5865f2] mx-auto mb-4" />
            <CardTitle>Acesso Necessário</CardTitle>
            <CardDescription>
              Faça login com sua conta Discord para acessar o dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} className="w-full bg-[#5865f2] hover:bg-[#4752c4]">
              <Bot className="w-4 h-4 mr-2" />
              Entrar com Discord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                Olá, {user.global_name || user.name}!
              </h1>
              <p className="text-gray-400">
                Bem-vindo ao dashboard do Lostyo Bot
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="border-white/20 hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="border-red-500/20 hover:bg-red-500/10 text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Servidores</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guilds.length}</div>
              <p className="text-xs text-muted-foreground">
                Servidores onde você tem acesso
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Bot</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {guilds.filter(g => g.hasBot).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Servidores com Lostyo Bot
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proprietário</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {guilds.filter(g => g.owner).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Servidores que você possui
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Guilds List */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Seus Servidores
            </CardTitle>
            <CardDescription>
              Gerencie o Lostyo Bot nos seus servidores Discord
            </CardDescription>
          </CardHeader>
          <CardContent>
            {guilds.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  Nenhum servidor encontrado
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guilds.map((guild) => (
                  <Card key={guild.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={guild.iconUrl || undefined} alt={guild.name} />
                          <AvatarFallback>
                            {guild.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{guild.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {guild.owner && (
                              <Badge variant="secondary" className="text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Dono
                              </Badge>
                            )}
                            {guild.hasBot ? (
                              <Badge className="text-xs bg-green-500/20 text-green-400">
                                <Bot className="w-3 h-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-orange-500/20 text-orange-400">
                                <Bot className="w-3 h-3 mr-1" />
                                Inativo
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          {/* guild.memberCount pode não estar disponível, então faremos uma verificação */}
                          {guild.memberCount ? `${guild.memberCount.toLocaleString()} membros` : ''}
                        </div>
                        <div className="flex gap-1">
                          {guild.hasBot ? (
                            <Button size="sm" variant="outline" className="border-white/20">
                              <Settings className="w-4 h-4 mr-1" />
                              Configurar
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              className="bg-[#5865f2] hover:bg-[#4752c4]"
                              asChild
                            >
                              <a
                                href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&permissions=1759218604441463&guild_id=${guild.id}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || '')}&integration_type=0&scope=bot+applications.commands`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Bot className="w-4 h-4 mr-1" />
                                Adicionar
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}