import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-ID',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }
  
  // Rutas públicas que no requieren autenticación
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/session']
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Verificar token para rutas protegidas
  if (pathname.startsWith('/api') || pathname.startsWith('/dashboard')) {
    let session = null
    
    // PRIORITY 1: Check Authorization header (Bearer token)
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      session = await verifyToken(token)
    }
    
    // PRIORITY 2: Check X-User-ID header (fallback for cross-origin)
    if (!session) {
      const userId = request.headers.get('X-User-ID')
      if (userId) {
        // Allow request to proceed - the API route will handle auth via X-User-ID
        return NextResponse.next()
      }
    }
    
    // PRIORITY 3: Check cookie token
    if (!session) {
      const token = request.cookies.get('token')
      if (token) {
        session = await verifyToken(token.value)
      }
    }
    
    if (!session) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/equipos/:path*',
    '/ordenes/:path*',
    '/mantenimientos/:path*',
  ],
}
