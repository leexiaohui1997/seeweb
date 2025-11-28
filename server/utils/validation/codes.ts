import { z } from 'zod'

/**
 * 创建或更新代码的验证 Schema
 */
export const createOrUpdateCodeSchema = z.object({
  id: z.number().int().positive('代码id必须为正整数').optional(),
  appId: z.number().int().positive('应用id必须为正整数').optional(),
  type: z.enum(['template', 'script', 'style'], {
    message: '代码类型必须是 template、script 或 style 之一',
  }),
  content: z.string(),
})

/**
 * 查询代码列表的验证 Schema
 */
export const listCodesSchema = z.object({
  appId: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive('应用id必须为正整数').optional()),
  type: z
    .enum(['template', 'script', 'style'], {
      message: '代码类型必须是 template、script 或 style 之一',
    })
    .optional(),
})
