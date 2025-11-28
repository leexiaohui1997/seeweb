<template>
  <div class="app-editor-page">
    <!-- 头部区域 -->
    <div class="app-editor-header">
      <div class="header-left">
        <el-button size="small" :icon="ArrowLeft" plain @click="handleBack">返回</el-button>
        <span class="app-title">{{ app?.title || '' }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div v-loading="loading" class="app-editor-content">
      <el-empty v-if="!loading && !app" description="应用不存在或无权限访问" />
      <div v-else-if="app" class="content-placeholder">
        <!-- 预留空间，暂不实现具体内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { App } from '~/shared/types/app'
import { getErrorMessage } from '~/shared/utils/common'

definePageMeta({
  layout: 'workspace',
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const app = useState<App | null>('app', () => null)

// 获取应用信息
const fetchApp = async () => {
  const appName = route.params.name as string
  if (!appName) {
    ElMessage.error('应用标识不能为空')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{
      success: boolean
      message: string
      data: App
    }>(`/api/user/apps/name/${appName}`, {
      method: 'GET',
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    app.value = response.data
  } catch (error) {
    if (process.client) {
      ElMessage.error(getErrorMessage(error))
    }
    app.value = null
  } finally {
    loading.value = false
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 初始化加载
await callOnce(fetchApp)
</script>

<style lang="scss" scoped>
.app-editor-page {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .app-editor-header {
    height: 40px;
    padding: 0 16px;
    background-color: rgba($primary-color, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .app-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }
  }

  .app-editor-content {
    flex: 1;
    height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;

    .content-placeholder {
      flex: 1;
      // 预留空间，暂不实现具体内容
    }
  }
}
</style>
