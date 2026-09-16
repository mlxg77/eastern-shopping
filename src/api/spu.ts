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

// ---- 保存/修改 SPU 的请求体契约（实测 + 后端示例对齐） ----
// ⚠️ 后端约定：spuImageList 与 spuSaleAttrList 必须双双非空，
// 且每个销售属性必须带非空值列表 —— 缺任何一项都返回 205「服务繁忙」
export interface SpuImage {
  imgName: string
  imgUrl: string
}

export interface SpuSaleAttrValue {
  saleAttrValueName: string
  baseSaleAttrId: number
}

export interface SpuSaleAttr {
  baseSaleAttrId: number
  saleAttrName: string
  spuSaleAttrValueList: SpuSaleAttrValue[]
}

export interface SaveSpuPayload {
  spuName: string
  description: string
  category3Id: number
  tmId: number
  id?: number // 修改时携带，新增不带
  spuImageList: SpuImage[]
  spuSaleAttrList: SpuSaleAttr[]
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export function reqSpuList(page: number, size: number, category3Id: number) {
  // API.md 12.1 规范路径：分页走路径参数（旧路径 /spu/list 仍兼容，勿再用）
  return request.get<unknown, ResponseBody<PageResult<SpuItem>>>(
    `/admin/product/${page}/${size}?category3Id=${category3Id}`
  )
}

// 保存（新增）SPU
export function reqSaveSpu(data: SaveSpuPayload) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/saveSpuInfo', data)
}

// 修改 SPU
export function reqUpdateSpu(data: SaveSpuPayload) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/updateSpuInfo', data)
}

// 删除 SPU
export function reqDeleteSpu(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/product/deleteSpu/${id}`)
}

// 品牌全量列表（API.md 9.5，不分页；旧实现用分页接口取前 100 条当全量，品牌超 100 会丢）
export function reqBrandList() {
  return request.get<unknown, ResponseBody<{ id: number; tmName: string }[]>>(
    '/admin/product/baseTrademark/getTrademarkList'
  )
}

// ---- 基础销售属性字典（颜色/版本/尺码…） ----
export interface BaseSaleAttr {
  id: number
  name: string
}

export function reqBaseSaleAttrList() {
  return request.get<unknown, ResponseBody<BaseSaleAttr[]>>('/admin/product/baseSaleAttrList')
}