<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

async function onLogout() {
  await userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <header class="site-header">
    <span class="logo">硅谷甄选</span>
    <nav>
      <RouterLink to="/">首页</RouterLink>
    </nav>
    <div class="user-box">
      <!-- 用 <template> 把头像+名字+退出捆在一起共用一个 v-if -->
      <template v-if="userStore.userInfo">
        <el-avatar :size="28" :src="userStore.userInfo.avatar" />
        <span>{{ userStore.userInfo.name }}</span>
        <el-button link type="danger" @click="onLogout">退出</el-button>
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