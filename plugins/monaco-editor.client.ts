/* eslint-disable new-cap */
/**
 * Monaco Editor 客户端插件
 * 配置 Monaco Editor 的 Worker
 * 使用 getWorker 方法直接导入 worker，让 Vite 自动处理路径
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return

  // 使用 getWorker 方法直接导入 worker 模块
  // Vite 会自动处理这些导入，确保 worker 通过开发服务器正确加载
  window.MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      // 动态导入 worker 模块，使用 Vite 的 ?worker 后缀
      const getWorkerModule = () => {
        switch (label) {
          case 'json':
            return import(
              /* @vite-ignore */
              'monaco-editor/esm/vs/language/json/json.worker?worker'
            ).then(module => new module.default())
          case 'css':
          case 'scss':
          case 'less':
            return import(
              /* @vite-ignore */
              'monaco-editor/esm/vs/language/css/css.worker?worker'
            ).then(module => new module.default())
          case 'html':
          case 'handlebars':
          case 'razor':
            return import(
              /* @vite-ignore */
              'monaco-editor/esm/vs/language/html/html.worker?worker'
            ).then(module => new module.default())
          case 'typescript':
          case 'javascript':
            return import(
              /* @vite-ignore */
              'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
            ).then(module => new module.default())
          default:
            return import(
              /* @vite-ignore */
              'monaco-editor/esm/vs/editor/editor.worker?worker'
            ).then(module => new module.default())
        }
      }

      // Monaco Editor 支持返回 Promise<Worker>
      return getWorkerModule() as any
    },
  }
})
