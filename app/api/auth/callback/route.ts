import { type NextRequest, NextResponse } from "next/server"

const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI!,
  apiEndpoint: "https://discord.com/api/v10",
}

export async function GET(request: NextRequest) {
  console.log('[AUTH] OAuth callback initiated')
  
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    console.log('[AUTH] Callback params:', { 
      hasCode: !!code, 
      hasState: !!state, 
      error,
      url: request.url 
    })

    // Handle OAuth errors
    if (error) {
      console.error('[AUTH] OAuth error:', error)
      const errorMessages: Record<string, string> = {
        'access_denied': 'Acesso negado pelo usuário',
        'invalid_request': 'Requisição inválida',
        'unauthorized_client': 'Cliente não autorizado',
        'unsupported_response_type': 'Tipo de resposta não suportado',
        'invalid_scope': 'Escopo inválido',
        'server_error': 'Erro interno do servidor Discord',
        'temporarily_unavailable': 'Serviço temporariamente indisponível'
      }
      
      const errorMessage = errorMessages[error] || 'Erro desconhecido na autenticação'
      return NextResponse.redirect(new URL(`/?error=oauth_error&message=${encodeURIComponent(errorMessage)}`, request.url))
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('[AUTH] Missing required parameters:', { code: !!code, state: !!state })
      return NextResponse.redirect(new URL("/?error=missing_params&message=Parâmetros de autenticação ausentes", request.url))
    }

    // Validate environment variables
    if (!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.clientSecret || !DISCORD_CONFIG.redirectUri) {
      console.error('[AUTH] Missing Discord configuration')
      return NextResponse.redirect(new URL("/?error=config_error&message=Configuração do Discord incompleta", request.url))
    }

    console.log('[AUTH] Exchanging code for tokens...')

    // Exchange code for tokens
    const tokenResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "LostyoBot/1.0",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        client_secret: DISCORD_CONFIG.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_CONFIG.redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[AUTH] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      })
      
      let errorMessage = 'Falha na troca de tokens'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error_description || errorData.error || errorMessage
      } catch (e) {
        // Error text is not JSON, use default message
      }
      
      return NextResponse.redirect(new URL(`/?error=token_exchange_failed&message=${encodeURIComponent(errorMessage)}`, request.url))
    }

    const tokens = await tokenResponse.json()
    console.log('[AUTH] Tokens received successfully')

    // Fetch user data
    console.log('[AUTH] Fetching user data...')
    const userResponse = await fetch(`${DISCORD_CONFIG.apiEndpoint}/users/@me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "User-Agent": "LostyoBot/1.0",
      },
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('[AUTH] Failed to fetch user data:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      })
      return NextResponse.redirect(new URL("/?error=user_fetch_failed&message=Falha ao obter dados do usuário", request.url))
    }

    const userData = await userResponse.json()
    console.log('[AUTH] User data fetched:', { 
      id: userData.id, 
      username: userData.username,
      global_name: userData.global_name 
    })

    // Create response and set cookies
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === "production"
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    }

    // Access token (shorter expiry)
    response.cookies.set("discord_access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: tokens.expires_in || 604800, // 7 days default
    })

    // Refresh token (longer expiry)
    if (tokens.refresh_token) {
      response.cookies.set("discord_refresh_token", tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      })
    }

    // User data cache (short expiry)
    response.cookies.set("discord_user", JSON.stringify(userData), {
      ...cookieOptions,
      maxAge: 3600, // 1 hour
    })

    console.log('[AUTH] Authentication successful, redirecting to dashboard')
    return response

  } catch (error) {
    console.error('[AUTH] Unexpected error in OAuth callback:', error)
    
    let errorMessage = 'Erro interno do servidor'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.redirect(new URL(`/?error=callback_error&message=${encodeURIComponent(errorMessage)}`, request.url))
  }
}