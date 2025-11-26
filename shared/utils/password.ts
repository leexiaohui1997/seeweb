import bcrypt from 'bcryptjs'

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * 验证密码强度
 * @param password 密码
 * @returns 验证结果 { valid: boolean, message?: string }
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 8) {
    return { valid: false, message: '密码长度至少为 8 位' }
  }

  // 至少包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      message: '密码必须包含字母和数字',
    }
  }

  return { valid: true }
}
