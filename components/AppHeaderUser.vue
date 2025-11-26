<template>
  <AppHeaderUserInfo v-if="isLogin" />
  <div v-else>
    <el-button type="primary" @click="handleLogin">登录</el-button>
    <el-button @click="handleRegister">注册</el-button>
  </div>
</template>

<script setup lang="ts">
const { isLogin } = await useUser()
const router = useRouter()

const handleLogin = () => {
  router.push('/login')
}

const handleRegister = () => {
  router.push('/regist')
}
</script>
