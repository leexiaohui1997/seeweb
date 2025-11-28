<template>
  <div v-loading="loading" class="app-editor-page">
    <!-- 头部区域 -->
    <div class="app-editor-header">
      <div class="header-left">
        <el-button size="small" :icon="ArrowLeft" plain @click="handleBack">返回</el-button>
        <span class="app-title">{{ app?.title || '' }}</span>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="app-editor-content">
      <el-empty v-if="!loading && !app" description="应用不存在或无权限访问" />
      <div v-else-if="app" class="content-placeholder">
        <el-splitter>
          <el-splitter-panel>
            <el-splitter layout="vertical">
              <!-- 主区域 -->
              <el-splitter-panel>
                <EditorDevicePreview />
              </el-splitter-panel>
              <!-- 底部 -->
              <el-splitter-panel :min="200" collapsible>
                <AppTabPanel
                  :items="[
                    {
                      name: 'code',
                      icon: 'Document',
                      label: '代码',
                      component: EditorCode,
                      props: {
                        appId: app?.id,
                        templateCode: app?.templateCode,
                        styleCode: app?.styleCode,
                        scriptCode: app?.scriptCode,
                      },
                    },
                  ]"
                />
              </el-splitter-panel>
            </el-splitter>
          </el-splitter-panel>
          <!-- 右侧 -->
          <el-splitter-panel :size="300" :min="300" collapsible></el-splitter-panel>
        </el-splitter>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { EditorCode } from '#components'
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
const appName = computed(() => route.params.name as string)

// 获取应用信息
const fetchApp = async () => {
  if (!appName.value) {
    ElMessage.error('应用标识不能为空')
    return
  }

  try {
    loading.value = true
    const response = await $fetch<{
      success: boolean
      message: string
      data: App
    }>(`/api/user/apps/name/${appName.value}`, {
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

watch(
  appName,
  () => {
    fetchApp()
  },
  {
    immediate: true,
  }
)
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
      --el-border-color-light: #{rgba($primary-color, 0.1)};
      flex: 1;
    }

    .el-splitter {
      overflow: hidden;
    }
  }
}
</style>
