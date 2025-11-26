<template>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="header-title">Seeweb</a>
      <div class="header-right">
        <AppHeaderUser />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.header {
  &-inner {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-title {
    font-size: 20px;
    font-weight: 600;
    color: $primary-color;
  }

  &-right {
    gap: 16px;
    display: flex;
    align-items: center;
  }
}
</style>
