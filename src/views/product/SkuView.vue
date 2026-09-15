<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import CategorySelector from '@/components/CategorySelector.vue'
import { reqSpuList } from '@/api/spu'
import type { SpuItem } from '@/api/spu'
import {
  reqSkuList, reqSaveSku, reqDeleteSku,
  reqSpuSaleAttrList, reqSpuImageList,
} from '@/api/sku'
import type { SkuItem, SpuSaleAttr, SpuImage, SaveSkuPayload } from '@/api/sku'

// ---- 分类 + SPU 选择 ----
const c3Id = ref<number>()
const spuList = ref<SpuItem[]>([])
const selectedSpuId = ref<number>()

async function onCategoryChange(_c1: number | undefined, _c2: number | undefined, c3: number | undefined) {
  c3Id.value = c3
  selectedSpuId.value = undefined
  spuList.value = []
  skuList.value = []
  saleAttrs.value = []
  spuImages.value = []
  if (c3) {
    const res = await reqSpuList(1, 100, c3)
    spuList.value = res.data.records ?? []
  }
}

// ---- SPU 子资源 ----
const saleAttrs = ref<SpuSaleAttr[]>([])
const spuImages = ref<SpuImage[]>([])

async function onSpuChange(spuId: number) {
  skuList.value = []
  saleAttrs.value = []
  spuImages.value = []
  if (!spuId) return
  // 并行加载销售属性和图片
  const [saleRes, imgRes] = await Promise.all([
    reqSpuSaleAttrList(spuId),
    reqSpuImageList(spuId),
  ])
  saleAttrs.value = saleRes.data ?? []
  spuImages.value = imgRes.data ?? []
  loadSkuList()
}

// ---- SKU 列表 ----
const skuList = ref<SkuItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const loading = ref(false)

async function loadSkuList() {
  if (!selectedSpuId.value) return
  loading.value = true
  try {
    const res = await reqSkuList(page.value, size.value, selectedSpuId.value)
    skuList.value = res.data.records ?? []
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// ---- 添加 SKU 表单 ----
const dialogVisible = ref(false)
const submitting = ref(false)

// 草稿中一个销售属性的取值（页面私有结构，提交时映射为后端契约格式）
interface SkuDraftAttrValue {
  spuSaleAttrId: string   // spuSaleAttrList 返回的销售属性 id，保存时原样传给 saleAttrId
  baseSaleAttrId: number  // 模板 :key 用
  saleAttrName: string
  saleAttrValueId: number
  saleAttrValueName: string
}

// 笛卡尔积生成的 SKU 行
interface SkuDraft {
  skuName: string
  price: number | undefined
  saleAttrValues: SkuDraftAttrValue[] // 每个销售属性选的值
  defaultImgUrl: string               // 默认图片 URL
}

const skuDrafts = ref<SkuDraft[]>([])

// 生成笛卡尔积
function generateDrafts() {
  const spu = spuList.value.find(s => s.id === selectedSpuId.value)
  if (!spu || saleAttrs.value.length === 0) {
    ElMessage.warning('该 SPU 没有销售属性，请先在 SPU 管理中添加')
    return
  }
  // skuDefaultImg 为空会触发后端 205，无图片时阻止生成
  if (spuImages.value.length === 0) {
    ElMessage.warning('该 SPU 没有图片，请先在 SPU 管理中上传图片')
    return
  }

  // 每个销售属性的值列表
  const attrValueLists = saleAttrs.value.map(attr =>
    attr.spuSaleAttrValueList.map(val => ({
      // spuSaleAttrList 返回的销售属性 id，原样保留
      spuSaleAttrId: attr.id,
      baseSaleAttrId: attr.baseSaleAttrId,
      saleAttrName: attr.saleAttrName,
      saleAttrValueId: val.id,
      saleAttrValueName: val.saleAttrValueName,
    }))
  )

  // 笛卡尔积
  const combos = cartesian(attrValueLists)

  skuDrafts.value = combos.map(combo => ({
    skuName: `${spu.spuName} ${combo.map(v => v.saleAttrValueName).join(' ')}`,
    price: undefined,
    saleAttrValues: combo,
    defaultImgUrl: spuImages.value[0]?.imgUrl ?? '',
  }))

  dialogVisible.value = true
}

// 笛卡尔积工具函数
function cartesian<T>(arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
    [[]],
  )
}

async function onSubmitSkus() {
  const spu = spuList.value.find(s => s.id === selectedSpuId.value)
  if (!spu) return

  // 校验：每行必须有价格
  const missing = skuDrafts.value.filter(d => !d.price && d.price !== 0)
  if (missing.length > 0) {
    ElMessage.warning('请填写所有 SKU 的价格')
    return
  }

  submitting.value = true
  try {
    // 逐条提交（后端 saveSkuInfo 一次只保存一个 SKU）
    for (const draft of skuDrafts.value) {
      const sku: SaveSkuPayload = {
        skuName: draft.skuName,
        // 后端契约：价格/分类/品牌/重量均按字符串接收（Go 侧 strconv 解析），
        // 传 number 会被读成 "" → 解析失败 → 205；spuID 键名大写 ID
        price: String(draft.price!),
        spuID: String(spu.id),
        category3Id: String(spu.category3Id),
        tmId: String(spu.tmId!),
        weight: '0',
        skuDesc: '',
        skuDefaultImg: draft.defaultImgUrl,
        isSale: 0,
        // 当前 UI 未提供 SKU 关联平台属性的选择，先传空数组
        skuAttrValueList: [],
        // saleAttrId 原样透传 spuSaleAttrList 返回的销售属性 id（勿改用 baseSaleAttrId）
        skuSaleAttrValueList: draft.saleAttrValues.map(v => ({
          saleAttrId: v.spuSaleAttrId,
          saleAttrName: v.saleAttrName,
          saleAttrValueId: String(v.saleAttrValueId),
          saleAttrValueName: v.saleAttrValueName,
        })),
        skuImageList: spuImages.value.map(img => ({
          imgName: img.imgName,
          imgUrl: img.imgUrl,
          isDefault: img.imgUrl === draft.defaultImgUrl ? '1' : '0',
          spuImgId: img.id, // 关联的 SPU 图片 ID
        })),
      }
      await reqSaveSku(sku)
    }
    ElMessage.success('SKU 添加成功')
    dialogVisible.value = false
    loadSkuList()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// ---- 删除 ----
async function onDelete(id: number) {
  await reqDeleteSku(id)
  ElMessage.success('删除成功')
  if (skuList.value.length === 1 && page.value > 1) {
    page.value--
  }
  loadSkuList()
}

// ---- 图片完整 URL 拼接（复用 Part 9 逻辑） ----
function toFullUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const cleanPath = url.startsWith('/api') ? url.slice(4) : url
  return `${import.meta.env.VITE_API_BASE_URL}${cleanPath}`
}

onMounted(() => {
  // 页面加载时不需要额外操作，三级分类组件自己会加载一级分类
})
</script>

<template>
  <el-card shadow="never">
    <CategorySelector @change="onCategoryChange" />

    <!-- SPU 选择 -->
    <el-form inline style="margin-bottom: 16px">
      <el-form-item label="SPU">
        <el-select
          v-model="selectedSpuId"
          placeholder="请选择 SPU"
          clearable
          :disabled="!c3Id"
          @change="onSpuChange"
          style="width: 300px"
        >
          <el-option v-for="spu in spuList" :key="spu.id" :label="spu.spuName" :value="spu.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- SPU 信息展示 -->
    <div v-if="selectedSpuId" class="spu-info">
      <!-- 销售属性 -->
      <div class="info-section" v-if="saleAttrs.length">
        <h4>销售属性</h4>
        <div v-for="attr in saleAttrs" :key="attr.baseSaleAttrId" style="margin-bottom: 8px">
          <strong>{{ attr.saleAttrName }}：</strong>
          <el-tag v-for="val in attr.spuSaleAttrValueList" :key="val.id" style="margin-right: 4px">
            {{ val.saleAttrValueName }}
          </el-tag>
        </div>
      </div>

      <!-- 图片列表 -->
      <div class="info-section" v-if="spuImages.length">
        <h4>SPU 图片</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <el-image
            v-for="img in spuImages"
            :key="img.id"
            :src="toFullUrl(img.imgUrl)"
            :preview-src-list="spuImages.map(i => toFullUrl(i.imgUrl))"
            style="width: 80px; height: 80px"
            fit="cover"
          />
        </div>
      </div>
    </div>

    <!-- SKU 列表 -->
    <div v-if="selectedSpuId" style="margin-top: 16px">
      <div class="table-header">
        <el-button type="primary" @click="generateDrafts" :disabled="saleAttrs.length === 0">
          添加 SKU
        </el-button>
      </div>

      <el-table :data="skuList" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="180" />
        <el-table-column prop="skuName" label="SKU 名称" width="250" />
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">¥{{ (row.price / 100).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-popconfirm title="确定删除该 SKU 吗？" @confirm="onDelete(row.id)">
              <template #reference>
                <el-button size="small" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination" v-if="total > 0">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadSkuList"
          @current-change="loadSkuList"
        />
      </div>
    </div>
  </el-card>

  <!-- 添加 SKU 对话框 -->
  <el-dialog v-model="dialogVisible" title="添加 SKU" width="900px">
    <el-table :data="skuDrafts" border size="small">
      <el-table-column label="SKU 名称" min-width="200">
        <template #default="{ row }">
          <el-input v-model="row.skuName" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="销售属性" min-width="200">
        <template #default="{ row }">
          <el-tag v-for="v in row.saleAttrValues" :key="v.baseSaleAttrId" size="small" style="margin-right: 4px">
            {{ v.saleAttrName }}: {{ v.saleAttrValueName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格（分）" width="140">
        <template #default="{ row }">
          <el-input-number v-model="row.price" :min="0" :step="100" size="small" controls-position="right" style="width: 100%" />
        </template>
      </el-table-column>
      <el-table-column label="默认图片" width="200">
        <template #default="{ row }">
          <el-select v-model="row.defaultImgUrl" size="small" placeholder="选择默认图" style="width: 100%">
            <el-option v-for="img in spuImages" :key="img.id" :label="img.imgName" :value="img.imgUrl">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-image :src="toFullUrl(img.imgUrl)" style="width: 32px; height: 32px" fit="cover" />
                <span>{{ img.imgName }}</span>
              </div>
            </el-option>
          </el-select>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmitSkus">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.spu-info { padding: 12px; background: #f5f7fa; border-radius: 4px; }
.info-section { margin-bottom: 12px; }
.info-section h4 { margin: 0 0 8px 0; font-size: 14px; color: #606266; }
.table-header { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>