import request from '@/utils/request'
import type { ResponseBody } from './user'

// ---- 用户管理 ----
export interface UserItem {
  id: number
  username: string
  name: string
  phone: string
  // 后端拼好的角色名串（展示用），分配角色后刷新列表可见
  roleName: string
  createTime: string
}

// 新增用户请求体（三个字段后端全标必填）
export interface SaveUserPayload {
  username: string
  name: string
  password: string
}

// 修改用户请求体 —— 后端契约没有 password，编辑不改密码
export interface UpdateUserPayload {
  id: number
  username: string
  name: string
}

export function reqUserList(page: number, limit: number, username?: string) {
  return request.get<unknown, ResponseBody<PageData<UserItem>>>(
    `/admin/acl/user/${page}/${limit}`,
    { params: username ? { username } : {} },
  )
}

// 分页泛型：本项目多个列表接口共用同一种分页结构
export interface PageData<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function reqSaveUser(data: SaveUserPayload) {
  return request.post<unknown, ResponseBody<null>>('/admin/acl/user/save', data)
}

export function reqUpdateUser(data: UpdateUserPayload) {
  return request.put<unknown, ResponseBody<null>>('/admin/acl/user/update', data)
}

export function reqDeleteUser(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/acl/user/remove/${id}`)
}

// ---- 分配角色 ----
export interface RoleItem {
  id: number
  roleName: string
  remark: string
}

// toAssign 接口返回：已分配角色 + 全量角色，两边都是同一个 RoleItem 结构
export interface ToAssignData {
  assignRoles: RoleItem[]
  allRolesList: RoleItem[]
}

export function reqToAssign(adminId: number) {
  return request.get<unknown, ResponseBody<ToAssignData>>(`/admin/acl/user/toAssign/${adminId}`)
}

// 覆盖式提交：roleIdList 传当前全部选中项（空数组 = 清空该用户角色）
export function reqDoAssignRole(userId: number, roleIdList: number[]) {
  return request.post<unknown, ResponseBody<null>>('/admin/acl/user/doAssignRole', {
    userId,
    roleIdList,
  })
}