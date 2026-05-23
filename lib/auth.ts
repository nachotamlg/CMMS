import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

export interface JWTPayload {
  id: number
  email: string
  nombre: string
  rol: string
}

// Generar token JWT
export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
  
  return token
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    console.log('[v0] verifyToken - token length:', token?.length)
    if (!token) {
      console.log('[v0] verifyToken - token is empty')
      return null
    }
    const { payload } = await jwtVerify(token, secret)
    console.log('[v0] verifyToken - token verified successfully')
    return payload as unknown as JWTPayload
  } catch (error: any) {
    console.error('[v0] verifyToken - Error verifying token:', error.message)
    return null
  }
}

// Obtener usuario de la sesión actual
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  
  if (!token) return null
  
  return verifyToken(token.value)
}

// Hash de password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verificar password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Middleware para verificar autenticación
export async function requireAuth(request?: any): Promise<JWTPayload> {
  let session = await getSession()
  console.log('[v0] requireAuth - session from cookies:', !!session)
  
  // Si no hay sesión en cookies, intentar obtener del header Authorization (Bearer token)
  if (!session && request) {
    const authHeader = request.headers.get('Authorization')
    console.log('[v0] requireAuth - authHeader present:', !!authHeader)
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('[v0] requireAuth - attempting to verify Bearer token, length:', token?.length)
      session = await verifyToken(token)
      console.log('[v0] requireAuth - Bearer token verification result:', session ? 'SUCCESS' : 'FAILED')
    }
  }
  
  // Fallback: try to get userId from X-User-ID header to authenticate basic operations
  if (!session && request) {
    const userId = request.headers.get('X-User-ID')
    console.log('[v0] requireAuth - X-User-ID header present:', !!userId)
    
    if (userId) {
      // Create a minimal session from the userId header (fallback authentication)
      try {
        const id = parseInt(userId)
        console.log('[v0] requireAuth - creating session from X-User-ID:', id)
        session = {
          id,
          email: `user_${id}@system.local`,
          nombre: `User ${id}`,
          rol: 'Usuario'
        }
        console.log('[v0] requireAuth - fallback session created from X-User-ID')
      } catch (e) {
        console.error('[v0] requireAuth - failed to parse X-User-ID:', e)
      }
    }
  }
  
  if (!session) {
    console.log('[v0] requireAuth - NO SESSION FOUND - throwing 401')
    throw new Error('No autorizado')
  }
  
  console.log('[v0] requireAuth - session authenticated:', session.email)
  return session
}

// Middleware para verificar rol
export async function requireRole(roles: string[]): Promise<JWTPayload> {
  const session = await requireAuth()
  
  if (!roles.includes(session.rol)) {
    throw new Error('No tienes permisos para esta acción')
  }
  
  return session
}
