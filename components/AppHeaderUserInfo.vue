<template>
  <div class="user-info">
    <el-avatar :size="24" class="avatar">
      <img :src="avatarSvg" alt="头像" />
    </el-avatar>
    <span class="username">{{ username }}</span>
    <el-icon class="logout-icon" @click="handleLogout">
      <SwitchButton />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { SwitchButton } from '@element-plus/icons-vue'
import avatarSvg from '~/assets/images/avatar.svg'
import { getErrorMessage } from '~/shared/utils/common'

const { username, user } = await useUser()
const router = useRouter()

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用退出登录 API
    await $fetch('/api/auth/logout', {
      method: 'POST',
    })

    // 清除用户状态
    user.value = null

    ElMessage.success('退出登录成功')

    // 跳转到登录页
    router.push('/login')
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel') {
      return
    }
    ElMessage.error(getErrorMessage(error))
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  gap: 8px;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  .avatar {
    flex-shrink: 0;
  }

  .username {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  .logout-icon {
    font-size: 16px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: var(--el-color-danger);
    }
  }
}
</style>
