<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import CategorySelector from '@/components/CategorySelector.vue'
import { reqSpuList, reqSaveSpu, reqUpdateSpu, reqDeleteSpu, reqBrandList } from '@/api/spu'
import type { SpuItem } from '@/api/spu'

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

// ---- 对话框 ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive<SpuItem>({
  id: 0,
  spuName: '',
  description: '',
  category3Id: 0,
  // 空 = 未选择品牌，不用 0 冒充（0 会被 el-select 显示成原始值、还会骗过 required 校验）
  tmId: undefined,
})

const rules = {
  spuName: [{ required: true, message: '请输入 SPU 名称', trigger: 'blur' }],
  tmId: [{ required: true, message: '请选择品牌', trigger: 'change' }],
}

function onAdd() {
  form.id = 0
  form.spuName = ''
  form.description = ''
  form.category3Id = c3Id.value!
  form.tmId = undefined
  dialogVisible.value = true
}

function onEdit(row: SpuItem) {
  form.id = row.id
  form.spuName = row.spuName
  form.description = row.description
  form.category3Id = row.category3Id
  form.tmId = row.tmId
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    // 有 id = 修改，无 id = 新增
    if (form.id) {
      await reqUpdateSpu({ ...form })
    } else {
      // 新增时不带 id（0 会被后端当作有效 id）
      const { id: _, ...data } = form   // ① 解构：把 id 起个别名丢进变量 _，其余字段收进 data
      void _                            // ② 专门"消费"掉 _
      await reqSaveSpu(data as SpuItem) // ③ data 里已经没有 id 了
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

onMounted(loadBrands)
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
          <el-button size="small" type="warning">添加图片</el-button>
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
  <el-dialog v-model="dialogVisible" :title="form.id ? '修改 SPU' : '添加 SPU'" width="600px">
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
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述（选填）" />
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
</style>