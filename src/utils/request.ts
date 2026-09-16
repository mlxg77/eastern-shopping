import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：有 token 就自动带上（后端约定放在 token 请求头）
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.set('token', token)
  }
  return config
})

// 响应拦截器：HTTP 错误 + 业务错误双层判断
request.interceptors.response.use(
  (response) => {
    const body = response.data
    // 后端约定：HTTP 恒 200，业务成败看 body.code
    // 206 = Token 无效、207 = 未登录（实测确认）：清登录态回登录页
    if (body.code === 206 || body.code === 207) {
      // 仅在本地还存有 token 时处理，避免并发请求同时失败时重复跳转
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token')
        ElMessage.warning('登录已过期，请重新登录')
        // 用整页跳转而非 router.push：Pinia 的 token 已在内存里，
        // 只清 localStorage 同步不到 store，整页刷新让应用重新初始化最干净
        window.location.href = '/login'
      }
      return Promise.reject(new Error(body.message))
    }
    if (body.code !== 200) {
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message))
    }
    return body
  },
  (error) => {
    ElMessage.error('网络异常，请稍后再试')
    return Promise.reject(error)
  },
)

export default request