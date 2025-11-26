<template>
  <div class="container">
    <AppHeader />
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
}
</style>
