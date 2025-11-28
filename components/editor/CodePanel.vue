<template>
  <div class="panel">
    <div class="panel-top">
      <div class="panel-top-left">
        <span class="panel-top-title">{{ typeLabel }}</span>
        <div class="panel-top-actions">
          <el-button
            v-show="!dialogVisible"
            type="primary"
            size="small"
            :icon="Edit"
            link
            @click="dialogVisible = true"
          />
        </div>
      </div>
    </div>
    <div class="panel-content">
      <EditorMonacoEditor
        v-if="!dialogVisible"
        :model-value="codeValue"
        :language="editorLanguage"
        :theme="editorTheme"
        @update:model-value="handleCodeChange"
      />
    </div>
  </div>

  <div>
    <el-dialog
      v-model="dialogVisible"
      width="1000px"
      top="5vh"
      :modal="false"
      draggable
      modal-penetrable
    >
      <div class="panel wrapper">
        <div class="panel-top">
          <span class="panel-top-title">{{ typeLabel }}</span>
        </div>
        <div class="panel-content">
          <EditorMonacoEditor
            :key="`dialog-${type}`"
            :model-value="codeValue"
            :language="editorLanguage"
            :theme="editorTheme"
            @update:model-value="handleCodeChange"
          />
        </div>
      </div>

      <template #header>
        <span>编辑{{ typeLabel }}</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'

const props = defineProps<{
  type: 'template' | 'script' | 'style'
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const typeLabel = computed(() => {
  return {
    template: '模板',
    script: '脚本',
    style: '样式',
  }[props.type]
})

const dialogVisible = ref(false)
const codeValue = ref(props.modelValue || '')

// 根据 type 映射到 Monaco Editor 语言
const editorLanguage = computed(() => {
  const languageMap: Record<'template' | 'script' | 'style', string> = {
    template: 'html',
    script: 'typescript',
    style: 'scss',
  }
  return languageMap[props.type]
})

// 编辑器主题（可以根据系统主题动态调整）
const editorTheme = computed(() => {
  // 可以根据需要切换主题：'vs' | 'vs-dark' | 'hc-black'
  return 'vs'
})

// 处理代码变化
const handleCodeChange = (value: string) => {
  codeValue.value = value
  emit('update:modelValue', value)
}

// 监听外部值变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== undefined && newValue !== codeValue.value) {
      codeValue.value = newValue
    }
  }
)
</script>

<style lang="scss" scoped>
.panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &-top {
    height: 32px;
    background: rgba($primary-color, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;

    &-title {
      color: $primary-color;
    }

    &-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
  }

  &-content {
    flex: 1;
  }
}

.wrapper {
  width: 100%;
  height: 80vh;
  min-height: 600px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog) {
  padding: 0;

  .el-dialog__header {
    padding-top: var(--el-dialog-padding-primary);
    padding-left: var(--el-dialog-padding-primary);
  }

  .actions {
    top: var(--el-dialog-padding-primary);
    right: var(--el-dialog-padding-primary);
    position: absolute;
  }
}
</style>
