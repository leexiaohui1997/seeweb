import { z } from 'zod'

/**
 * 创建应用的验证 Schema
 */
export const createAppSchema = z.object({
  name: z
    .string()
    .min(3, '应用标识长度至少为 3 位')
    .max(50, '应用标识长度不能超过 50 位')
    .regex(/^[a-zA-Z0-9_]+$/, '应用标识只能包含字母、数字、下划线'),
  title: z.string().min(1, '应用名称不能为空').max(100, '应用名称长度不能超过 100 位'),
})

/**
 * 编辑应用的验证 Schema
 */
export const updateAppSchema = z.object({
  title: z.string().min(1, '应用名称不能为空').max(100, '应用名称长度不能超过 100 位'),
})

/**
 * 查询应用列表的验证 Schema
 */
export const listAppsSchema = z.object({
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
  title: z.string().optional(),
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
})

/**
 * 根据 name 查询应用的验证 Schema
 */
export const getAppByNameSchema = z.object({
  name: z
    .string()
    .min(3, '应用标识长度至少为 3 位')
    .max(50, '应用标识长度不能超过 50 位')
    .regex(/^[a-zA-Z0-9_]+$/, '应用标识只能包含字母、数字、下划线'),
})
