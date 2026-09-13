<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 刷新页面时：本地有 token 就拉一次用户信息（顺带验证 token 头自动携带）
onMounted(() => {
  if (userStore.token) {
    userStore.fetchUserInfo()
  }
})
</script>

<template>
  <!-- 顶部导航栏 -->
  <header class="site-header">
    <span class="logo">硅谷甄选</span>
    <nav>
      <RouterLink to="/">首页</RouterLink>
    </nav>
    <div class="user-box">
      <!-- 用 <template> 是因为已登录状态要显示两个元素（头像 + 名字），负责把这两个元素捆在一起共用一个 v-if-->
      <template v-if="userStore.userInfo">
        <el-avatar :size="28" :src="userStore.userInfo.avatar" />
        <span>{{ userStore.userInfo.name }}</span>
      </template>
      <RouterLink v-else to="/login">登录</RouterLink>
    </div>
  </header>
  <!-- 主体内容 -->
  <main>
    <RouterView />
  </main>
  <!-- 页脚 --> 
  <footer class="site-footer">
    <p>版权所有 &copy; 2026 硅谷甄选</p>
  </footer>
</template>