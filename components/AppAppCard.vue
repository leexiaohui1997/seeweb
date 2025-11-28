<template>
  <el-card class="app-card" shadow="hover">
    <!-- 头部 -->
    <div class="app-card-header">
      <span class="app-name">{{ app.name }}</span>
      <el-icon class="copy-icon" @click="handleCopy">
        <DocumentCopy />
      </el-icon>
    </div>

    <!-- 信息区 -->
    <div class="app-card-info">
      <img :src="appImage" alt="应用图标" class="app-image" />
      <div class="app-info-text">
        <div class="app-title">{{ app.title }}</div>
        <div class="app-created-time">创建时间：{{ formatCreatedTime }}</div>
      </div>
    </div>

    <!-- 控件区 -->
    <div class="app-card-actions">
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
import type { App } from '~/shared/types/app'
import { copyToClipboard } from '~/utils/common'
import appImage from '~/assets/images/app.svg'

const props = defineProps<{
  app: App
}>()

const emit = defineEmits<{
  edit: [app: App]
  delete: [app: App]
}>()

// 格式化创建时间
const formatCreatedTime = computed(() => {
  if (!props.app.createdAt) return ''
  const timestamp =
    typeof props.app.createdAt === 'string' ? parseInt(props.app.createdAt) : props.app.createdAt
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss')
})

// 复制应用名称
const handleCopy = async () => {
  const success = await copyToClipboard(props.app.name)
  if (success) {
    ElMessage.success('已复制到剪贴板')
  } else {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 打开应用
const handleOpen = () => {
  navigateTo(`/workspace/app/${props.app.name}`)
}

// 编辑应用
const handleEdit = () => {
  emit('edit', props.app)
}

// 删除应用
const handleDelete = () => {
  emit('delete', props.app)
}
</script>

<style lang="scss" scoped>
.app-card {
  width: 100%;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 0;
  }

  &-header {
    height: 24px;
    padding: 0 12px;
    background-color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #fff;
    font-size: 12px;
    font-weight: 500;

    .app-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .copy-icon {
      font-size: 14px;
      cursor: pointer;
      flex-shrink: 0;
      margin-left: 8px;
      transition: opacity 0.3s;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &-info {
    padding: 16px;
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .app-image {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      object-fit: contain;
    }

    .app-info-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .app-title {
      font-size: 14px;
      color: var(--el-text-color-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-created-time {
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
