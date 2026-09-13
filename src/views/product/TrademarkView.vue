<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { reqTrademarkPage, reqAddOrUpdateTrademark, reqRemoveTrademark } from '@/api/trademark'
import type { Trademark } from '@/api/trademark'

// ---- 列表数据 ----
const tableData = ref<Trademark[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const loading = ref(false)

async function loadList() {
  loading.value = true
  try {
    const res = await reqTrademarkPage(page.value, limit.value)
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

// ---- 对话框（新增 / 编辑复用） ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

// 用一个响应式对象存表单：有 id 表示编辑模式，没有表示新增
const form = reactive<Trademark>({
  id: undefined,
  tmName: '',
  logoUrl: '',
})

const rules: FormRules<Trademark> = {
  tmName: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
}

function onAdd() {
  form.id = undefined
  form.tmName = ''
  form.logoUrl = ''
  dialogVisible.value = true
}

function onEdit(row: Trademark) {
  // 深拷贝：避免修改时直接改到列表里的对象
  form.id = row.id
  form.tmName = row.tmName
  form.logoUrl = row.logoUrl ?? ''
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate() // 校验不通过会抛异常，不会往下走
  submitting.value = true
  try {
    await reqAddOrUpdateTrademark({ ...form })
    ElMessage.success(form.id ? '修改成功' : '添加成功')
    dialogVisible.value = false
    loadList()
  } finally {
    submitting.value = false
  }
}

// ---- 删除 ----
async function onDelete(id: number) {
  await reqRemoveTrademark(id)
  ElMessage.success('删除成功')
  // 当前页只剩这一条且不在第一页 → 回到上一页再刷
  if (tableData.value.length === 1 && page.value > 1) {
    page.value -= 1
  }
  loadList()
}

// ---- 工具：logoUrl 可能是相对路径，拼 baseURL 才能显示 ----
function toFullUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`
}

onMounted(loadList)
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span>品牌列表</span>
        <el-button type="primary" @click="onAdd">添加品牌</el-button>
      </div>
    </template>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading" border>
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="tmName" label="品牌名称" />
      <el-table-column label="LOGO" width="120" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.logoUrl"
            :src="toFullUrl(row.logoUrl)"
            style="width: 60px; height: 60px"
            fit="contain"
            :preview-src-list="[toFullUrl(row.logoUrl)]"
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该品牌吗？" @confirm="onDelete(row.id)">
            <template #reference>
                <!-- 指定触发弹出框（如气泡确认框、弹出框等）的触发元素。 -->
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="limit"
      :page-sizes="[5, 10, 20]"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadList"
      @current-change="loadList"
      style="justify-content: flex-end; margin-top: 16px"
    />
  </el-card>

  <!-- 新增 / 编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="form.id ? '修改品牌' : '添加品牌'" width="500px" @close="resetForm">
    <el-form :model="form" :rules="rules" label-width="80px" ref="formRef">
      <el-form-item label="品牌名称" prop="tmName">
        <el-input v-model="form.tmName" placeholder="请输入品牌名称" />
      </el-form-item>
      <el-form-item label="LOGO URL" prop="logoUrl">
        <el-input v-model="form.logoUrl" placeholder="https://... 或 /path/to/img.png" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>