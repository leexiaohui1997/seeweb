<template>
  <h1 class="title">登录账号</h1>
  <el-form
    ref="formRef"
    v-loading="loading"
    class="form"
    :model="formValues"
    :rules="formRules"
    label-width="80px"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formValues.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="formValues.password" type="password" />
    </el-form-item>
    <el-form-item label="验证码" prop="captcha">
      <div class="captcha-wrapper">
        <el-input v-model="formValues.captcha" class="captcha-input" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="captcha-image" @click="refreshCaptcha" v-html="captchaSvg"></div>
      </div>
    </el-form-item>
  </el-form>

  <div class="actions">
    <el-button type="primary" :disabled="disabled" :loading="loading" @click="handleSubmit"
      >登录</el-button
    >
  </div>

  <div class="footer">
    <el-text>
      <span>还没有账号？</span>
      <el-link type="primary" href="/regist">去注册</el-link>
    </el-text>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { getErrorMessage } from '~/shared/utils/common'

definePageMeta({
  layout: 'login',
})

const { fetchUser } = await useUser()

const route = useRoute()
const router = useRouter()

const formValues = reactive({
  username: '',
  password: '',
  captcha: '',
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'change' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const formRef = ref<FormInstance>()
const disabled = ref(false)
const loading = ref(false)
const captchaSvg = ref('')

// 获取验证码
const fetchCaptcha = async () => {
  try {
    const response = await $fetch('/api/auth/captcha', {
      method: 'GET',
    })
    if (response.success && response.data?.svg) {
      captchaSvg.value = response.data.svg
    }
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  fetchCaptcha()
  formValues.captcha = ''
}

// 初始化时获取验证码
onMounted(() => {
  fetchCaptcha()
})

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  try {
    loading.value = true
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: formValues.username,
        password: formValues.password,
        captcha: formValues.captcha,
      },
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    ElMessage.success(response.message)
    disabled.value = true
    await fetchUser()
    router.replace({ path: (route.query.redirect as string) || '/' })
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
    // 登录失败后刷新验证码
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.captcha-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;

  .captcha-input {
    flex: 1;
  }

  .captcha-image {
    width: 120px;
    height: 32px;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    transition: border-color 0.3s;

    &:hover {
      border-color: $primary-color;
    }

    :deep(svg) {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
