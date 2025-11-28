import { initCodeModel, Code } from '~/server/models/Code'
import { listCodesSchema } from '~/server/utils/validation/codes'

// 初始化模型
initCodeModel()

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

    // 获取查询参数
    const query = getQuery(event)

    // 使用 Zod 验证参数
    const validationResult = listCodesSchema.safeParse(query)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { appId, type } = validationResult.data

    // 构建查询条件
    const where: any = {
      userId: user.id, // 只查询当前用户的代码
    }

    // 按应用id筛选
    if (appId !== undefined) {
      where.appId = appId
    }

    // 按类型筛选
    if (type) {
      where.type = type
    }

    // 查询代码列表
    const codes = await Code.findAll({
      where,
      order: [['updatedAt', 'DESC']], // 按更新时间倒序
    })

    // 格式化返回数据
    const list = codes.map(code => ({
      id: code.id,
      userId: code.userId,
      type: code.type,
      content: code.content,
      appId: code.appId,
      createdAt: Math.floor(code.createdAt.getTime() / 1000),
      updatedAt: Math.floor(code.updatedAt.getTime() / 1000),
    }))

    return {
      success: true,
      message: '查询代码列表成功',
      data: {
        list,
        total: list.length,
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
      message: error.message || '查询代码列表失败',
    })
  }
})
