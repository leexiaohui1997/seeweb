import { initUserModel, User } from '~/server/models/User'
import { hashPassword, validatePasswordStrength } from '~/shared/utils/password'

// 初始化模型
initUserModel()

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { username, password, confirmPassword } = body

    // 参数验证
    if (!username || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        message: '用户名、密码和确认密码不能为空',
      })
    }

    // 用户名格式验证（3-50 字符，字母数字下划线）
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
      throw createError({
        statusCode: 400,
        message: '用户名格式不正确，只能包含字母、数字、下划线，长度 3-50 位',
      })
    }

    // 密码强度验证
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        message: passwordValidation.message,
      })
    }

    // 确认密码匹配
    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        message: '两次输入的密码不一致',
      })
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username },
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: '用户名已存在',
      })
    }

    // 检查是否是首位用户（自动设为管理员）
    const userCount = await User.count()
    const isAdmin = userCount === 0

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      isAdmin,
    })

    return {
      success: true,
      message: '注册成功',
      data: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      },
    }
  } catch (error: any) {
    // 如果是 Sequelize 唯一约束错误
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 400,
        message: '用户名已存在',
      })
    }

    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '注册失败',
    })
  }
})
