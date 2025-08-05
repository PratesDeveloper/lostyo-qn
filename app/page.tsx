"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Shield,
  Gamepad2,
  Users,
  Server,
  MessageSquare,
  Bot,
  Heart,
  Zap,
  Crown,
  Music,
  Settings,
  ChevronRight,
  Star,
} from "lucide-react"

// Componente de partículas premium com muito blur
const Particles = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      type: "dot" | "star" | "glow" | "mega-blur"
      color: string
      delay: number
    }>
  >([])

  useEffect(() => {
    const colors = ["#5865f2", "#ffffff", "#8b9cff", "#c7d2fe", "#a78bfa", "#f472b6"]
    const generateParticles = () => {
      const newParticles = []

      // Partículas pequenas com blur
      for (let i = 0; i < 40; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 2,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 30 + 35,
          type: "dot" as const,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 5,
        })
      }

      // Partículas médias com mais blur
      for (let i = 40; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 8 + 5,
          opacity: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 25 + 30,
          type: "glow" as const,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 4,
        })
      }

      // Partículas mega blur
      for (let i = 60; i < 75; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 15 + 10,
          opacity: Math.random() * 0.4 + 0.1,
          speed: Math.random() * 20 + 25,
          type: "mega-blur" as const,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 6,
        })
      }

      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background:
              particle.type === "mega-blur"
                ? `radial-gradient(circle, ${particle.color}40, ${particle.color}20, transparent)`
                : `radial-gradient(circle, ${particle.color}, ${particle.color}80, transparent)`,
            opacity: particle.opacity,
            animation: `particleFloat ${particle.speed}s infinite linear ${particle.delay}s`,
            filter: particle.type === "mega-blur" ? "blur(8px)" : particle.type === "glow" ? "blur(4px)" : "blur(2px)",
            borderRadius: "50%",
            border: "none",
          }}
        />
      ))}

      {/* Partículas de fundo gigantes com blur extremo */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`mega-bg-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 600 + 300}px`,
            height: `${Math.random() * 600 + 300}px`,
            background: `radial-gradient(circle, ${
              ["#5865f2", "#8b9cff", "#a78bfa", "#f472b6"][Math.floor(Math.random() * 4)]
            }08, transparent)`,
            animation: `megaFloat ${Math.random() * 100 + 80}s infinite linear`,
            filter: "blur(150px)",
            border: "none",
          }}
        />
      ))}

      {/* Camadas de atmosfera com blur */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5865f2]/15 via-transparent to-[#8b9cff]/15 opacity-60 blur-3xl" />
        <div className="absolute top-1/4 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-white/10 to-transparent opacity-40 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-3/4 h-3/4 bg-gradient-to-tr from-[#a78bfa]/12 to-transparent opacity-50 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-[#5865f2]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes particleFloat {
          0% { 
            transform: translateY(100vh) translateX(-20px) rotate(0deg) scale(0.8); 
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-100vh) translateX(20px) rotate(360deg) scale(1.2); 
            opacity: 0;
          }
        }
        @keyframes megaFloat {
          0% { transform: translateY(100vh) translateX(-100px) scale(0.8); }
          100% { transform: translateY(-100vh) translateX(100px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// Componente de contador animado melhorado
const AnimatedCounter = ({ end, duration = 2000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end, duration])

  return <span>{count.toLocaleString()}</span>
}

export default function LostyoLanding() {
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    users: 0,
    servers: 0,
    votes: 0,
  });

  const features = [
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Protect your community with AI-powered moderation and comprehensive anti-spam protection",
      gradient: "from-red-500/80 via-pink-500/60 to-red-400/40",
      shadow: "shadow-red-500/30",
    },
    {
      icon: Gamepad2,
      title: "Interactive Games",
      description: "Engage your members with fun mini-games, trivia, and entertainment features",
      gradient: "from-green-500/80 via-emerald-500/60 to-green-400/40",
      shadow: "shadow-green-500/30",
    },
    {
      icon: Music,
      title: "High-Quality Music",
      description: "Stream crystal-clear audio from multiple platforms with advanced queue management",
      gradient: "from-purple-500/80 via-violet-500/60 to-purple-400/40",
      shadow: "shadow-purple-500/30",
    },
    {
      icon: Settings,
      title: "Easy Customization",
      description: "Tailor every aspect of your server with intuitive commands and dashboard controls",
      gradient: "from-blue-500/80 via-cyan-500/60 to-blue-400/40",
      shadow: "shadow-blue-500/30",
    },
    {
      icon: Crown,
      title: "Leveling System",
      description: "Motivate your community with XP rewards, custom roles, and achievement badges",
      gradient: "from-yellow-500/80 via-orange-500/60 to-yellow-400/40",
      shadow: "shadow-yellow-500/30",
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Automate routine tasks and create custom workflows to save time and effort",
      gradient: "from-indigo-500/80 via-purple-500/60 to-indigo-400/40",
      shadow: "shadow-indigo-500/30",
    },
  ]
  
  useEffect(() => {
    fetch("/api/bot/status")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          users: data.users || 0,
          servers: data.servers || 0,
          votes: data.votes || 0,
        });
      })
      .catch((err) => {
        console.error("Erro ao buscar status do bot:", err);
      });
  }, []);

  useEffect(() => {
    document.title = "Lostyo Bot - Transform Your Discord Server"

    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement("meta")
    metaDescription.setAttribute("name", "description")
    metaDescription.setAttribute(
      "content",
      "Transform your Discord server with Lostyo - the ultimate bot for moderation, music, games, and community engagement.",
    )
    if (!document.querySelector('meta[name="description"]')) {
        document.head.appendChild(metaDescription)
    }

    let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!favicon) {
        favicon = document.createElement("link") as HTMLLinkElement;
        document.head.appendChild(favicon);
    }
    favicon.type = "image/png";
    favicon.rel = "shortcut icon";
    favicon.href = "/lostyo-logo.png";
  }, [])

  useEffect(() => {
    const handleDragStart = (e: DragEvent) => e.preventDefault();
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-hidden relative">
      <Particles />

      {/* Overlay gradiente com blur */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-gray-900/40 to-black/60 backdrop-blur-sm pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-6 sm:mb-8 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-2xl">
              Lostyo
            </h1>
            <div className="w-32 h-2 bg-gradient-to-r from-[#5865f2] via-[#8b9cff] to-[#a78bfa] mx-auto rounded-full blur-sm shadow-2xl shadow-[#5865f2]/50"></div>
          </div>

          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-300 mb-12 sm:mb-16 max-w-5xl mx-auto leading-relaxed font-light drop-shadow-xl">
            Transform your Discord server into an{" "}
            <span className="text-white font-medium bg-gradient-to-r from-[#5865f2] to-[#8b9cff] bg-clip-text text-transparent">
              incredible community
            </span>{" "}
            with intelligent moderation, unlimited entertainment, and features your members will love.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 sm:mb-20">
            <Button
              size="lg"
              asChild
              className="group w-full sm:w-auto bg-gradient-to-r from-[#5865f2]/90 via-[#4752c4]/80 to-[#3c45a5]/70 hover:from-[#4752c4] hover:via-[#3c45a5] hover:to-[#2f3b94] text-white px-10 sm:px-14 py-6 sm:py-8 text-xl sm:text-2xl font-bold shadow-2xl shadow-[#5865f2]/60 hover:shadow-[#5865f2]/80 transition-all duration-500 hover:scale-110 rounded-3xl backdrop-blur-2xl relative overflow-hidden border-0"
            >
              <a
                href="https://discord.com/oauth2/authorize?client_id=1399625245585051708&scope=bot%20applications.commands&response_type=code&redirect_uri=https://lostyo.vercel.app/api/auth/callback&permissions=1513962695871"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <Bot className="w-6 h-6 sm:w-7 sm:h-7 mr-3 relative z-10 drop-shadow-lg" />
                <span className="relative z-10 drop-shadow-lg">Add to Discord</span>
              </a>
            </Button>

            <Button
              size="lg"
              asChild
              className="group w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-10 sm:px-14 py-6 sm:py-8 text-xl sm:text-2xl backdrop-blur-2xl rounded-3xl transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-white/20 relative overflow-hidden border-0"
            >
              <a href="/dashboard">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <Settings className="w-6 h-6 sm:w-7 sm:h-7 mr-3 relative z-10 drop-shadow-lg" />
                <span className="relative z-10 drop-shadow-lg">Dashboard</span>
              </a>
            </Button>

            <Button
              size="lg"
              asChild
              className="group w-full sm:w-auto bg-black/40 hover:bg-black/60 text-white px-10 sm:px-14 py-6 sm:py-8 text-xl sm:text-2xl backdrop-blur-2xl rounded-3xl transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-black/40 relative overflow-hidden border-0"
            >
              <a href="https://discord.gg/lostyo" target="_blank" rel="noopener noreferrer">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 mr-3 relative z-10 drop-shadow-lg" />
                <span className="relative z-10 drop-shadow-lg">Support</span>
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {[
              {
                icon: Users,
                value: stats.users,
                label: "Active Members",
                color: "text-blue-400",
                shadow: "shadow-blue-500/40",
              },
              {
                icon: Server,
                value: stats.servers,
                label: "Servers",
                color: "text-green-400",
                shadow: "shadow-green-500/40",
              },
              {
                icon: Heart,
                value: stats.votes,
                label: "Votes",
                color: "text-red-400",
                shadow: "shadow-red-500/40",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className={`group bg-white/5 backdrop-blur-3xl hover:bg-white/15 transition-all duration-700 rounded-[2.5rem] shadow-2xl ${stat.shadow} hover:shadow-3xl hover:scale-110 relative overflow-hidden border-0`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                <CardContent className="p-8 sm:p-10 lg:p-12 text-center relative z-10 border-0">
                  <stat.icon
                    className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 ${stat.color} mx-auto mb-6 sm:mb-8 transition-all duration-700 group-hover:scale-125 drop-shadow-2xl filter group-hover:drop-shadow-[0_0_20px_currentColor]`}
                  />
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 drop-shadow-2xl">
                    <AnimatedCounter end={stat.value} />
                  </div>
                  <p className="text-gray-300 text-lg sm:text-xl font-medium drop-shadow-lg">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 sm:mb-8 bg-gradient-to-b from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
              Why Choose Lostyo?
            </h2>
            <div className="w-40 h-2 bg-gradient-to-r from-[#5865f2] via-[#8b9cff] to-[#a78bfa] mx-auto rounded-full blur-sm shadow-2xl shadow-[#5865f2]/60"></div>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed mt-8 drop-shadow-xl">
              Discover the powerful features that make Lostyo the ultimate choice for your Discord community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group bg-white/5 backdrop-blur-3xl hover:bg-white/15 transition-all duration-700 hover:scale-110 rounded-[2.5rem] shadow-2xl ${feature.shadow} hover:shadow-3xl relative overflow-hidden border-0`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                <CardContent className="p-8 sm:p-10 relative z-10 border-0">
                  <div
                    className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 sm:mb-8 transition-all duration-700 group-hover:scale-125 group-hover:rotate-6 shadow-2xl backdrop-blur-xl border-0`}
                  >
                    <feature.icon className="w-full h-full text-white drop-shadow-2xl" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 group-hover:text-gray-100 transition-colors duration-500 drop-shadow-xl">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-lg sm:text-xl group-hover:text-gray-200 transition-colors duration-500 drop-shadow-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#5865f2]/20 via-[#8b9cff]/30 to-[#a78bfa]/20 blur-3xl rounded-full transform scale-150 opacity-60"></div>

          <div className="relative z-10 text-center">
            {/* Floating elements */}
            <div className="absolute -top-10 left-1/4 w-20 h-20 bg-gradient-to-br from-[#5865f2]/30 to-transparent rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -top-5 right-1/3 w-16 h-16 bg-gradient-to-br from-[#a78bfa]/40 to-transparent rounded-full blur-lg animate-pulse delay-1000"></div>
            <div className="absolute top-10 left-1/6 w-12 h-12 bg-gradient-to-br from-[#f472b6]/30 to-transparent rounded-full blur-md animate-pulse delay-2000"></div>

            {/* Main content */}
            <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 backdrop-blur-3xl rounded-[3rem] p-12 sm:p-16 lg:p-20 shadow-2xl shadow-[#5865f2]/30 hover:shadow-[#5865f2]/50 transition-all duration-700 hover:scale-105 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5865f2]/20 via-transparent to-[#8b9cff]/20 animate-pulse"></div>
                <div className="absolute top-1/4 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Icon constellation */}
                <div className="flex justify-center items-center mb-8 space-x-4">
                  <div className="w-3 h-3 bg-[#5865f2] rounded-full animate-ping"></div>
                  <div className="w-4 h-4 bg-[#8b9cff] rounded-full animate-pulse"></div>
                  <Star className="w-16 h-16 text-[#5865f2] animate-pulse drop-shadow-2xl filter drop-shadow-[0_0_30px_currentColor]" />
                  <div className="w-4 h-4 bg-[#a78bfa] rounded-full animate-pulse delay-500"></div>
                  <div className="w-3 h-3 bg-[#f472b6] rounded-full animate-ping delay-1000"></div>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 bg-gradient-to-br from-white via-[#5865f2] to-[#8b9cff] bg-clip-text text-transparent drop-shadow-2xl leading-tight">
                  Transform Your Server Today
                </h2>

                {/* Decorative line */}
                <div className="flex justify-center mb-8">
                  <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#5865f2] to-transparent rounded-full blur-sm"></div>
                </div>

                <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto font-light leading-relaxed drop-shadow-xl">
                  Join the{" "}
                  <span className="text-white font-semibold bg-gradient-to-r from-[#5865f2] to-[#8b9cff] bg-clip-text text-transparent">
                    revolution
                  </span>{" "}
                  of Discord communities using Lostyo's cutting-edge features
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Button
                    size="lg"
                    asChild
                    className="group bg-gradient-to-r from-[#5865f2] via-[#4752c4] to-[#3c45a5] hover:from-[#4752c4] hover:via-[#3c45a5] hover:to-[#2f3b94] text-white px-12 sm:px-16 py-6 sm:py-8 text-xl sm:text-2xl font-bold shadow-2xl shadow-[#5865f2]/60 hover:shadow-[#5865f2]/80 transition-all duration-700 hover:scale-125 rounded-3xl backdrop-blur-2xl relative overflow-hidden border-0"
                  >
                    <a
                      href="https://discord.com/oauth2/authorize?client_id=1399625245585051708&scope=bot%20applications.commands&response_type=code&redirect_uri=https://lostyo.vercel.app/api/auth/callback&permissions=1513962695871"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                      <Bot className="w-7 h-7 sm:w-8 sm:h-8 mr-3 relative z-10 drop-shadow-2xl" />
                      <span className="relative z-10 drop-shadow-2xl">Add Lostyo Now</span>
                      <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 ml-3 relative z-10 transition-transform duration-500 group-hover:translate-x-2 drop-shadow-2xl" />
                    </a>
                  </Button>

                  <Button
                    size="lg"
                    asChild
                    className="group bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white px-12 sm:px-16 py-6 sm:py-8 text-xl sm:text-2xl backdrop-blur-2xl rounded-3xl transition-all duration-700 hover:scale-110 shadow-2xl hover:shadow-white/30 relative overflow-hidden border-0"
                  >
                    <a href="https://discord.gg/lostyo" target="_blank" rel="noopener noreferrer">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#5865f2]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                      <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8 mr-3 relative z-10 drop-shadow-2xl" />
                      <span className="relative z-10 drop-shadow-2xl">Join Support</span>
                    </a>
                  </Button>
                </div>

                {/* Stats mini display */}
                {stats && (
                  <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-400 text-sm">
                        {Math.floor(stats.users / 1000).toLocaleString()}K+ Active Users
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
                      <span className="text-gray-400 text-sm">
                        {Math.floor(stats.servers / 1000).toLocaleString()}K+ Servers
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-1000"></div>
                      <span className="text-gray-400 text-sm">99.9% Uptime</span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-6">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
                Lostyo
              </span>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5865f2] via-[#8b9cff] to-[#a78bfa] mx-auto rounded-full blur-sm shadow-xl shadow-[#5865f2]/40"></div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 mb-6 text-lg sm:text-xl drop-shadow-lg">
              © 2024 Lostyo Bot. All rights reserved.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-500">
              {[
                { name: "Terms of Service", href: "#" },
                { name: "Privacy Policy", href: "#" },
                { name: "Support", href: "https://discord.gg/lostyo" },
                { name: "Dashboard", href: "/dashboard" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="hover:text-[#5865f2] transition-all duration-500 text-lg font-medium hover:underline hover:scale-110 drop-shadow-lg hover:drop-shadow-[0_0_10px_currentColor] border-0"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* CSS customizado corrigido */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          border: 0 !important;
          scrollbar-width: none !important; /* Firefox */
          -webkit-user-select: none !important; /* Safari */
          -moz-user-select: none !important;    /* Firefox */
          -ms-user-select: none !important;     /* IE10+ */
          user-select: none !important;         /* Standard */
        }
        
        /* Permite que o texto seja selecionado em campos de formulário */
        input, textarea, select {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }

        /* Previne que imagens sejam arrastadas ou clicadas */
        img {
          -webkit-user-drag: none !important;
          pointer-events: none !important;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 12px;
          border: none;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          border: none;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #5865f2, #8b9cff);
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(88, 101, 242, 0.5);
          border: none;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #4752c4, #7c8cff);
          box-shadow: 0 0 30px rgba(88, 101, 242, 0.8);
          border: none;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05);
        }

        .border-0 {
          border: 0 !important;
        }
      `}</style>
    </div>
  )
}
