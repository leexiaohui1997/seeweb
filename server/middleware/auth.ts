import { verifyToken } from '~/server/utils/jwt'
import { initUserModel, User } from '~/server/models/User'
import { initAppModel } from '~/server/models/App'
import { initFileModel } from '~/server/models/File'
import { initModelAssociations } from '~/server/models/index'

// 配置需要鉴权的路由（参考前端实现方式）
const authRoutes = [/^\/api\/user(\/.*)*$/]

// 初始化所有模型和关联关系
initUserModel()
initAppModel()
initFileModel()
initModelAssociations()

/**
 * 后端鉴权中间件
 * 检查请求路径是否匹配配置表中的路由，如果匹配则进行鉴权
 */
export default defineEventHandler(async event => {
  const path = event.path

  // 只对需要鉴权的路由进行鉴权
  if (!authRoutes.some(route => route.test(path))) {
    return
  }

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

    // 将用户信息挂载到 event.context 中，供后续接口使用
    event.context.user = {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 401,
      message: error.message || '鉴权失败',
    })
  }
})
