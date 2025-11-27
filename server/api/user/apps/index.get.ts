import { Op } from 'sequelize'
import { initAppModel, App } from '~/server/models/App'
import { listAppsSchema } from '~/server/utils/validation/apps'

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

    // 获取查询参数
    const query = getQuery(event)

    // 使用 Zod 验证参数
    const validationResult = listAppsSchema.safeParse(query)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { page, pageSize, id, title, startTime, endTime } = validationResult.data

    // 构建查询条件
    const where: any = {
      userId: user.id,
      deletedAt: null, // 只查询未删除的应用
    }

    // 应用ID筛选
    if (id) {
      where.id = id
    }

    // 标题模糊搜索
    if (title) {
      where.title = {
        [Op.like]: `%${title}%`,
      }
    }

    // 创建时间范围筛选
    if (startTime || endTime) {
      where.createdAt = {}
      if (startTime) {
        where.createdAt[Op.gte] = new Date(startTime * 1000) // 时间戳转Date
      }
      if (endTime) {
        where.createdAt[Op.lte] = new Date(endTime * 1000) // 时间戳转Date
      }
    }

    // 计算偏移量
    const offset = (page - 1) * pageSize

    // 查询总数
    const total = await App.count({ where })

    // 查询列表
    const apps = await App.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']], // 按创建时间倒序
    })

    // 格式化返回数据
    const list = apps.map(app => ({
      id: app.id,
      name: app.name,
      title: app.title,
      userId: app.userId,
      createdAt: Math.floor(app.createdAt.getTime() / 1000),
      updatedAt: Math.floor(app.updatedAt.getTime() / 1000),
    }))

    return {
      success: true,
      message: '查询应用列表成功',
      data: {
        list,
        total,
        page,
        pageSize,
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
      message: error.message || '查询应用列表失败',
    })
  }
})
