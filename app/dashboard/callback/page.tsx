"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Bot, AlertCircle } from "lucide-react"

export default function OAuthCallback() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setStatus("error")
      setError("Authorization was denied or cancelled")
      return
    }

    if (!code || !state) {
      setStatus("error")
      setError("Missing authorization code or state")
      return
    }

    // Redirect to the API callback handler
    window.location.href = `/api/auth/callback?code=${code}&state=${state}`
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 text-white flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] p-12 shadow-2xl shadow-[#5865f2]/30 border-0 text-center max-w-md">
        {status === "loading" && (
          <>
            <Bot className="w-16 h-16 text-[#5865f2] mx-auto mb-6 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-4">Authenticating...</h1>
            <p className="text-gray-300">Please wait while we log you in</p>
          </>
        )}

        {status === "success" && (
          <>
            <Bot className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">Success!</h1>
            <p className="text-gray-300">Redirecting to dashboard...</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Failed</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
