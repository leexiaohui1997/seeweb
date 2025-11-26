import { initUserModel, User } from '~/server/models/User'
import { comparePassword } from '~/shared/utils/password'
import { generateToken } from '~/server/utils/jwt'

// 初始化模型
initUserModel()

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { username, password, captcha } = body

    // 参数验证
    if (!username || !password || !captcha) {
      throw createError({
        statusCode: 400,
        message: '用户名、密码和验证码不能为空',
      })
    }

    // 验证验证码
    const sessionData = event.context.session || {}
    const storedCaptcha = sessionData?.captcha

    if (!storedCaptcha) {
      throw createError({
        statusCode: 400,
        message: '验证码已过期，请刷新后重试',
      })
    }

    if (captcha.toLowerCase() !== storedCaptcha) {
      // 验证失败后清除验证码
      if (event.context.session) {
        event.context.session.captcha = null
      }
      throw createError({
        statusCode: 400,
        message: '验证码错误',
      })
    }

    // 查找用户
    const user = await User.findOne({
      where: { username },
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误',
      })
    }

    // 验证密码
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        message: '用户名或密码错误',
      })
    }

    // 清除验证码（登录成功后）
    if (event.context.session) {
      event.context.session.captcha = null
    }

    // 生成 JWT Token
    const token = await generateToken({
      userId: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    })

    setCookie(event, 'token', token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60, // 7 天
      path: '/',
    })

    return {
      success: true,
      message: '登录成功',
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '登录失败',
    })
  }
})
