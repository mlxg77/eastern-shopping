import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reqLogin, reqLogout, reqUserInfo } from '@/api/user'
import type { LoginForm, UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // ---- state（必须在 actions 之前声明，Pinia 4 类型推断对顺序敏感） ----
  const token = ref(localStorage.getItem('token') ?? '')
  const userInfo = ref<UserInfo | null>(null)
  const userRoutes = ref<string[]>([])
  const userButtons = ref<string[]>([])

  // ---- actions ----
  async function login(form: LoginForm) {
    const res = await reqLogin(form)
    token.value = res.data
    localStorage.setItem('token', res.data)
  }

  async function fetchUserInfo() {
    const res = await reqUserInfo()
    userInfo.value = res.data
    userRoutes.value = res.data.routes ?? []
    userButtons.value = res.data.buttons ?? []
  }

  function hasButton(code: string): boolean {
    return userButtons.value.includes(code)
  }

  async function logout() {
    try {
      await reqLogout()
    } catch {
      // 静默
    }
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token, userInfo, userRoutes, userButtons,
    login, fetchUserInfo, logout, hasButton,
  }
})