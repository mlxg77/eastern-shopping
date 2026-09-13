import request from '@/utils/request'
import type { ResponseBody } from './user'

// 单条品牌记录
export interface Trademark {
  id?: number
  tmName: string
  logoUrl?: string
  createTime?: string
  updateTime?: string
}

// 分页列表返回体
export interface TrademarkListData {
  records: Trademark[]
  total: number
  size: number
  current: number
  pages: number
  searchCount: boolean
}

// 分页列表
export function reqTrademarkPage(page: number, limit: number) {
  return request.get<unknown, ResponseBody<TrademarkListData>>(
    `/admin/product/baseTrademark/${page}/${limit}`,
  )
}

// 新增 / 修改共用（看有没有 id 分流）
export function reqAddOrUpdateTrademark(data: Trademark) {
  if (data.id) {
    return request.put<unknown, ResponseBody<null>>('/admin/product/baseTrademark/update', data)
  }
  return request.post<unknown, ResponseBody<null>>('/admin/product/baseTrademark/save', data)
}

// 删除
export function reqRemoveTrademark(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/product/baseTrademark/remove/${id}`)
}