// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@sidebase/nuxt-session', '@element-plus/nuxt', '@pinia/nuxt'],
  session: {
    session: {
      expiresIn: 5 * 60, // 5 分钟过期
    },
  },

  elementPlus: {
    importStyle: 'scss',
  },

  css: ['~/assets/scss/base.scss'],

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
    fileUpload: {
      maxSize: parseInt(process.env.FILE_UPLOAD_MAX_SIZE || '10485760'), // 10MB
      mimeTypeWhitelist: process.env.FILE_UPLOAD_MIME_TYPE_WHITELIST
        ? process.env.FILE_UPLOAD_MIME_TYPE_WHITELIST.split(',')
        : [],
      mimeTypeBlacklist: process.env.FILE_UPLOAD_MIME_TYPE_BLACKLIST
        ? process.env.FILE_UPLOAD_MIME_TYPE_BLACKLIST.split(',')
        : [],
      extWhitelist: process.env.FILE_UPLOAD_EXT_WHITELIST
        ? process.env.FILE_UPLOAD_EXT_WHITELIST.split(',')
        : [],
      extBlacklist: process.env.FILE_UPLOAD_EXT_BLACKLIST
        ? process.env.FILE_UPLOAD_EXT_BLACKLIST.split(',')
        : [],
    },
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
