/**
 * Monaco Editor 全局类型定义
 */

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorkerUrl?: (moduleId: string, label: string) => string
      getWorker?: (moduleId: string, label: string) => Worker
    }
  }
}

export {}
