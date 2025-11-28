import { App, initAppModel } from '~/server/models/App'
import { getAppByNameSchema } from '~/server/utils/validation/apps'

// 初始化模型
initAppModel()

export default defineEventHandler(async event => {
  try {
    // 检查用户是否已登录（由中间件处理）
    const user = event.context.user
    if (!user) {
      throw createError({
        statusCode: 401,
        message: '未登录',
      })
    }

    // 获取路由参数
    const name = getRouterParam(event, 'name')
    if (!name) {
      throw createError({
        statusCode: 400,
        message: '应用标识不能为空',
      })
    }

    // 使用 Zod 验证参数
    const validationResult = getAppByNameSchema.safeParse({ name })
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { name: validatedName } = validationResult.data

    // 查找应用（只能查询自己的应用，且未删除）
    const app = await App.findOne({
      where: {
        name: validatedName,
        userId: user.id,
        deletedAt: null,
      },
    })

    if (!app) {
      throw createError({
        statusCode: 404,
        message: '应用不存在或无权限',
      })
    }

    return {
      success: true,
      message: '查询应用成功',
      data: {
        id: app.id,
        name: app.name,
        title: app.title,
        userId: app.userId,
        createdAt: Math.floor(app.createdAt.getTime() / 1000),
        updatedAt: Math.floor(app.updatedAt.getTime() / 1000),
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
      message: error.message || '查询应用失败',
    })
  }
})
