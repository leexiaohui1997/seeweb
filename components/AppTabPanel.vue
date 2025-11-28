<template>
  <div class="tab-panel" :class="[layout]">
    <div class="tab-panel-header">
      <el-tooltip
        v-for="(item, index) in items"
        :key="item.name"
        :placement="navTooltipPlacement"
        :show-after="1000"
      >
        <div
          class="tab-panel-nav-item"
          :class="{ active: currentIndex === index }"
          @click="handleNavItemClick(index)"
        >
          <el-icon :size="14">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <template #content>
          <span>{{ item.label }}</span>
        </template>
      </el-tooltip>
    </div>

    <div class="tab-panel-content">
      <div class="inner">
        <component
          :is="items[currentIndex].component"
          v-bind="items[currentIndex].props"
          v-on="items[currentIndex].emits || {}"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { ElTooltipProps } from 'element-plus'
export type PanelItemConfig = {
  name: string
  icon: string
  label: string
  component: string | Component
  props?: Record<string, any>
  emits?: Record<string, (...args: any[]) => any>
}
</script>

<script setup lang="ts">
withDefaults(
  defineProps<{
    items: PanelItemConfig[]
    layout?: 'horizontal' | 'vertical'
    navTooltipPlacement?: ElTooltipProps['placement']
  }>(),
  {
    items: () => [],
    layout: 'vertical',
    navTooltipPlacement: 'top',
  }
)

const currentIndex = ref(0)

const handleNavItemClick = (index: number) => {
  currentIndex.value = index
}
</script>

<style lang="scss" scoped>
.tab-panel {
  width: 100%;
  height: 100%;
  display: flex;

  &.vertical,
  &.horizontal &-header {
    flex-direction: column;
  }

  &.horizontal,
  &.vertical &-header {
    flex-direction: row;
  }

  &-header {
    gap: 8px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 16px;
  }

  &-nav-item {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: rgba($primary-color, 0.1);
    }

    &.active {
      background-color: rgba($primary-color, 0.1);
    }
  }

  &-content {
    flex: 1 1 auto;
    overflow: auto;
    scrollbar-width: thin;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;

    .inner {
      flex: 1;
      height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  }
}
</style>
