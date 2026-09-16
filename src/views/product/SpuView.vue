<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, UploadRequestOptions } from 'element-plus'
import CategorySelector from '@/components/CategorySelector.vue'
import {
  reqSpuList, reqSaveSpu, reqUpdateSpu, reqDeleteSpu, reqBrandList,
  reqBaseSaleAttrList,
} from '@/api/spu'
import type { SpuItem, SpuImage, SpuSaleAttr } from '@/api/spu'
import { reqSpuImageList, reqSpuSaleAttrList } from '@/api/sku'
import { reqUploadImage } from '@/api/trademark'

// ---- 分类状态 ----
const c3Id = ref<number>()

// ---- SPU 列表 ----
const loading = ref(false)
const spuList = ref<SpuItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

async function loadList() {
  if (!c3Id.value) return
  loading.value = true
  try {
    const res = await reqSpuList(page.value, size.value, c3Id.value)
    spuList.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// ---- 品牌下拉 ----
const brandList = ref<{ id: number; tmName: string }[]>([])

async function loadBrands() {
  const res = await reqBrandList()
  brandList.value = res.data.records ?? []
}

// ---- 基础销售属性字典（颜色/版本/尺码…） ----
const baseSaleAttrList = ref<{ id: number; name: string }[]>([])

async function loadBaseSaleAttrs() {
  const res = await reqBaseSaleAttrList()
  baseSaleAttrList.value = res.data ?? []
}

// ---- 对话框 ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单状态 = 后端契约的完整形态（图片列表 + 销售属性列表都在里面）
const form = reactive({
  id: 0,
  spuName: '',
  description: '',
  category3Id: 0,
  // 空 = 未选择品牌，不用 0 冒充（0 会被 el-select 显示成原始值、还会骗过 required 校验）
  tmId: undefined as number | undefined,
  spuImageList: [] as SpuImage[],
  spuSaleAttrList: [] as SpuSaleAttr[],
})

const rules = {
  spuName: [{ required: true, message: '请输入 SPU 名称', trigger: 'blur' }],
  tmId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
}

// ---- 图片上传（复用 Part 9 的自定义上传模式） ----

// 后端存的 imgUrl 是相对路径（可能带 /api 前缀），显示前要拼接并去掉 /api
function toFullUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const cleanPath = url.startsWith('/api') ? url.slice(4) : url
  return `${import.meta.env.VITE_API_BASE_URL}${cleanPath}`
}

async function handleUpload(options: UploadRequestOptions) {
  try {
    const res = await reqUploadImage(options.file)
    form.spuImageList.push({ imgName: options.file.name, imgUrl: res.data })
    ElMessage.success('上传成功')
  } catch {
    ElMessage.error('上传失败，请稍后重试')
  }
}

function removeImage(idx: number) {
  form.spuImageList.splice(idx, 1)
}

// ---- 销售属性编辑 ----

// 下拉选中的基础属性 id（待添加）
const newAttrId = ref<number>()
// 每个属性的"添加值"输入框内容，按 baseSaleAttrId 索引
const attrInputs = reactive<Record<number, string>>({})

function addAttr() {
  if (!newAttrId.value) return
  const base = baseSaleAttrList.value.find((b) => b.id === newAttrId.value)
  if (!base) return
  form.spuSaleAttrList.push({
    baseSaleAttrId: base.id,
    saleAttrName: base.name,
    spuSaleAttrValueList: [],
  })
  newAttrId.value = undefined
}

function removeAttr(idx: number) {
  form.spuSaleAttrList.splice(idx, 1)
}

function addValue(attrIdx: number) {
  const attr = form.spuSaleAttrList[attrIdx]
  if (!attr) return
  const name = (attrInputs[attr.baseSaleAttrId] ?? '').trim()
  if (!name) return
  attr.spuSaleAttrValueList.push({ saleAttrValueName: name, baseSaleAttrId: attr.baseSaleAttrId })
  attrInputs[attr.baseSaleAttrId] = ''
}

function removeValue(attrIdx: number, valueIdx: number) {
  const attr = form.spuSaleAttrList[attrIdx]
  if (!attr) return
  attr.spuSaleAttrValueList.splice(valueIdx, 1)
}

// ---- 打开对话框 ----

function onAdd() {
  form.id = 0
  form.spuName = ''
  form.description = ''
  form.category3Id = c3Id.value!
  form.tmId = undefined
  form.spuImageList = []
  form.spuSaleAttrList = []
  Object.keys(attrInputs).forEach((k) => delete attrInputs[Number(k)])
  dialogVisible.value = true
}

async function onEdit(row: SpuItem) {
  onAdd() // 先重置表单并打开对话框
  form.id = row.id
  form.spuName = row.spuName
  form.description = row.description
  form.category3Id = row.category3Id
  form.tmId = row.tmId
  // 编辑回显：列表接口不返回子资源，需并行拉图片列表和销售属性列表拼装
  const [imgRes, attrRes] = await Promise.all([
    reqSpuImageList(row.id),
    reqSpuSaleAttrList(row.id),
  ])
  form.spuImageList = (imgRes.data ?? []).map((x) => ({ imgName: x.imgName, imgUrl: x.imgUrl }))
  form.spuSaleAttrList = (attrRes.data ?? []).map((x) => ({
    baseSaleAttrId: x.baseSaleAttrId,
    saleAttrName: x.saleAttrName,
    // 后端缺陷：值列表不落库，拉回恒为 null —— 置为空数组让用户重新填
    spuSaleAttrValueList: x.spuSaleAttrValueList ?? [],
  }))
}

// ---- 提交 ----

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  // 后端 205 契约的前置拦截：图片、销售属性、属性值三者都不能为空
  if (form.spuImageList.length === 0) {
    ElMessage.warning('请至少上传一张 SPU 图片')
    return
  }
  if (form.spuSaleAttrList.length === 0) {
    ElMessage.warning('请至少添加一个销售属性')
    return
  }
  const emptyAttr = form.spuSaleAttrList.find((a) => a.spuSaleAttrValueList.length === 0)
  if (emptyAttr) {
    ElMessage.warning(`销售属性「${emptyAttr.saleAttrName}」还没有属性值，请补充`)
    return
  }

  submitting.value = true
  try {
    // 按后端契约组装：图片只带 imgName/imgUrl，属性值带上所属 baseSaleAttrId
    const payload = {
      spuName: form.spuName,
      description: form.description,
      category3Id: form.category3Id,
      tmId: form.tmId!,
      spuImageList: form.spuImageList.map(({ imgName, imgUrl }) => ({ imgName, imgUrl })),
      spuSaleAttrList: form.spuSaleAttrList.map((a) => ({
        baseSaleAttrId: a.baseSaleAttrId,
        saleAttrName: a.saleAttrName,
        spuSaleAttrValueList: a.spuSaleAttrValueList.map((v) => ({
          saleAttrValueName: v.saleAttrValueName,
          baseSaleAttrId: a.baseSaleAttrId,
        })),
      })),
    }
    // 有 id = 修改，无 id = 新增
    if (form.id) {
      await reqUpdateSpu({ ...payload, id: form.id })
    } else {
      await reqSaveSpu(payload)
    }
    ElMessage.success(form.id ? '修改成功' : '添加成功')
    dialogVisible.value = false
    loadList()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// ---- 删除（含智能回退页） ----
async function onDelete(row: SpuItem) {
  await reqDeleteSpu(row.id)
  ElMessage.success('删除成功')
  // 删完当前页最后一条且不是第一页 → 回退一页
  if (spuList.value.length === 1 && page.value > 1) {
    page.value--
  }
  loadList()
}

// ---- 分类变化回调 ----
function onCategoryChange(_c1: number | undefined, _c2: number | undefined, c3: number | undefined) {
  c3Id.value = c3
  spuList.value = []
  total.value = 0
  page.value = 1
  if (c3) loadList()
}

onMounted(() => {
  loadBrands()
  loadBaseSaleAttrs()
})
</script>

<template>
  <el-card shadow="never">
    <CategorySelector @change="onCategoryChange" />

    <div class="table-header">
      <el-button type="primary" :disabled="!c3Id" @click="onAdd">添加 SPU</el-button>
    </div>

    <el-table :data="spuList" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="180" />
      <el-table-column prop="spuName" label="SPU 名称" width="200" />
      <el-table-column prop="description" label="描述" show-overflow-tooltip />
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="onEdit(row)">管理图片</el-button>
          <el-popconfirm title="确定删除该 SPU 吗？" @confirm="onDelete(row)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="size"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadList"
        @current-change="loadList"
      />
    </div>
  </el-card>

  <!-- 新增 / 编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="form.id ? '修改 SPU' : '添加 SPU'" width="720px">
    <el-form :model="form" :rules="rules" label-width="80px" ref="formRef">
      <el-form-item label="SPU 名称" prop="spuName">
        <el-input v-model="form.spuName" placeholder="请输入 SPU 名称" />
      </el-form-item>
      <el-form-item label="品牌" prop="tmId">
        <el-select v-model="form.tmId" placeholder="请选择品牌" style="width: 100%">
          <el-option v-for="b in brandList" :key="b.id" :label="b.tmName" :value="b.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述（选填）" />
      </el-form-item>

      <!-- 图片上传区（自定义渲染已传图片，el-upload 只负责选文件） -->
      <el-form-item label="SPU 图片">
        <div class="img-area">
          <div v-for="(img, i) in form.spuImageList" :key="img.imgUrl" class="img-item">
            <el-image :src="toFullUrl(img.imgUrl)" fit="cover" />
            <el-icon class="img-del" title="删除" @click="removeImage(i)"><Delete /></el-icon>
          </div>
          <el-upload
            :show-file-list="false"
            :http-request="handleUpload"
            accept="image/*"
          >
            <div class="img-add">
              <el-icon><Plus /></el-icon>
            </div>
          </el-upload>
        </div>
      </el-form-item>

      <!-- 销售属性编辑区 -->
      <el-form-item label="销售属性">
        <div class="attr-area">
          <div v-for="(attr, i) in form.spuSaleAttrList" :key="attr.baseSaleAttrId" class="attr-row">
            <el-tag closable @close="removeAttr(i)">{{ attr.saleAttrName }}</el-tag>
            <el-tag
              v-for="(v, j) in attr.spuSaleAttrValueList"
              :key="v.saleAttrValueName"
              closable
              type="success"
              class="val-tag"
              @close="removeValue(i, j)"
            >{{ v.saleAttrValueName }}</el-tag>
            <el-input
              v-model="attrInputs[attr.baseSaleAttrId]"
              size="small"
              placeholder="回车添加值"
              class="val-input"
              @keyup.enter="addValue(i)"
            />
          </div>
          <div class="attr-add">
            <el-select v-model="newAttrId" placeholder="选择销售属性" size="small" style="width: 160px">
              <el-option
                v-for="b in baseSaleAttrList"
                :key="b.id"
                :label="b.name"
                :value="b.id"
                :disabled="form.spuSaleAttrList.some((a) => a.baseSaleAttrId === b.id)"
              />
            </el-select>
            <el-button size="small" type="primary" :disabled="!newAttrId" @click="addAttr">添加销售属性</el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.table-header { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }

/* 图片上传区 */
.img-area { display: flex; flex-wrap: wrap; gap: 8px; }
.img-item { position: relative; width: 100px; height: 100px; border-radius: 6px; overflow: hidden; }
.img-item .el-image { width: 100%; height: 100%; }
.img-del {
  position: absolute; top: 4px; right: 4px;
  background: rgba(0, 0, 0, 0.5); color: #fff;
  border-radius: 50%; padding: 2px; cursor: pointer;
}
.img-add {
  width: 100px; height: 100px;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: border-color 0.2s;
}
.img-add:hover { border-color: var(--el-color-primary); color: var(--el-color-primary); }

/* 销售属性编辑区 */
.attr-area { width: 100%; }
.attr-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 10px; }
.val-tag { margin-right: 0; }
.val-input { width: 130px; }
.attr-add { display: flex; gap: 8px; }
</style>
