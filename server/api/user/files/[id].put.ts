import { initFileModel, File } from '~/server/models/File'
import { updateFileSchema } from '~/server/utils/validation/files'

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

    // 获取文件 ID
    const id = parseInt(getRouterParam(event, 'id') || '0', 10)
    if (!id || isNaN(id)) {
      throw createError({
        statusCode: 400,
        message: '无效的文件 ID',
      })
    }

    // 获取请求体
    const body = await readBody(event)

    // 使用 Zod 验证参数
    const validationResult = updateFileSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { name, private: isPrivate } = validationResult.data

    // 查找文件
    const file = await File.findByPk(id)
    if (!file) {
      throw createError({
        statusCode: 404,
        message: '文件不存在',
      })
    }

    // 验证文件所有权
    if (file.userId !== user.id) {
      throw createError({
        statusCode: 403,
        message: '无权编辑此文件',
      })
    }

    // 更新文件信息
    const updateData: any = {}
    if (name !== undefined) {
      updateData.name = name
    }
    if (isPrivate !== undefined) {
      updateData.private = isPrivate
    }

    await file.update(updateData)

    return {
      success: true,
      message: '文件更新成功',
      data: {
        id: file.id,
        key: file.key,
        name: file.name,
        type: file.type,
        size: file.size,
        ext: file.ext,
        private: file.private,
        createdAt: Math.floor(file.createdAt.getTime() / 1000),
        updatedAt: Math.floor(file.updatedAt.getTime() / 1000),
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
      message: error.message || '文件更新失败',
    })
  }
})
