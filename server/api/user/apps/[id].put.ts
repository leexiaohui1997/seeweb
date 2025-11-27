import { initAppModel, App } from '~/server/models/App'
import { updateAppSchema } from '~/server/utils/validation/apps'

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

    // 获取应用ID
    const id = parseInt(getRouterParam(event, 'id') || '0', 10)
    if (!id || id <= 0) {
      throw createError({
        statusCode: 400,
        message: '应用ID无效',
      })
    }

    // 获取请求体
    const body = await readBody(event)

    // 使用 Zod 验证参数
    const validationResult = updateAppSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { title } = validationResult.data

    // 查找应用（只能编辑自己的应用，且未删除）
    const app = await App.findOne({
      where: {
        id,
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

    // 更新应用标题
    app.title = title
    await app.save()

    return {
      success: true,
      message: '编辑应用成功',
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
      message: error.message || '编辑应用失败',
    })
  }
})
