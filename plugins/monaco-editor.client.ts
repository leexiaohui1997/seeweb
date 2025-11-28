/**
 * Monaco Editor 客户端插件
 * 配置 Monaco Editor 的 Worker 路径
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // 统一使用 CDN 作为 worker 路径，避免开发环境中的路径问题
  // 这样可以确保在所有环境中都能正常工作，且性能稳定
  const basePath = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/esm/vs'

  window.MonacoEnvironment = {
    getWorkerUrl(_moduleId: string, label: string) {
      if (label === 'json') {
        return `${basePath}/language/json/json.worker.js`
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return `${basePath}/language/css/css.worker.js`
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return `${basePath}/language/html/html.worker.js`
      }
      if (label === 'typescript' || label === 'javascript') {
        return `${basePath}/language/typescript/ts.worker.js`
      }
      return `${basePath}/editor/editor.worker.js`
    },
  }
})
