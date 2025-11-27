<template>
  <div class="assets-preview">
    <!-- 图片类型 -->
    <img v-if="isImage" :src="imageUrl" alt="文件预览" class="preview-image" />
    <!-- 其他类型 -->
    <div v-else class="preview-placeholder">
      <el-icon :size="48" class="file-icon">
        <Document />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import type { File } from '~/shared/types/file'

const props = defineProps<{
  file: File
}>()

// 判断是否为图片
const isImage = computed(() => {
  return props.file.type.startsWith('image/')
})

// 图片 URL
const imageUrl = computed(() => {
  return `/api/file/${props.file.key}`
})
</script>

<style lang="scss" scoped>
.assets-preview {
  width: 100%;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background-color: rgba($primary-color, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .file-icon {
      color: $primary-color;
    }
  }
}
</style>
