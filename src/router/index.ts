import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      // 后台布局壳：所有业务页面都是它的 children
      path: '/',
      component: () => import('../layout/AdminLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '首页' } },
        { path: 'product/trademark', name: 'trademark', component: () => import('../views/product/TrademarkView.vue'), meta: { title: '品牌管理' } },
        { path: 'product/attr', name: 'attr', component: () => import('../views/product/AttrView.vue'), meta: { title: '平台属性' } },
        { path: 'product/spu', name: 'spu', component: () => import('../views/product/SpuView.vue'), meta: { title: 'SPU 管理' } },
        { path: 'product/sku', name: 'sku', component: () => import('../views/product/SkuView.vue'), meta: { title: 'SKU 管理' } },
        { path: 'acl/user', name: 'acl-user', component: () => import('../views/PlaceholderView.vue'), meta: { title: '用户管理' } },
        { path: 'acl/role', name: 'acl-role', component: () => import('../views/PlaceholderView.vue'), meta: { title: '角色管理' } },
        { path: 'acl/permission', name: 'acl-permission', component: () => import('../views/PlaceholderView.vue'), meta: { title: '菜单管理' } },
      ],
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