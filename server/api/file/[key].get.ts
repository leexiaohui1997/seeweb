import { readFile } from 'fs/promises'
import { join } from 'path'
import { verifyToken } from '~/server/utils/jwt'
import { initFileModel, File } from '~/server/models/File'
import { initUserModel } from '~/server/models/User'

// 初始化模型
initFileModel()
initUserModel()

export default defineEventHandler(async event => {
  try {
    // 获取文件 key
    const key = getRouterParam(event, 'key')
    if (!key) {
      throw createError({
        statusCode: 400,
        message: '无效的文件标识',
      })
    }

    // 查找文件
    const file = await File.findOne({
      where: { key },
    })

    if (!file) {
      throw createError({
        statusCode: 404,
        message: '文件不存在',
      })
    }

    // 如果是私有文件，需要鉴权
    if (file.private) {
      // 从 cookie 中获取 token
      const token = getCookie(event, 'token')
      if (!token) {
        throw createError({
          statusCode: 401,
          message: '未登录',
        })
      }

      // 验证 token
      const payload = await verifyToken(token)
      if (!payload) {
        throw createError({
          statusCode: 401,
          message: 'Token 无效或已过期',
        })
      }

      // 验证文件所有权
      if (file.userId !== payload.userId) {
        throw createError({
          statusCode: 403,
          message: '无权访问此文件',
        })
      }
    }

    // 读取文件
    const filePath = join(process.cwd(), 'uploads', key)
    let fileBuffer: Buffer
    try {
      fileBuffer = await readFile(filePath)
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          message: '文件不存在',
        })
      }
      throw error
    }

    // 设置响应头
    setHeader(event, 'Content-Type', file.type || 'application/octet-stream')
    setHeader(event, 'Content-Length', fileBuffer.length)

    // 如果文件有原始名称，设置下载文件名
    if (file.name) {
      const filename = encodeURIComponent(file.name)
      setHeader(event, 'Content-Disposition', `inline; filename="${filename}"`)
    }

    // 返回文件内容
    return fileBuffer
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '获取文件失败',
    })
  }
})
