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

// 初始化 Monaco Editor
const initEditor = async () => {
  if (!editorContainer.value || typeof window === 'undefined') return

  try {
    // 动态导入 Monaco Editor
    monacoModule = await import('monaco-editor')

    // 创建编辑器实例
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
      automaticLayout: props.automaticLayout,
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
  if (editorInstance) {
    editorInstance.dispose()
    editorInstance = null
  }
})
</script>

<style lang="scss" scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
}
</style>
