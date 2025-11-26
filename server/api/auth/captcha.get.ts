import { create as createCaptcha } from 'svg-captcha'

export default defineEventHandler(event => {
  try {
    // 生成验证码
    const captcha = createCaptcha({
      size: 4, // 验证码长度
      ignoreChars: '0o1il', // 忽略容易混淆的字符
      noise: 2, // 噪声线条数
      color: true, // 彩色
      background: '#f0f0f0', // 背景色
      width: 120,
      height: 40,
    })

    // 将验证码文本存储到 session
    if (!event.context.session) {
      event.context.session = {}
    }
    event.context.session.captcha = captcha.text.toLowerCase()

    return {
      success: true,
      data: {
        svg: captcha.data, // SVG 图片数据
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || '生成验证码失败',
    })
  }
})
