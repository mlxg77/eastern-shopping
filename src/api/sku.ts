import request from '@/utils/request'
import type { ResponseBody } from './user'
import type { PageResult } from './spu'

// ---- SKU 相关 ----
export interface SkuItem {
  id?: number
  skuName: string
  price: number
  // 后端列表实际键名为 spuID（大写 ID，与 saveSkuInfo 请求体一致）
  spuID: number
  category3Id: number
  tmId: number
  // 0 = 未上架，1 = 已上架（onSale/cancelSale 接口切换）
  isSale: number
  skuSaleAttrValueList: SkuSaleAttrValue[]
  skuImageList: SkuImage[]
}

export interface SkuSaleAttrValue {
  baseSaleAttrId: number
  saleAttrName: string
  saleAttrValueId: number
  saleAttrValueName: string
}

export interface SkuImage {
  imgName: string
  imgUrl: string
  isDefault?: string // '1' = 默认图
  spuImgId?: number // 关联的 SPU 图片 ID（保存 SKU 时需带上）
}

export function reqSkuList(page: number, size: number, spuId: number) {
  return request.get<unknown, ResponseBody<PageResult<SkuItem>>>(
    `/admin/product/list/${page}/${size}?spuId=${spuId}`
  )
}

// 保存 SKU 时销售属性值的契约格式：键名是 saleAttrId（不是 baseSaleAttrId），
// 且后端按字符串接收（Go 侧 strconv 解析，传 number 会被读成 "" → 205）
export interface SaveSkuSaleAttrValue {
  saleAttrId: string
  saleAttrName: string
  saleAttrValueId: string
  saleAttrValueName: string
}

// 保存 SKU 时平台属性值的契约格式（当前 UI 未提供平台属性选择，传空数组即可）
export interface SaveSkuAttrValue {
  attrId: string
  attrName: string
  valueId: string
  valueName: string
}

// 保存 SKU 请求体：与后端 saveSkuInfo 契约对齐——
// price/category3Id/tmId/weight 等 ID、数值类字段后端一律按字符串接收
// （Go 侧 strconv 解析，传 number 会被读成 "" → 解析失败 → 205）；spuID 键名大写 ID
export interface SaveSkuPayload {
  skuName: string
  price: string
  spuID: string
  category3Id: string
  tmId: string
  weight: string
  skuDesc: string
  skuDefaultImg: string
  isSale: number // 0 = 未上架
  skuAttrValueList: SaveSkuAttrValue[]
  skuSaleAttrValueList: SaveSkuSaleAttrValue[]
  skuImageList: SkuImage[]
}

export function reqSaveSku(data: SaveSkuPayload) {
  return request.post<unknown, ResponseBody<null>>('/admin/product/saveSkuInfo', data)
}

export function reqDeleteSku(id: number) {
  return request.delete<unknown, ResponseBody<null>>(`/admin/product/deleteSku/${id}`)
}

// 上架 / 下架：后端用 GET（无请求体），传 SKU id 即可
export function reqOnSale(skuId: number) {
  return request.get<unknown, ResponseBody<null>>(`/admin/product/onSale/${skuId}`)
}

export function reqCancelSale(skuId: number) {
  return request.get<unknown, ResponseBody<null>>(`/admin/product/cancelSale/${skuId}`)
}

// ---- SPU 子资源（选 SPU 后加载） ----
export interface SpuSaleAttr {
  // 后端以字符串返回雪花 ID（防大数精度丢失）；保存 SKU 时此 id 原样传给 saleAttrId
  id: string
  baseSaleAttrId: number
  saleAttrName: string
  spuId: number
  spuSaleAttrValueList: {
    id: number
    saleAttrValueName: string
    baseSaleAttrId: number
    spuId: number
  }[]
}

export interface SpuImage {
  id: number
  imgName: string
  imgUrl: string
  spuId: number
}

export function reqSpuSaleAttrList(spuId: number) {
  return request.get<unknown, ResponseBody<SpuSaleAttr[]>>(
    `/admin/product/spuSaleAttrList/${spuId}`
  )
}

export function reqSpuImageList(spuId: number) {
  return request.get<unknown, ResponseBody<SpuImage[]>>(
    `/admin/product/spuImageList/${spuId}`
  )
}