import type { RuntimeConfig } from 'nuxt/schema'

declare module 'nuxt/schema' {
  interface RuntimeConfig {
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
}

export {}
