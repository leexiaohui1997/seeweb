<template>
  <DefaultLayout>
    <template #header-menu>
      <AppWorkspaceMenu />
    </template>
    <slot />
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from './default.vue'
</script>
