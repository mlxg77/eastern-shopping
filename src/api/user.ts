import request from '@/utils/request'

export interface LoginForm {
  username: string
  password: string
}

// 后端统一响应体（拦截器拆包后页面拿到的就是它）
export interface ResponseBody<T> {
  code: number
  message: string
  data: T
  ok: boolean
}

export interface UserInfo {
  name: string
  avatar: string
  routes: string[]
  buttons: string[]
  roles: string[]
}

// 第一个泛型写 unknown（axios 原始的响应类型，我们不用），
// 第二个泛型才是拦截器处理后真正返回的类型
export function reqLogin(data: LoginForm) {
  return request.post<unknown, ResponseBody<string>>('/admin/acl/index/login', data)
}

export function reqLogout() {
  return request.post<unknown, ResponseBody<null>>('/admin/acl/index/logout')
}

export function reqUserInfo() {
  return request.get<unknown, ResponseBody<UserInfo>>('/admin/acl/index/info')
}