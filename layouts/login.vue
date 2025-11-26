<template>
  <div class="container">
    <NuxtLink class="logo" to="/">Seeweb</NuxtLink>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  top: 0;
  left: 0;
  position: absolute;
  font-size: 20px;
  font-weight: 600;
  color: $primary-color;
  line-height: 64px;
  padding-left: 24px;
}

.container {
  padding: 24px;
  min-height: 100dvh;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: rgba($primary-color, 0.05);

  .content {
    width: 100%;
    padding: 24px;
    max-width: 500px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;

    :deep(.title) {
      font-size: $font-size-large;
      margin-bottom: 24px;
    }

    :deep(.actions) {
      margin: 0 auto;

      .el-button {
        min-width: 120px;
      }
    }

    :deep(.footer) {
      margin-top: 24px;
      text-align: center;
    }
  }
}
</style>
