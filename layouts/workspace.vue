<template>
  <DefaultLayout>
    <template #header-menu>
      <AppWorkspaceMenu />
    </template>
    <div class="content">
      <slot />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from './default.vue'
</script>

<style lang="scss" scoped>
.container {
  height: 100dvh;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
}
</style>
