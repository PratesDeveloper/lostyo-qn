"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Sparkles } from "lucide-react"
import Link from "next/link"

// Componente de partículas para o 404
const NotFoundParticles = () => {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      opacity: number
      speed: number
      color: string
      delay: number
    }>
  >([])

  useEffect(() => {
    const colors = ["#5865f2", "#ffffff", "#8b9cff", "#c7d2fe", "#a78bfa", "#f472b6"]
    const generateParticles = () => {
      const newParticles = []

      // Partículas pequenas com blur
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.6 + 0.2,
          speed: Math.random() * 40 + 30,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 5,
        })
      }

      setParticles(newParticles)
    }

    generateParticles()
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
            background: `radial-gradient(circle, ${particle.color}, ${particle.color}80, transparent)`,
            opacity: particle.opacity,
            animation: `notFoundFloat ${particle.speed}s infinite linear ${particle.delay}s`,
            filter: "blur(2px)",
            borderRadius: "50%",
            border: "none",
          }}
        />
      ))}


      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`bg-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 400 + 200}px`,
            height: `${Math.random() * 400 + 200}px`,
            background: `radial-gradient(circle, ${
              ["#5865f2", "#8b9cff", "#a78bfa"][Math.floor(Math.random() * 3)]
            }08, transparent)`,
            animation: `notFoundMegaFloat ${Math.random() * 80 + 60}s infinite linear`,
            filter: "blur(100px)",
            border: "none",
          }}
        />
      ))}

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#5865f2]/10 via-transparent to-[#8b9cff]/10 opacity-50 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-white/8 to-transparent opacity-30 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-gradient-to-tr from-[#a78bfa]/10 to-transparent opacity-40 blur-3xl rounded-full" />
      </div>

      <style jsx>{`
        @keyframes notFoundFloat {
          0% { 
            transform: translateY(100vh) translateX(-15px) rotate(0deg) scale(0.8); 
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(-100vh) translateX(15px) rotate(360deg) scale(1.2); 
            opacity: 0;
          }
        }
        @keyframes notFoundMegaFloat {
          0% { transform: translateY(100vh) translateX(-80px) scale(0.8); }
          100% { transform: translateY(-100vh) translateX(80px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white overflow-hidden relative">
      <NotFoundParticles />

      {/* Overlay gradiente com blur */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/50 via-gray-900/30 to-black/50 backdrop-blur-sm pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* 404 Number */}
          <div className="mb-8 sm:mb-12">
            <div className="relative inline-block">
              <h1 className="text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-black mb-4 bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-none tracking-tight drop-shadow-2xl">
                404
              </h1>
              <div className="absolute inset-0 text-8xl sm:text-9xl md:text-[12rem] lg:text-[14rem] font-black bg-gradient-to-br from-[#5865f2]/20 via-[#8b9cff]/20 to-[#a78bfa]/20 bg-clip-text text-transparent animate-pulse blur-sm">
                404
              </div>
            </div>
            <div className="w-32 h-2 bg-gradient-to-r from-[#5865f2] via-[#8b9cff] to-[#a78bfa] mx-auto rounded-full blur-sm shadow-2xl shadow-[#5865f2]/50"></div>
          </div>

          {/* Error Message */}
          <div className="mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-b from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-xl">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light drop-shadow-lg">
              Oops! The page you're looking for seems to have gotten lost in{" "}
              <span className="text-white font-medium bg-gradient-to-r from-[#5865f2] to-[#8b9cff] bg-clip-text text-transparent">
                digital space
              </span>
              .
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-center items-center mb-16">
            <Button
              size="lg"
              asChild
              className="group bg-gradient-to-r from-[#5865f2]/90 via-[#4752c4]/80 to-[#3c45a5]/70 hover:from-[#4752c4] hover:via-[#3c45a5] hover:to-[#2f3b94] text-white px-10 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl font-bold shadow-2xl shadow-[#5865f2]/60 hover:shadow-[#5865f2]/80 transition-all duration-500 hover:scale-110 rounded-2xl backdrop-blur-2xl relative overflow-hidden border-0"
            >
              <Link href="/">
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-3 relative z-10 drop-shadow-lg" />
                <span className="relative z-10 drop-shadow-lg">Back to Home</span>
              </Link>
            </Button>
          </div>

          {/* Decorative Elements */}
          <div className="flex justify-center items-center space-x-4 opacity-60">
            <div className="w-2 h-2 bg-[#5865f2] rounded-full animate-ping"></div>
            <div className="w-3 h-3 bg-[#8b9cff] rounded-full animate-pulse"></div>
            <Sparkles className="w-8 h-8 text-[#5865f2] animate-pulse drop-shadow-lg" />
            <div className="w-3 h-3 bg-[#a78bfa] rounded-full animate-pulse delay-500"></div>
            <div className="w-2 h-2 bg-[#f472b6] rounded-full animate-ping delay-1000"></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        * {
          border: 0 !important;
        }
        
        .border-0 {
          border: 0 !important;
        }

        html, body {
          overflow: hidden !important;
          height: 100vh !important;
        }

        ::-webkit-scrollbar {
          display: none !important;
        }

        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          -webkit-user-select: none !important; /* Safari */
          -moz-user-select: none !important;    /* Firefox */
          -ms-user-select: none !important;     /* IE10+ */
          user-select: none !important;         /* Standard */
        }
          *:not(input):not(textarea):not(select) {
          user-select: none !important;
        }

        img {
          user-select: none !important;
          -webkit-user-drag: none !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  )
}
