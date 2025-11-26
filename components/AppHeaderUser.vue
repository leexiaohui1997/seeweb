<template>
  <div v-if="isLogin"></div>
  <div v-else>
    <el-button type="primary" @click="handleLogin">登录</el-button>
    <el-button @click="handleRegister">注册</el-button>
  </div>
</template>

<script setup lang="ts">
import { useUser } from '~/shared/hooks/user'

const { isLogin } = useUser()
const router = useRouter()

const handleLogin = () => {
  router.push('/login')
}

const handleRegister = () => {
  router.push('/regist')
}
</script>
