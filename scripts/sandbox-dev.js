/* eslint-disable no-console */
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 切换到 sandbox 目录
const sandboxDir = resolve(__dirname, '../templates/sandbox')
process.chdir(sandboxDir)

// 启动开发服务器
async function startDevServer() {
  try {
    const server = await createServer({
      configFile: resolve(sandboxDir, 'vite.config.ts'),
      root: sandboxDir,
    })

    await server.listen()

    console.log('\n🚀 Sandbox 开发服务器已启动')
    console.log(`📍 访问地址: http://localhost:${server.config.server.port}/sandbox/\n`)
  } catch (error) {
    console.error('❌ 启动开发服务器失败:', error)
    process.exit(1)
  }
}

startDevServer()
