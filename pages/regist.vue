<template>
  <h1 class="title">注册账号</h1>
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
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="formValues.confirmPassword" type="password" />
    </el-form-item>
  </el-form>

  <div class="actions">
    <el-button type="primary" :disabled="disabled" :loading="loading" @click="handleSubmit"
      >提交</el-button
    >
  </div>

  <div class="footer">
    <el-text>
      <span>已有账号？</span>
      <el-link type="primary" href="/login">去登录</el-link>
    </el-text>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { getErrorMessage } from '~/shared/utils/common'
import { validatePasswordStrength } from '~/shared/utils/password'

definePageMeta({
  layout: 'login',
})

const router = useRouter()

const formValues = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    {
      pattern: /^[a-zA-Z0-9_]{3,50}$/,
      message: '用户名只能包含字母、数字、下划线，长度 3-50 位',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (!value) {
          callback()
          return
        }

        const passwordValidation = validatePasswordStrength(value)
        if (!passwordValidation.valid) {
          callback(new Error(passwordValidation.message))
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'change' },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== formValues.password) {
          callback(new Error('两次输入的密码不一致'))
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

const formRef = ref<FormInstance>()
const disabled = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  try {
    loading.value = true
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: formValues,
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    ElMessage.success(response.message)
    disabled.value = true
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.replace({ path: '/login' })
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}
</script>
