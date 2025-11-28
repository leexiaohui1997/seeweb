import { Op } from 'sequelize'
import { App, initAppModel } from '~/server/models/App'
import { Code, initCodeModel } from '~/server/models/Code'
import { getAppByNameSchema } from '~/server/utils/validation/apps'

// 初始化模型
initAppModel()
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

    // 获取路由参数
    const name = getRouterParam(event, 'name')
    if (!name) {
      throw createError({
        statusCode: 400,
        message: '应用标识不能为空',
      })
    }

    // 使用 Zod 验证参数
    const validationResult = getAppByNameSchema.safeParse({ name })
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        err => `${err.path.join('.')}: ${err.message}`
      )
      throw createError({
        statusCode: 400,
        message: `参数验证失败: ${errors.join(', ')}`,
      })
    }

    const { name: validatedName } = validationResult.data

    // 查找应用（只能查询自己的应用，且未删除）
    const app = await App.findOne({
      where: {
        name: validatedName,
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

    // 查询关联的代码（合并为一条 SQL 查询）
    const codeIds: number[] = []
    if (app.templateCodeId) codeIds.push(app.templateCodeId)
    if (app.styleCodeId) codeIds.push(app.styleCodeId)
    if (app.scriptCodeId) codeIds.push(app.scriptCodeId)

    const codes =
      codeIds.length > 0
        ? await Code.findAll({
            where: {
              id: {
                [Op.in]: codeIds,
              },
              userId: user.id,
            },
          })
        : []

    // 将查询结果转换为 Map，方便后续查找
    const codeMap = new Map(codes.map(code => [code.id, code]))

    const templateCode = app.templateCodeId ? codeMap.get(app.templateCodeId) || null : null
    const styleCode = app.styleCodeId ? codeMap.get(app.styleCodeId) || null : null
    const scriptCode = app.scriptCodeId ? codeMap.get(app.scriptCodeId) || null : null

    // 构建返回数据
    const responseData: any = {
      id: app.id,
      name: app.name,
      title: app.title,
      userId: app.userId,
      createdAt: Math.floor(app.createdAt.getTime() / 1000),
      updatedAt: Math.floor(app.updatedAt.getTime() / 1000),
    }

    // 添加代码信息（如果存在）
    if (templateCode) {
      responseData.templateCode = {
        id: templateCode.id,
        content: templateCode.content,
        updatedAt: Math.floor(templateCode.updatedAt.getTime() / 1000),
      }
    }

    if (styleCode) {
      responseData.styleCode = {
        id: styleCode.id,
        content: styleCode.content,
        updatedAt: Math.floor(styleCode.updatedAt.getTime() / 1000),
      }
    }

    if (scriptCode) {
      responseData.scriptCode = {
        id: scriptCode.id,
        content: scriptCode.content,
        updatedAt: Math.floor(scriptCode.updatedAt.getTime() / 1000),
      }
    }

    return {
      success: true,
      message: '查询应用成功',
      data: responseData,
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '查询应用失败',
    })
  }
})
