/* eslint-disable no-console */
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { rm } from 'fs/promises'
import { build } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 切换到 sandbox 目录
const sandboxDir = resolve(__dirname, '../templates/sandbox')
const outputDir = resolve(__dirname, '../public/sandbox')

process.chdir(sandboxDir)

// 构建函数
async function buildSandbox() {
  try {
    console.log('🔨 开始构建 Sandbox...\n')

    // 清理输出目录
    try {
      await rm(outputDir, { recursive: true, force: true })
      console.log('✅ 已清理输出目录\n')
    } catch (error) {
      // 目录不存在时忽略错误
    }

    // 执行构建
    await build({
      configFile: resolve(sandboxDir, 'vite.config.ts'),
      root: sandboxDir,
    })

    console.log('\n✅ Sandbox 构建完成!')
    console.log(`📦 输出目录: ${outputDir}`)
    console.log(`🌐 访问地址: http://localhost:3000/sandbox/\n`)
  } catch (error) {
    console.error('❌ 构建失败:', error)
    process.exit(1)
  }
}

buildSandbox()
