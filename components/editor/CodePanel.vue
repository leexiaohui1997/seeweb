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
      <div class="panel-top-right">
        <!-- 保存状态显示 -->
        <div v-if="saveStatus === 'saving'" class="save-status">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="saveStatus === 'success' && lastSavedAt" class="save-status success">
          <el-icon><CircleCheck /></el-icon>
          <span class="save-text">已保存</span>
          <span class="save-time">{{ formatTime(lastSavedAt) }}</span>
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
import { Edit, Loading, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { CodeType } from '~/shared/types/code'
import { getErrorMessage } from '~/shared/utils/common'

const props = defineProps<{
  type: 'template' | 'script' | 'style'
  modelValue?: string
  appId?: number
  codeId?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:codeId': [id: number]
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
const currentCodeId = ref<number | undefined>(props.codeId)

// 保存状态
const saveStatus = ref<'idle' | 'saving' | 'success' | 'error'>('idle')
const lastSavedAt = ref<Date | null>(null)

// 防抖定时器
let saveTimer: ReturnType<typeof setTimeout> | null = null

// 是否正在初始化（用于区分回显和用户编辑）
const isInitializing = ref(true)

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

// 格式化时间（HH:mm:ss）
const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

// 保存代码
const saveCode = async () => {
  if (!props.appId) {
    // 如果没有 appId，不保存
    return
  }

  try {
    saveStatus.value = 'saving'

    const requestBody: any = {
      type: props.type,
      content: codeValue.value,
    }

    // 如果有 codeId，传递 id 进行更新
    if (currentCodeId.value) {
      requestBody.id = currentCodeId.value
    } else {
      // 如果没有 codeId，传递 appId 进行查找或创建
      requestBody.appId = props.appId
    }

    const response = await $fetch<{
      success: boolean
      message: string
      data: {
        id: number
        userId: number
        type: CodeType
        content: string
        appId: number | null
        createdAt: number
        updatedAt: number
      }
    }>('/api/user/codes', {
      method: 'PUT',
      body: requestBody,
    })

    if (response.success) {
      // 保存成功，更新 codeId
      if (response.data.id) {
        currentCodeId.value = response.data.id
        emit('update:codeId', response.data.id)
      }

      lastSavedAt.value = new Date()
      saveStatus.value = 'success'
    } else {
      throw new Error(response.message || '保存失败')
    }
  } catch (error) {
    saveStatus.value = 'error'
    ElMessage.error(getErrorMessage(error))
  }
}

// 防抖保存
const debouncedSave = () => {
  // 清除之前的定时器
  if (saveTimer) {
    clearTimeout(saveTimer)
  }

  // 设置新的定时器，3秒后保存
  saveTimer = setTimeout(() => {
    saveCode()
    saveTimer = null
  }, 1000)
}

// 处理代码变化
const handleCodeChange = (value: string) => {
  codeValue.value = value
  emit('update:modelValue', value)

  // 如果不是初始化阶段，触发自动保存
  if (!isInitializing.value) {
    saveStatus.value = 'idle'
    debouncedSave()
  }
}

// 监听外部值变化（用于回显）
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== undefined && newValue !== codeValue.value) {
      isInitializing.value = true
      codeValue.value = newValue
      // 回显完成后，标记初始化完成
      nextTick(() => {
        isInitializing.value = false
      })
    } else {
      isInitializing.value = false
    }
  },
  { immediate: true }
)

// 监听 codeId 变化
watch(
  () => props.codeId,
  newValue => {
    if (newValue !== undefined) {
      currentCodeId.value = newValue
    }
  },
  { immediate: true }
)

// 组件卸载时清理定时器
onUnmounted(() => {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
})
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

    &-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-regular);

    &.success {
      color: var(--el-color-success);
    }

    .save-text {
      margin: 0 4px;
    }

    .save-time {
      color: var(--el-text-color-secondary);
    }
  }

  &-content {
    flex: 1;
    height: 0;
    position: relative;
    overflow: hidden;
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
