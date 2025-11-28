<template>
  <div class="panel">
    <div class="panel-top">
      <span class="panel-top-title">{{ type }}</span>
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
    <div class="panel-content">
      <ClientOnly>
        <Teleport :to="wrapperRef" :disabled="!dialogVisible || !wrapperRef">
          <div></div>
        </Teleport>
      </ClientOnly>
    </div>
  </div>

  <div>
    <el-dialog v-model="dialogVisible" width="800px" :modal="false" draggable modal-penetrable>
      <div class="panel wrapper">
        <div class="panel-top">
          <span class="panel-top-title">{{ type }}</span>
        </div>
        <div ref="wrapperRef" class="panel-content"></div>
      </div>

      <template #header>
        <span>编辑代码</span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue'

defineProps<{
  type: 'template' | 'script' | 'style'
}>()

const dialogVisible = ref(false)
const wrapperRef = ref<HTMLDivElement>()
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
  }

  &-content {
    flex: 1;
  }
}

.wrapper {
  width: 100%;
  height: 600px;
  display: flex;
  flex-direction: column;
  .panel-top {
    justify-content: center;
  }
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
