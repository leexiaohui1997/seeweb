import { Op } from 'sequelize'
import { initFileModel, File } from '~/server/models/File'
import { listFilesSchema } from '~/server/utils/validation/files'

// 初始化模型
initFileModel()

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
    const validationResult = listFilesSchema.safeParse(query)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { page, pageSize, name, startTime, endTime, private: isPrivate } = validationResult.data

    // 构建查询条件
    const where: any = {
      userId: user.id, // 只查询当前用户的文件
    }

    // 文件名模糊搜索
    if (name) {
      where.name = {
        [Op.like]: `%${name}%`,
      }
    }

    // 上传时间范围筛选
    if (startTime || endTime) {
      where.createdAt = {}
      if (startTime) {
        where.createdAt[Op.gte] = new Date(startTime * 1000) // 时间戳转Date
      }
      if (endTime) {
        where.createdAt[Op.lte] = new Date(endTime * 1000) // 时间戳转Date
      }
    }

    // 是否公开筛选
    if (isPrivate !== undefined) {
      where.private = isPrivate
    }

    // 计算偏移量
    const offset = (page - 1) * pageSize

    // 查询总数
    const total = await File.count({ where })

    // 查询列表
    const files = await File.findAll({
      where,
      limit: pageSize,
      offset,
      order: [['createdAt', 'DESC']], // 按创建时间倒序
    })

    // 格式化返回数据
    const list = files.map(file => ({
      id: file.id,
      key: file.key,
      name: file.name,
      type: file.type,
      size: file.size,
      ext: file.ext,
      private: file.private,
      userId: file.userId,
      createdAt: Math.floor(file.createdAt.getTime() / 1000),
      updatedAt: Math.floor(file.updatedAt.getTime() / 1000),
    }))

    return {
      success: true,
      message: '查询文件列表成功',
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
      message: error.message || '查询文件列表失败',
    })
  }
})
