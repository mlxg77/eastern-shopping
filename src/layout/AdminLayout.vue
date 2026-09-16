<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { menuConfig } from './menu'
import type { MenuNode } from './menu'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏折叠状态
const collapsed = ref(false)

// 动态菜单：按当前用户的权限码（info.routes）过滤 menuConfig
// 节点 code 不在 routes 里 → 整枝丢弃；子全过滤则父也丢弃（避免显示空父菜单）
const filteredMenu = computed<MenuNode[]>(() => {
  const routes = userStore.userRoutes
  if (!routes.length) return []
  return menuConfig
    .map((node) => filterNode(node, routes))
    .filter((n): n is MenuNode => n !== null)
})

function filterNode(node: MenuNode, routes: string[]): MenuNode | null {
  // 有 code 且不在权限码里 → 整枝丢弃
  if (node.code && !routes.includes(node.code)) return null
  // 有 children 时递归过滤子菜单
  if (node.children) {
    const children = node.children
      .map((c) => filterNode(c as MenuNode, routes))
      .filter((n): n is MenuNode => n !== null)
    // 父 code 在但子全被过滤 → 父也丢弃（避免显示空父菜单）
    if (children.length === 0 && node.children.length > 0) return null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { ...node, children: children as any }
  }
  return node
}

async function onLogout() {
  await userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <el-container class="admin-layout">
    <!-- 左侧边栏 -->
    <el-aside :width="collapsed ? '64px' : '200px'" class="aside">
      <div class="logo">{{ collapsed ? '甄选' : '硅谷甄选' }}</div>
      <!-- router：菜单项的 index 直接当作路径跳转；default-active 控制当前高亮 -->
      <el-menu
        :default-active="route.path"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
      >
        <template v-for="item in filteredMenu" :key="item.title">
          <!-- 有子菜单：可展开分组 -->
          <el-sub-menu v-if="item.children" :index="item.title">
            <template #title>
              <el-icon v-if="item.icon">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <!-- 无子菜单：单层菜单项 -->
          <el-menu-item v-else :index="item.path">
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="header">
        <el-button link @click="collapsed = !collapsed">
          <el-icon :size="20">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
        </el-button>
        <div class="user-box">
          <template v-if="userStore.userInfo">
            <el-avatar :size="28" :src="userStore.userInfo.avatar" />
            <span>{{ userStore.userInfo.name }}</span>
            <el-button link type="danger" @click="onLogout">退出</el-button>
          </template>
          <RouterLink v-else to="/login">登录</RouterLink>
        </div>
      </el-header>

      <!-- 内容区：子路由页面渲染在这里 -->
      <el-main class="main">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}
.aside {
  background: #001529;
  transition: width 0.3s;
}
.logo {
  height: 56px;
  line-height: 56px;
  text-align: center;
  color: #fff;
  font-weight: bold;
  white-space: nowrap;
}
.aside .el-menu {
  border-right: none;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}
.user-box {
  display: flex;
  align-items: center;
  gap: 8px;
}
.main {
  background: #f0f2f5;
}
</style>
