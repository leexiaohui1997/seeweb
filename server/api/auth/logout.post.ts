export default defineEventHandler(event => {
  try {
    // 清除 cookie 中的 token
    deleteCookie(event, 'token', {
      path: '/',
    })

    return {
      success: true,
      message: '退出登录成功',
    }
  } catch (error: any) {
    // 如果是我们创建的错误，直接抛出
    if (error.statusCode) {
      throw error
    }

    // 其他错误
    throw createError({
      statusCode: 500,
      message: error.message || '退出登录失败',
    })
  }
})
