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