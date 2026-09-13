import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reqLogin, reqUserInfo } from '@/api/user'
import type { LoginForm, UserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // token 初始化时从 localStorage 读，刷新页面不丢
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

  return { token, userInfo, login, fetchUserInfo }
})