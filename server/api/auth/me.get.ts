import { initUserModel, User } from '~/server/models/User'
import { verifyToken } from '~/server/utils/jwt'

// 初始化模型
initUserModel()

export default defineEventHandler(async event => {
  try {
    // 从 cookie 中获取 token
    const token = getCookie(event, 'token')
    if (!token) {
      throw createError({
        statusCode: 401,
        message: '未登录',
      })
    }

    // 验证 token
    const payload = await verifyToken(token)

    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Token 无效或已过期',
      })
    }

    // 从数据库获取用户信息（确保用户仍然存在）
    const user = await User.findByPk(payload.userId, {
      attributes: ['id', 'username', 'isAdmin', 'createdAt', 'updatedAt'],
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        message: '用户不存在',
      })
    }

    return {
      success: true,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '获取用户信息失败',
    })
  }
})
