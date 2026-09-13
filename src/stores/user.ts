import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reqLogin, reqLogout, reqUserInfo } from '@/api/user'
import type { LoginForm, UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') ?? '')
  const userInfo = ref<UserInfo | null>(null)

  async function login(form: LoginForm) {
    const res = await reqLogin(form)
    token.value = res.data
    localStorage.setItem('token', res.data)
  }

  async function fetchUserInfo() {
    const res = await reqUserInfo()
    userInfo.value = res.data
  }

  async function logout() {
    try {
      await reqLogout() // 告知后端（失败了也不阻塞本地清理）
    } catch {
      // 静默
    }
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return { token, userInfo, login, fetchUserInfo, logout }
})