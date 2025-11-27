import { initAppModel, App } from '~/server/models/App'

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

    // 查找应用（只能删除自己的应用，且未删除）
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

    // 执行软删除
    app.deletedAt = new Date()
    await app.save()

    return {
      success: true,
      message: '删除应用成功',
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '删除应用失败',
    })
  }
})
