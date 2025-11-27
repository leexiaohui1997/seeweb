import { initAppModel, App } from '~/server/models/App'
import { createAppSchema } from '~/server/utils/validation/apps'

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

    // 获取请求体
    const body = await readBody(event)

    // 使用 Zod 验证参数
    const validationResult = createAppSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { name, title } = validationResult.data

    // 检查应用标识是否已存在（只检查未删除的记录）
    const existingApp = await App.findOne({
      where: {
        name,
        deletedAt: null,
      },
    })

    if (existingApp) {
      throw createError({
        statusCode: 400,
        message: '应用标识已存在',
      })
    }

    // 创建应用
    const app = await App.create({
      name,
      title,
      userId: user.id,
      deletedAt: null,
    })

    return {
      success: true,
      message: '创建应用成功',
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
    // 如果是 Sequelize 唯一约束错误
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 400,
        message: '应用标识已存在',
      })
    }

    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '创建应用失败',
    })
  }
})
