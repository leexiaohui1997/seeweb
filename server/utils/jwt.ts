import * as jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: number
  username: string
  isAdmin: boolean
}

/**
 * 生成 JWT Token
 * @param payload Token 载荷
 * @returns JWT Token
 */
export function generateToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret || 'your-secret-key-change-in-production'

  return jwt.sign(payload, secret, {
    expiresIn: '7d', // 7 天过期
  })
}

/**
 * 验证 JWT Token
 * @param token JWT Token
 * @returns Token 载荷或 null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret || 'your-secret-key-change-in-production'

    const decoded = jwt.verify(token, secret) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

/**
 * 从请求头中提取 Token
 * @param authHeader Authorization 头
 * @returns Token 或 null
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1]
  }

  return null
}
