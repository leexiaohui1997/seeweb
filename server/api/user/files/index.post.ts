import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'
import { initFileModel, File } from '~/server/models/File'

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

    // 获取 runtimeConfig
    const config = useRuntimeConfig()
    const fileUploadConfig = (config as any).fileUpload || {
      maxSize: 10 * 1024 * 1024, // 10MB
      mimeTypeWhitelist: [],
      mimeTypeBlacklist: [],
      extWhitelist: [],
      extBlacklist: [],
    }

    // 读取 multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: '请选择要上传的文件',
      })
    }

    // 查找文件字段（通常字段名为 'file'）
    const fileData = formData.find(item => item.name === 'file' && item.data)
    if (!fileData || !fileData.data) {
      throw createError({
        statusCode: 400,
        message: '未找到上传的文件',
      })
    }

    const fileBuffer = fileData.data
    const originalFilename = fileData.filename || 'unknown'
    const mimetype = fileData.type || 'application/octet-stream'

    // 获取文件后缀
    const extMatch = originalFilename.match(/\.([^.]+)$/)
    const ext = extMatch ? extMatch[1].toLowerCase() : null

    // 验证文件大小
    if (fileBuffer.length > fileUploadConfig.maxSize) {
      throw createError({
        statusCode: 400,
        message: `文件大小超过限制（最大 ${Math.round(fileUploadConfig.maxSize / 1024 / 1024)}MB）`,
      })
    }

    // 验证 mimetype 白名单
    if (
      fileUploadConfig.mimeTypeWhitelist &&
      fileUploadConfig.mimeTypeWhitelist.length > 0 &&
      !fileUploadConfig.mimeTypeWhitelist.includes(mimetype)
    ) {
      throw createError({
        statusCode: 400,
        message: '不支持的文件类型',
      })
    }

    // 验证 mimetype 黑名单
    if (
      fileUploadConfig.mimeTypeBlacklist &&
      fileUploadConfig.mimeTypeBlacklist.length > 0 &&
      fileUploadConfig.mimeTypeBlacklist.includes(mimetype)
    ) {
      throw createError({
        statusCode: 400,
        message: '不支持的文件类型',
      })
    }

    // 验证 ext 白名单
    if (
      ext &&
      fileUploadConfig.extWhitelist &&
      fileUploadConfig.extWhitelist.length > 0 &&
      !fileUploadConfig.extWhitelist.includes(ext)
    ) {
      throw createError({
        statusCode: 400,
        message: '不支持的文件后缀',
      })
    }

    // 验证 ext 黑名单
    if (
      ext &&
      fileUploadConfig.extBlacklist &&
      fileUploadConfig.extBlacklist.length > 0 &&
      fileUploadConfig.extBlacklist.includes(ext)
    ) {
      throw createError({
        statusCode: 400,
        message: '不支持的文件后缀',
      })
    }

    // 生成文件标识（UUID v4）
    const key = randomUUID()

    // 确保 uploads 目录存在
    const uploadsDir = join(process.cwd(), 'uploads')
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }

    // 保存文件（文件名使用 key，不带后缀）
    const filePath = join(uploadsDir, key)
    await fs.writeFile(filePath, fileBuffer)

    // 保存文件信息到数据库
    const file = await File.create({
      key,
      name: originalFilename,
      type: mimetype,
      size: fileBuffer.length,
      ext,
      private: false,
      userId: user.id,
    })

    return {
      success: true,
      message: '文件上传成功',
      data: {
        id: file.id,
        key: file.key,
        name: file.name,
        type: file.type,
        size: file.size,
        ext: file.ext,
        private: file.private,
        createdAt: Math.floor(file.createdAt.getTime() / 1000),
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
      message: error.message || '文件上传失败',
    })
  }
})
