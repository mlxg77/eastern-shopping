import request from '@/utils/request'
import type { ResponseBody } from './user'

// 分类（三级共用同一个结构）
export interface Category {
  id: number
  name: string
}

// 属性值
export interface AttrValue {
  id?: number
  valueName: string
  attrId?: number
}

// 属性
export interface Attr {
  id?: number
  attrName: string
  categoryId: number
  categoryLevel: number
  attrValueList: AttrValue[]
}

export function reqCategory1() {
  return request.get<unknown, ResponseBody<Category[]>>('/admin/product/getCategory1')
}
export function reqCategory2(c1: number) {
  return request.get<unknown, ResponseBody<Category[]>>(`/admin/product/getCategory2/${c1}`)
}
export function reqCategory3(c2: number) {
  return request.get<unknown, ResponseBody<Category[]>>(`/admin/product/getCategory3/${c2}`)
}

export function reqAttrList(c1: number, c2: number, c3: number) {
  return request.get<unknown, ResponseBody<Attr[]>>(`/admin/product/attrInfoList/${c1}/${c2}/${c3}`)
}

// 保存（新增 / 修改共用，看有没有 id）
export function reqSaveAttr(data: Attr) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/saveAttrInfo', data)
}

export function reqDeleteAttr(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/product/deleteAttr/${id}`)
}