import { z } from 'zod'

/**
 * 查询文件列表的验证 Schema
 */
export const listFilesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1, '页码必须大于 0')),
  pageSize: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1, '每页数量必须大于 0').max(100, '每页数量不能超过 100')),
  name: z.string().optional(),
  startTime: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
  endTime: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().int().positive().optional()),
  private: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true
      if (val === 'false') return false
      return undefined
    })
    .pipe(z.boolean().optional()),
})

/**
 * 编辑文件的验证 Schema
 */
export const updateFileSchema = z.object({
  name: z.string().max(255, '文件名长度不能超过 255 位').optional(),
  private: z.boolean().optional(),
})

/**
 * 删除文件的验证 Schema
 */
export const deleteFilesSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, '至少选择一个文件'),
})
