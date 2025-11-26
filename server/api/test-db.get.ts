import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async _event => {
  try {
    const db = getDatabase()
    const [rows] = await db.query('SELECT 1 as test, NOW() as currentTime')

    return {
      success: true,
      message: '数据库连接成功',
      data: rows,
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '数据库连接失败',
    })
  }
})
