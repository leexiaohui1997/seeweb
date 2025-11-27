/**
 * RuntimeConfig 类型定义
 */
export interface RuntimeConfig {
  mysql: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  jwtSecret: string
  sessionSecret: string
}
