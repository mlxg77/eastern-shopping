import request from '@/utils/request'
import type { ResponseBody } from './user'

export interface SpuItem {
  id: number
  spuName: string
  description: string
  category3Id: number
  tmId: number
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