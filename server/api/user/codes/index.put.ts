import { initCodeModel, Code } from '~/server/models/Code'
import { initAppModel, App } from '~/server/models/App'
import { createOrUpdateCodeSchema } from '~/server/utils/validation/codes'

// 初始化模型
initCodeModel()
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
    const validationResult = createOrUpdateCodeSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { id, appId, type, content } = validationResult.data

    // 如果提供了 appId，验证应用属于当前用户
    if (appId) {
      const app = await App.findOne({
        where: {
          id: appId,
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
    }

    let code: Code | null = null
    let isNewCode = false

    // 如果提供了 id，直接根据 id 更新
    if (id) {
      code = await Code.findOne({
        where: {
          id,
          userId: user.id, // 验证代码属于当前用户
        },
      })

      if (!code) {
        throw createError({
          statusCode: 404,
          message: '代码不存在或无权限',
        })
      }

      // 更新代码内容
      await code.update({
        content,
      })
    } else {
      // 如果未提供 id，根据 userId、appId、type 查找或创建
      const whereCondition: any = {
        userId: user.id,
        type,
      }

      if (appId) {
        whereCondition.appId = appId
      } else {
        whereCondition.appId = null
      }

      const existingCode = await Code.findOne({
        where: whereCondition,
      })

      if (existingCode) {
        // 更新现有代码
        code = existingCode
        await code.update({
          content,
        })
      } else {
        // 创建新代码
        code = await Code.create({
          userId: user.id,
          type,
          content,
          appId: appId || null,
        })
        isNewCode = true
      }
    }

    // 如果创建了新代码且 appId 存在，需要更新应用表对应的代码关联字段
    if (isNewCode && appId) {
      const updateField = {
        template: 'templateCodeId',
        script: 'scriptCodeId',
        style: 'styleCodeId',
      }[type]

      if (updateField) {
        await App.update(
          {
            [updateField]: code.id,
          },
          {
            where: {
              id: appId,
              userId: user.id,
            },
          }
        )
      }
    }

    return {
      success: true,
      message: isNewCode ? '创建代码成功' : '更新代码成功',
      data: {
        id: code.id,
        userId: code.userId,
        type: code.type,
        content: code.content,
        appId: code.appId,
        createdAt: Math.floor(code.createdAt.getTime() / 1000),
        updatedAt: Math.floor(code.updatedAt.getTime() / 1000),
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
      message: error.message || '保存代码失败',
    })
  }
})
