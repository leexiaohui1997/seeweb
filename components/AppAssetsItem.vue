<template>
  <el-card class="assets-item" shadow="hover">
    <!-- 左上角 checkbox -->
    <div class="assets-item-checkbox">
      <el-checkbox v-model="isSelected" @change="handleCheckboxChange" />
    </div>

    <!-- 预览区 -->
    <div class="assets-item-preview">
      <AppAssetsPreview :file="file" />
    </div>

    <!-- 信息区 -->
    <div class="assets-item-info">
      <!-- 第一行：文件名 -->
      <div class="info-name" :title="file.name || '未命名文件'">
        {{ file.name || '未命名文件' }}
      </div>
      <!-- 第二行：标签 -->
      <div class="info-tags">
        <el-tag size="small">{{ formatFileSize }}</el-tag>
        <el-tag size="small">{{ file.type }}</el-tag>
        <el-tag :type="file.private ? 'primary' : 'success'" size="small">
          {{ file.private ? '私有' : '公开' }}
        </el-tag>
      </div>
      <!-- 第三行：上传时间 -->
      <div class="info-time">上传时间：{{ formatCreatedTime }}</div>
    </div>

    <!-- 控件区 -->
    <div class="assets-item-actions">
      <el-button type="primary" :icon="DocumentCopy" text class="action-button" @click="handleCopy">
        复制
      </el-button>
      <el-divider direction="vertical" />
      <el-button type="primary" :icon="View" text class="action-button" @click="handleOpen">
        打开
      </el-button>
      <el-divider direction="vertical" />
      <el-button type="primary" :icon="Edit" text class="action-button" @click="handleEdit">
        编辑
      </el-button>
      <el-divider direction="vertical" />
      <el-button type="danger" :icon="Delete" text class="action-button" @click="handleDelete">
        删除
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { DocumentCopy, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import type { File } from '~/shared/types/file'
import { copyToClipboard } from '~/utils/common'

const props = defineProps<{
  file: File
  selected?: boolean
}>()

const emit = defineEmits<{
  edit: [file: File]
  delete: [file: File]
  'update:selected': [value: boolean]
}>()

// 选中状态
const isSelected = computed({
  get: () => props.selected || false,
  set: (value: boolean) => {
    emit('update:selected', value)
  },
})

// 格式化文件大小
const formatFileSize = computed(() => {
  const size = props.file.size
  if (size < 1024) {
    return `${size} B`
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }
})

// 格式化创建时间
const formatCreatedTime = computed(() => {
  if (!props.file.createdAt) return ''
  const timestamp =
    typeof props.file.createdAt === 'string' ? parseInt(props.file.createdAt) : props.file.createdAt
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
})

// 文件访问链接
const fileUrl = computed(() => {
  if (process.client) {
    return `${window.location.origin}/api/file/${props.file.key}`
  }
  return `/api/file/${props.file.key}`
})

// 复制链接
const handleCheckboxChange = () => {
  emit('update:selected', isSelected.value)
}

// 复制链接
const handleCopy = async () => {
  const success = await copyToClipboard(fileUrl.value)
  if (success) {
    ElMessage.success('已复制链接到剪贴板')
  } else {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 打开链接
const handleOpen = () => {
  window.open(fileUrl.value, '_blank')
}

// 编辑文件
const handleEdit = () => {
  emit('edit', props.file)
}

// 删除文件
const handleDelete = () => {
  emit('delete', props.file)
}
</script>

<style lang="scss" scoped>
.assets-item {
  width: 100%;
  overflow: hidden;
  position: relative;

  :deep(.el-card__body) {
    padding: 0;
  }

  &-checkbox {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    padding: 4px;
  }

  &-preview {
    width: 100%;
  }

  &-info {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .info-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .info-tags {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .info-time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  &-actions {
    border-top: 1px solid var(--el-border-color);
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;

    .action-button {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .el-divider--vertical {
      margin: 0 4px;
      height: 16px;
    }
  }
}
</style>
