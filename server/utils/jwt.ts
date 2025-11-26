import { SignJWT, jwtVerify } from 'jose'

interface TokenPayload {
  userId: number
  username: string
  isAdmin: boolean
}

/**
 * 获取 JWT 密钥
 * @returns Uint8Array 格式的密钥
 */
function getSecretKey(): Uint8Array {
  const config = useRuntimeConfig()
  const secret = (config.jwtSecret as string) || 'your-secret-key-change-in-production'
  return new Uint8Array(Buffer.from(secret, 'utf-8'))
}

/**
 * 生成 JWT Token
 * @param payload Token 载荷
 * @returns JWT Token
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  const secretKey = getSecretKey()

  const jwt = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 天过期
    .sign(secretKey)

  return jwt
}

/**
 * 验证 JWT Token
 * @param token JWT Token
 * @returns Token 载荷或 null
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secretKey = getSecretKey()

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    })

    return payload as unknown as TokenPayload
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
