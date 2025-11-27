<template>
  <div class="menu">
    <div
      v-for="(item, index) in appConfig.workspaceMenu"
      :key="`${item.path}-${index}`"
      class="menu-item"
      :class="{ 'menu-item-active': route.path === item.path }"
      @click="handleClick(item)"
    >
      <el-icon :size="12">
        <component :is="item.icon" />
      </el-icon>
      <span class="menu-item-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const route = useRoute()
const handleClick = (item: (typeof appConfig)['workspaceMenu'][0]) => {
  if (item.path && item.path !== route.path) {
    navigateTo(item.path)
  }
}
</script>

<style lang="scss" scoped>
.menu {
  gap: 16px;
  display: flex;
  align-items: center;

  &-item {
    height: 40px;
    padding: 0 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: 14px;
    position: relative;

    &:hover {
      background-color: rgba($primary-color, 0.05);
    }

    &::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: $primary-color;
      transform-origin: center;
      transform: scaleX(0);
      transition: transform 0.3s;
    }

    &-label {
      font-weight: 500;
    }

    &.menu-item-active {
      &::before {
        transform: scaleX(1);
      }
    }
  }
}
</style>
