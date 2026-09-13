import axios from 'axios'
import { ElMessage } from 'element-plus'

// 整个项目共享这一个 axios 实例
const request = axios.create({
  baseURL: 'https://v1.hitokoto.cn',
  timeout: 5000,
})

// 请求拦截器：请求发出去之前统一处理（以后自动带 token 就加在这里）
request.interceptors.request.use((config) => {
  return config
})

// 响应拦截器：拿到结果后统一处理
request.interceptors.response.use(
  (response) => {
    // 直接拆包返回数据本体，页面里就不用每次都写 .data
    return response.data
  },
  (error) => {
    // 网络错误、404、500 统一在这里兜住并提示
    ElMessage.error('请求出错了，请稍后再试')
    return Promise.reject(error)
  },
)

export default request
