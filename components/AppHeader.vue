<template>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="header-title">Seeweb</a>
      <div class="header-menu">
        <slot name="menu" />
      </div>
      <div class="header-right">
        <el-link href="/workspace">控制台</el-link>
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
    gap: 24px;
    display: flex;
    align-items: center;
  }

  &-menu {
    flex: 1;
    display: flex;
    align-items: center;
    margin: 0 32px;
  }
}
</style>
