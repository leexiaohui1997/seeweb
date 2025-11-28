import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sandbox/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/scss/_variables.scss" as *; @use "@/assets/scss/_mixins.scss" as *;`,
      },
    },
  },
  build: {
    outDir: '../../public/sandbox',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
})
