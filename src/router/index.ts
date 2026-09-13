import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
  ],
})

// 全局前置守卫：任何路由跳转前都经过这里
// 注意：useUserStore 必须写在回调内部——import 这个文件时 Pinia 还没激活，
// 顶层调用会报 "getActivePinia" 错误
router.beforeEach(async (to) => {
  const userStore = useUserStore()

  // 1. 未登录：只放行登录页，其余一律弹回登录页
  if (!userStore.token) {
    return to.path === '/login' ? true : '/login'
  }

  // 2. 已登录还去登录页 → 回首页
  if (to.path === '/login') {
    return '/'
  }

  // 3. 已登录但用户信息没拉过（如 F5 刷新）→ 补拉一次
  if (!userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      // 拉取失败多半是 token 失效：清空登录态，回登录页重来
      await userStore.logout()
      return '/login'
    }
  }
})

export default router