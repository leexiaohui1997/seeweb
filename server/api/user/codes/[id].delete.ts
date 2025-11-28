import { initCodeModel, Code } from '~/server/models/Code'
import { initAppModel, App } from '~/server/models/App'

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

    // 获取路由参数
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: '代码id不能为空',
      })
    }

    const codeId = parseInt(id, 10)
    if (isNaN(codeId) || codeId <= 0) {
      throw createError({
        statusCode: 400,
        message: '无效的代码id',
      })
    }

    // 查找代码，验证所有权
    const code = await Code.findOne({
      where: {
        id: codeId,
        userId: user.id,
      },
    })

    if (!code) {
      throw createError({
        statusCode: 404,
        message: '代码不存在或无权限',
      })
    }

    // 检查是否有应用关联此代码，如果有，需要将应用表的对应字段设置为 NULL
    if (code.appId) {
      const updateFields: any = {}
      if (code.type === 'template') {
        updateFields.templateCodeId = null
      } else if (code.type === 'script') {
        updateFields.scriptCodeId = null
      } else if (code.type === 'style') {
        updateFields.styleCodeId = null
      }

      if (Object.keys(updateFields).length > 0) {
        await App.update(updateFields, {
          where: {
            id: code.appId,
            userId: user.id,
          },
        })
      }
    }

    // 删除代码记录
    await code.destroy()

    return {
      success: true,
      message: '删除代码成功',
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '删除代码失败',
    })
  }
})
