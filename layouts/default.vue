<template>
  <div class="container">
    <AppHeader>
      <template #menu>
        <slot name="header-menu" />
      </template>
    </AppHeader>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>
