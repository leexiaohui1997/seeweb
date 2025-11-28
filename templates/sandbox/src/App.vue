<template>
  <div class="app">
    <header class="app-header">
      <h1>Vue 3 Sandbox</h1>
      <p>这是一个独立的 Vue 3 开发环境</p>
    </header>
    <main class="app-main">
      <div class="welcome">
        <h2>欢迎使用 Sandbox</h2>
        <p>开始你的 Vue 3 开发之旅吧！</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// 在这里编写你的组件逻辑
</script>

<style lang="scss" scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;

    h1 {
      margin: 0 0 0.5rem;
      font-size: 2.5rem;
    }

    p {
      margin: 0;
      opacity: 0.9;
    }
  }

  &-main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
}

.welcome {
  text-align: center;
  padding: 3rem 1rem;

  h2 {
    color: #333;
    margin-bottom: 1rem;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
}
</style>
