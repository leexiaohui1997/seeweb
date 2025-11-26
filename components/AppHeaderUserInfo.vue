<template>
  <div class="user-info">
    <el-avatar :size="24" class="avatar">
      <img :src="avatarSvg" alt="头像" />
    </el-avatar>
    <span class="username">{{ username }}</span>
  </div>
</template>

<script setup lang="ts">
import avatarSvg from '~/assets/images/avatar.svg'

const { username } = await useUser()
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
}
</style>
