import request from '@/utils/request'
import type { ResponseBody } from './user'

export interface SpuItem {
  id: number
  spuName: string
  description: string
  category3Id: number
  // 新增时可为空（未选择品牌），编辑/列表返回时一定存在
  tmId?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function reqSpuList(page: number, size: number, category3Id: number) {
  return request.get<unknown, ResponseBody<PageResult<SpuItem>>>(
    `/admin/product/spu/list?page=${page}&size=${size}&category3Id=${category3Id}`
  )
}

// 保存（新增）SPU
export function reqSaveSpu(data: SpuItem) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/saveSpuInfo', data)
}

// 修改 SPU
export function reqUpdateSpu(data: SpuItem) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/updateSpuInfo', data)
}

// 删除 SPU
export function reqDeleteSpu(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/product/deleteSpu/${id}`)
}

// 品牌列表（复用已有接口，取第一页 100 条当全量）
export function reqBrandList() {
  return request.get<unknown, ResponseBody<PageResult<{ id: number; tmName: string }>>>(
    '/admin/product/baseTrademark/1/100'
  )
}