<template>
  <div class="container">
    <h1>欢迎使用 Seeweb</h1>
    <p>这是一个基于 Nuxt 3 + MySQL 的项目</p>
    <div v-if="data">
      <h2>数据库连接测试</h2>
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
    <div v-else-if="pending">
      <p>加载中...</p>
    </div>
    <div v-else-if="error">
      <p>错误: {{ error.message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/test-db')
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  color: $primary-color;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  text-align: left;
  overflow-x: auto;
}
</style>
