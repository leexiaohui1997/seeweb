<template>
  <ClientOnly>
    <div ref="editorContainer" class="monaco-editor-container"></div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type * as monaco from 'monaco-editor'

export interface MonacoEditorProps {
  modelValue?: string
  language?: string
  theme?: 'vs' | 'vs-dark' | 'hc-black'
  readOnly?: boolean
  minimap?: boolean
  fontSize?: number
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval'
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded'
  automaticLayout?: boolean
  tabSize?: number
  formatOnPaste?: boolean
  formatOnType?: boolean
}

const props = withDefaults(defineProps<MonacoEditorProps>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'vs',
  readOnly: false,
  minimap: true,
  fontSize: 14,
  lineNumbers: 'on',
  wordWrap: 'off',
  automaticLayout: true,
  tabSize: 2,
  formatOnPaste: true,
  formatOnType: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'editor-mounted': [editor: monaco.editor.IStandaloneCodeEditor]
  'editor-ready': [editor: monaco.editor.IStandaloneCodeEditor]
}>()

const editorContainer = ref<HTMLDivElement>()
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let monacoModule: typeof monaco | null = null
let resizeObserver: ResizeObserver | null = null
// 记录上一次的容器尺寸，用于防止无限循环
let lastContainerSize: { width: number; height: number } | null = null
// 标记是否正在执行布局更新，防止循环触发
let isUpdatingLayout = false

// 防抖函数 - 返回可清理的函数
const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number
): {
  debounced: (...args: Parameters<T>) => void
  cancel: () => void
} => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return {
    debounced: (...args: Parameters<T>) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        func(...args)
        timeout = null
      }, wait)
    },
    cancel: () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    },
  }
}

// 获取容器当前尺寸
const getContainerSize = (): { width: number; height: number } | null => {
  if (!editorContainer.value) return null
  return {
    width: editorContainer.value.clientWidth,
    height: editorContainer.value.clientHeight,
  }
}

// 检查尺寸是否真的发生了变化（允许 1px 的误差）
const hasSizeChanged = (
  oldSize: { width: number; height: number } | null,
  newSize: { width: number; height: number } | null
): boolean => {
  if (!oldSize || !newSize) return true
  const threshold = 1 // 1px 的容差
  return (
    Math.abs(oldSize.width - newSize.width) > threshold ||
    Math.abs(oldSize.height - newSize.height) > threshold
  )
}

// 更新编辑器布局
const updateEditorLayout = () => {
  if (!editorInstance || isUpdatingLayout) return

  // 获取当前容器尺寸
  const currentSize = getContainerSize()
  if (!currentSize) return

  // 检查尺寸是否真的发生了变化
  if (!hasSizeChanged(lastContainerSize, currentSize)) {
    return
  }

  // 标记正在更新布局，防止循环触发
  isUpdatingLayout = true

  // 暂时断开 ResizeObserver，防止布局更新时触发新的 resize 事件
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  // 使用 requestAnimationFrame 确保布局更新在下一帧执行
  requestAnimationFrame(() => {
    if (editorInstance && editorContainer.value) {
      // 执行布局更新，Monaco Editor 会自动使用容器尺寸
      editorInstance.layout()

      // 等待布局完成后，再更新记录的尺寸并重新连接 ResizeObserver
      requestAnimationFrame(() => {
        // 再次执行一次布局，确保尺寸完全匹配
        if (editorInstance) {
          editorInstance.layout()
        }

        // 再等待一帧，确保布局完全稳定
        requestAnimationFrame(() => {
          // 再次获取并更新记录的尺寸
          const finalSize = getContainerSize()
          if (finalSize) {
            lastContainerSize = finalSize
          }

          // 重新连接 ResizeObserver
          if (resizeObserver && editorContainer.value) {
            resizeObserver.observe(editorContainer.value)
          }

          // 重置标记
          isUpdatingLayout = false
        })
      })
    } else {
      // 如果编辑器实例不存在，直接重置标记
      isUpdatingLayout = false
    }
  })
}

// 防抖后的布局更新函数
const { debounced: debouncedLayoutUpdate, cancel: cancelLayoutUpdate } = debounce(
  updateEditorLayout,
  150
)

// 设置 ResizeObserver 监听容器尺寸变化
const setupResizeObserver = () => {
  if (!editorContainer.value || typeof window === 'undefined') return

  // 清理旧的 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 如果容器尺寸还未记录，则初始化记录
  if (!lastContainerSize) {
    lastContainerSize = getContainerSize()
  }

  // 创建新的 ResizeObserver
  resizeObserver = new ResizeObserver(() => {
    // 如果正在更新布局，忽略新的 resize 事件
    if (isUpdatingLayout) return

    // 使用防抖延迟布局更新，避免频繁更新导致闪烁
    debouncedLayoutUpdate()
  })

  // 开始观察容器尺寸变化
  resizeObserver.observe(editorContainer.value)
}

// 初始化 Monaco Editor
const initEditor = async () => {
  if (!editorContainer.value || typeof window === 'undefined') return

  try {
    // 动态导入 Monaco Editor
    monacoModule = await import('monaco-editor')

    // 创建编辑器实例
    // 注意：禁用 automaticLayout，改为手动控制布局更新
    editorInstance = monacoModule.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language,
      theme: props.theme,
      readOnly: props.readOnly,
      minimap: {
        enabled: props.minimap,
      },
      fontSize: props.fontSize,
      lineNumbers: props.lineNumbers,
      wordWrap: props.wordWrap,
      // 禁用自动布局，改为使用 ResizeObserver 手动控制
      automaticLayout: false,
      tabSize: props.tabSize,
      formatOnPaste: props.formatOnPaste,
      formatOnType: props.formatOnType,
      scrollBeyondLastLine: false,
      roundedSelection: false,
      cursorBlinking: 'smooth',
      renderWhitespace: 'selection',
      selectOnLineNumbers: true,
      matchBrackets: 'always',
      autoIndent: 'full',
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      snippetSuggestions: 'top',
      fixedOverflowWidgets: true,
    })

    // 监听内容变化
    editorInstance.onDidChangeModelContent(() => {
      const value = editorInstance?.getValue() || ''
      emit('update:modelValue', value)
    })

    // 初始化时立即执行一次布局（在设置 ResizeObserver 之前）
    nextTick(() => {
      if (editorInstance) {
        editorInstance.layout()
        // 记录初始尺寸
        lastContainerSize = getContainerSize()
      }
      // 设置 ResizeObserver 监听容器尺寸变化
      setupResizeObserver()
    })

    emit('editor-mounted', editorInstance)
    emit('editor-ready', editorInstance)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Monaco Editor:', error)
  }
}

// 更新编辑器内容
const updateValue = (value: string) => {
  if (editorInstance && editorInstance.getValue() !== value) {
    editorInstance.setValue(value)
  }
}

// 更新语言
const updateLanguage = (language: string) => {
  if (editorInstance && monacoModule) {
    const model = editorInstance.getModel()
    if (model) {
      monacoModule.editor.setModelLanguage(model, language)
    }
  }
}

// 更新主题
const updateTheme = (theme: string) => {
  if (editorInstance && monacoModule) {
    monacoModule.editor.setTheme(theme)
  }
}

// 监听 props 变化
watch(
  () => props.modelValue,
  newValue => {
    updateValue(newValue)
  }
)

watch(
  () => props.language,
  newLanguage => {
    updateLanguage(newLanguage)
  }
)

watch(
  () => props.theme,
  newTheme => {
    updateTheme(newTheme)
  }
)

// 暴露编辑器实例方法
defineExpose({
  getEditor: () => editorInstance,
  format: () => {
    if (editorInstance) {
      editorInstance.getAction('editor.action.formatDocument')?.run()
    }
  },
  getValue: () => editorInstance?.getValue() || '',
  setValue: (value: string) => {
    if (editorInstance) {
      editorInstance.setValue(value)
    }
  },
})

onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

onBeforeUnmount(() => {
  // 取消待执行的布局更新
  cancelLayoutUpdate()

  // 重置更新标记
  isUpdatingLayout = false

  // 清理 ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  // 清理编辑器实例
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }

  // 清理尺寸记录
  lastContainerSize = null
})
</script>

<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
}
</style>
