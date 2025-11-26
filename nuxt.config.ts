// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-session'],
  session: {
    session: {
      expiresIn: 5 * 60, // 5 分钟过期
    },
  },

  css: ['~/assets/scss/base.scss', 'element-plus/dist/index.css'],

  runtimeConfig: {
    // 私有配置（仅在服务端可用）
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'seeweb',
    },
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    // 公共配置（客户端和服务端都可用）
    public: {
      // 可以在这里添加公共配置
    },
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/scss/_variables.scss" as *; @use "~/assets/scss/_mixins.scss" as *;',
        },
      },
    },
  },
})
