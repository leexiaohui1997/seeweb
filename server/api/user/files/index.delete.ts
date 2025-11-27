import { promises as fs } from 'fs'
import { join } from 'path'
import { initFileModel, File } from '~/server/models/File'
import { deleteFilesSchema } from '~/server/utils/validation/files'

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

    // 获取请求体
    const body = await readBody(event)

    // 使用 Zod 验证参数
    const validationResult = deleteFilesSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { ids } = validationResult.data

    // 查询文件（只查询当前用户的文件）
    const files = await File.findAll({
      where: {
        id: ids,
        userId: user.id,
      },
    })

    if (files.length === 0) {
      throw createError({
        statusCode: 404,
        message: '未找到要删除的文件',
      })
    }

    const uploadsDir = join(process.cwd(), 'uploads')
    const deletedIds: number[] = []
    const errors: string[] = []

    // 删除每个文件
    for (const file of files) {
      try {
        // 删除物理文件
        const filePath = join(uploadsDir, file.key)
        try {
          await fs.unlink(filePath)
        } catch (error: any) {
          // 文件不存在也继续删除数据库记录
          if (error.code !== 'ENOENT') {
            throw error
          }
        }

        // 删除数据库记录
        await file.destroy()
        deletedIds.push(file.id)
      } catch (error: any) {
        errors.push(`文件 ${file.id} 删除失败: ${error.message}`)
      }
    }

    if (deletedIds.length === 0) {
      throw createError({
        statusCode: 500,
        message: errors.join('; ') || '删除文件失败',
      })
    }

    return {
      success: true,
      message: `成功删除 ${deletedIds.length} 个文件${errors.length > 0 ? `，${errors.length} 个失败` : ''}`,
      data: {
        deletedIds,
        errors: errors.length > 0 ? errors : undefined,
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
      message: error.message || '删除文件失败',
    })
  }
})
