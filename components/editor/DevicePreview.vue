<template>
  <div class="device-preview">
    <!-- 工具栏 -->
    <div class="device-preview-toolbar">
      <div class="toolbar-left">
        <!-- 设备选择器 -->
        <el-select v-model="currentDevice" size="small" style="width: 120px">
          <el-option
            v-for="device in devicePresets"
            :key="device.key"
            :label="device.label"
            :value="device.key"
          />
        </el-select>

        <!-- 自定义尺寸输入（仅在自定义模式下显示） -->
        <template v-if="currentDevice === 'custom'">
          <el-input-number
            v-model="customWidth"
            :min="200"
            :max="3840"
            size="small"
            style="width: 100px"
            controls-position="right"
          />
          <span class="size-separator">×</span>
          <el-input-number
            v-model="customHeight"
            :min="200"
            :max="2160"
            size="small"
            style="width: 100px"
            controls-position="right"
          />
        </template>

        <!-- 当前尺寸显示 -->
        <span class="size-display"> {{ previewWidth }} × {{ previewHeight }} </span>
      </div>

      <div class="toolbar-right">
        <!-- 缩放控制 -->
        <el-button-group>
          <el-button size="small" :icon="ZoomOut" @click="handleZoomOut" />
          <el-button size="small" plain disabled>
            {{ zoomLevel ? Math.round(zoomLevel * 100) : 0 }}%
          </el-button>
          <el-button size="small" :icon="ZoomIn" @click="handleZoomIn" />
        </el-button-group>

        <!-- 适应画布按钮 -->
        <el-button size="small" :icon="FullScreen" @click="handleFitToCanvas">适应画布</el-button>

        <!-- 刷新按钮 -->
        <el-button size="small" :icon="Refresh" @click="handleRefresh">刷新</el-button>
      </div>
    </div>

    <!-- 预览区域 -->
    <div class="device-preview-content">
      <div ref="previewContainerRef" class="preview-container" :style="containerStyle">
        <!-- 缩放包装器，尺寸等于缩放后的尺寸 -->
        <div class="preview-wrapper" :style="wrapperStyle">
          <!-- 预览占位区（黑色div） -->
          <div class="preview-placeholder" :style="previewStyleWithVisibility"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { ZoomIn, ZoomOut, Refresh, FullScreen } from '@element-plus/icons-vue'

// 设备预设配置
const devicePresets = [
  { key: 'mobile', label: '手机', width: 375, height: 667 },
  { key: 'tablet', label: '平板', width: 768, height: 1024 },
  { key: 'desktop', label: '桌面', width: 1920, height: 1080 },
  { key: 'custom', label: '自定义', width: 800, height: 600 },
] as const

// 当前设备
const currentDevice = ref<(typeof devicePresets)[number]['key']>('desktop')

// 自定义尺寸
const customWidth = ref(800)
const customHeight = ref(600)

// 缩放级别（初始为 null，挂载后计算）
const zoomLevel = ref<number | null>(null)

// 是否可见（初始化时隐藏，计算完成后显示）
const isVisible = ref(false)

// 预览容器引用
const previewContainerRef = ref<HTMLDivElement>()

// 计算预览尺寸
const previewWidth = computed(() => {
  if (currentDevice.value === 'custom') {
    return customWidth.value
  }
  const preset = devicePresets.find(d => d.key === currentDevice.value)
  return preset?.width || 1920
})

const previewHeight = computed(() => {
  if (currentDevice.value === 'custom') {
    return customHeight.value
  }
  const preset = devicePresets.find(d => d.key === currentDevice.value)
  return preset?.height || 1080
})

// 预览区域样式（原始尺寸）
const previewStyle = computed(() => {
  const scale = zoomLevel.value ?? 1
  return {
    width: `${previewWidth.value}px`,
    height: `${previewHeight.value}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    transition: isVisible.value ? '' : 'none',
  }
})

// 预览样式（包含可见性控制）
const previewStyleWithVisibility = computed(() => {
  return {
    ...previewStyle.value,
  }
})

// 包装器样式（尺寸等于缩放后的尺寸，避免滚动条）
const wrapperStyle = computed(() => {
  const scale = zoomLevel.value ?? 1
  return {
    width: `${previewWidth.value * scale}px`,
    height: `${previewHeight.value * scale}px`,
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    transition: isVisible.value ? '' : 'none',
  }
})

// 容器样式（用于居中显示）
const containerStyle = computed(() => {
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // 改为 hidden，因为 wrapper 已经控制了尺寸
    visibility: isVisible.value ? 'visible' : 'hidden',
  }
})

// 缩放控制
const handleZoomIn = () => {
  if (zoomLevel.value === null) return
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(zoomLevel.value + 0.1, 2)
  }
}

const handleZoomOut = () => {
  if (zoomLevel.value === null) return
  if (zoomLevel.value > 0.1) {
    zoomLevel.value = Math.max(zoomLevel.value - 0.1, 0.1)
  }
}

// 适应画布（同步计算，不使用 nextTick）
const handleFitToCanvas = () => {
  if (!previewContainerRef.value) return

  // 使用 clientWidth/clientHeight 获取可视区域（自动排除滚动条和边框）
  const containerWidth = previewContainerRef.value.clientWidth
  const containerHeight = previewContainerRef.value.clientHeight

  // 如果容器尺寸无效，不进行计算
  if (containerWidth <= 0 || containerHeight <= 0) {
    return
  }

  // 获取实际 padding（从 computed style）
  const computedStyle = window.getComputedStyle(previewContainerRef.value)
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 20
  const paddingRight = parseFloat(computedStyle.paddingRight) || 20
  const paddingTop = parseFloat(computedStyle.paddingTop) || 20
  const paddingBottom = parseFloat(computedStyle.paddingBottom) || 20

  // 计算可用空间（减去 padding）
  const availableWidth = containerWidth - paddingLeft - paddingRight
  const availableHeight = containerHeight - paddingTop - paddingBottom

  // 添加安全边距（避免内容贴边）
  const safeMargin = 10
  const safeWidth = availableWidth - safeMargin * 2
  const safeHeight = availableHeight - safeMargin * 2

  // 如果可用空间无效，不进行计算
  if (safeWidth <= 0 || safeHeight <= 0) {
    return
  }

  // 计算合适的缩放比例（取宽度和高度的较小值，确保内容完全显示）
  const scaleX = safeWidth / previewWidth.value
  const scaleY = safeHeight / previewHeight.value
  const fitScale = Math.min(scaleX, scaleY, 2) // 最大不超过200%

  // 限制最小缩放为10%，但如果计算出的值有效，使用计算值
  if (fitScale > 0 && isFinite(fitScale)) {
    zoomLevel.value = Math.max(fitScale, 0.1)
  } else {
    zoomLevel.value = 0.1
  }

  requestAnimationFrame(() => {
    // 计算完成后显示内容
    isVisible.value = true
  })
}

// 刷新预览
const handleRefresh = () => {
  // 刷新功能占位
}

watch(currentDevice, () => {
  isVisible.value = false
  nextTick(() => {
    requestAnimationFrame(() => {
      handleFitToCanvas()
    })
  })
})

// 组件挂载时自动适应画布
onMounted(() => {
  // 使用双重 requestAnimationFrame 确保浏览器完成布局计算后再计算，避免初始缩放跳跃
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 再次检查容器尺寸，如果还是无效，延迟重试
        if (previewContainerRef.value) {
          const containerWidth = previewContainerRef.value.clientWidth
          const containerHeight = previewContainerRef.value.clientHeight

          if (containerWidth > 0 && containerHeight > 0) {
            handleFitToCanvas()
          } else {
            // 如果容器尺寸还是无效，延迟重试
            setTimeout(() => {
              handleFitToCanvas()
            }, 100)
          }
        }
      })
    })
  })
})
</script>

<style lang="scss" scoped>
.device-preview {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);

  &-toolbar {
    height: 40px;
    padding: 0 12px;
    background-color: rgba($primary-color, 0.05);
    border-bottom: 1px solid rgba($primary-color, 0.1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .size-separator {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }

      .size-display {
        margin-left: 8px;
        padding: 0 8px;
        font-size: 12px;
        color: var(--el-text-color-regular);
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &-content {
    flex: 1;
    height: 0;
    overflow: hidden;
    background-color: #f5f5f5;
    position: relative;

    .preview-container {
      width: 100%;
      height: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    .preview-wrapper {
      flex-shrink: 0;
      transition:
        width 0.2s ease,
        height 0.2s ease;
      background-color: #fff;
    }

    .preview-placeholder {
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
    }
  }
}
</style>
