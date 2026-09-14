<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { reqAttrList, reqSaveAttr, reqDeleteAttr } from '@/api/attr'
import type { Attr, AttrValue } from '@/api/attr'
import CategorySelector from '@/components/CategorySelector.vue'

// ---- 分类状态（从公共组件 emit 回来） ----
const c1 = ref<number>()
const c2 = ref<number>()
const c3 = ref<number>()

// 三级分类变化回调（子组件 emit 触发）
function onCategoryChange(c1Val: number | undefined, c2Val: number | undefined, c3Val: number | undefined) {
  c1.value = c1Val
  c2.value = c2Val
  c3.value = c3Val
  // 三级都选了才加载属性，否则清空
  if (c1Val && c2Val && c3Val) {
    loadAttrs()
  } else {
    attrs.value = []
  }
}

// ---- 属性表格 ----
const attrs = ref<Attr[]>([])
const loading = ref(false)

async function loadAttrs() {
  if (!c1.value || !c2.value || !c3.value) return
  loading.value = true
  try {
    attrs.value = (await reqAttrList(c1.value, c2.value, c3.value)).data ?? []
  } finally {
    loading.value = false
  }
}

// ---- 对话框（新增 / 编辑） ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const inputValue = ref('')

const form = reactive<Attr>({
  id: undefined,
  attrName: '',
  categoryId: 0,
  categoryLevel: 3,
  attrValueList: [],
})

// 独立 ref，模板绑定更清晰（与 form.attrValueList 指向同一数组）
const attrValues = ref<AttrValue[]>([])

function onAdd() {
  form.id = undefined
  form.attrName = ''
  form.categoryId = c3.value!
  form.categoryLevel = 3
  form.attrValueList = []
  attrValues.value = form.attrValueList
  inputValue.value = ''
  dialogVisible.value = true
}

function onEdit(row: Attr) {
  form.id = row.id
  form.attrName = row.attrName
  form.categoryId = row.categoryId
  form.categoryLevel = row.categoryLevel
  // 深拷贝属性值：避免编辑时直接污染列表里的原数据
  form.attrValueList = row.attrValueList.map((v) => ({ ...v }))
  attrValues.value = form.attrValueList
  inputValue.value = ''
  dialogVisible.value = true
}

function addValue() {
  const name = inputValue.value.trim()
  if (!name) return
  attrValues.value.push({ valueName: name })
  inputValue.value = ''
}

function removeValue(idx: number) {
  attrValues.value.splice(idx, 1)
}

async function onSubmit() {
  if (!formRef.value) return
  // 检查表单有没有填对
  await formRef.value.validate()
  if (attrValues.value.length === 0) {
    ElMessage.warning('请至少添加一个属性值')
    return
  }
  submitting.value = true
  try {
    await reqSaveAttr({ ...form, attrValueList: [...attrValues.value] })
    ElMessage.success(form.id ? '修改成功' : '添加成功')
    dialogVisible.value = false
    loadAttrs()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    submitting.value = false
  }
}

// ---- 删除 ----
async function onDelete(id: number) {
  await reqDeleteAttr(id)
  ElMessage.success('删除成功')
  loadAttrs()
}


</script>

<template>
  <el-card shadow="never">
    <!-- 三级联动选择器（公共组件） -->
    <CategorySelector @change="onCategoryChange" />

    <!-- 属性表格 -->
    <div class="table-header">
      <el-button type="primary" :disabled="!c3" @click="onAdd">添加属性</el-button>
    </div>

    <el-table :data="attrs" v-loading="loading" border>
      <el-table-column prop="id" label="序号" width="180" />
      <el-table-column prop="attrName" label="属性名称" width="200" />
      <el-table-column label="属性值">
        <template #default="{ row }">
          <el-tag
            v-for="v in row.attrValueList"
            :key="v.id"
            style="margin-right: 4px; margin-bottom: 4px"
          >
            {{ v.valueName }}
          </el-tag>
          <span v-if="!row.attrValueList?.length">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" @click="onEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除该属性吗？" @confirm="onDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增 / 编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="form.id ? '修改属性' : '添加属性'" width="600px">
    <el-form :model="form" :rules="{ attrName: [{ required: true, message: '请输入属性名称', trigger: 'blur' }] }" label-width="80px" ref="formRef">
      <el-form-item label="属性名称" prop="attrName">
        <el-input v-model="form.attrName" placeholder="请输入属性名称" />
      </el-form-item>
      <el-form-item label="属性值">
        <div style="width: 100%">
          <div v-for="(v, idx) in attrValues" :key="idx" style="display: flex; gap: 8px; margin-bottom: 8px">
            <el-input v-model="v.valueName" placeholder="属性值" />
            <el-button type="danger" :icon="Delete" circle @click="removeValue(idx)" />
          </div>
          <div style="display: flex; gap: 8px">
            <el-input v-model="inputValue" placeholder="输入属性值后点添加" @keyup.enter="addValue" />
            <el-button type="primary" @click="addValue">添加</el-button>
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

<script lang="ts">
import { Delete } from '@element-plus/icons-vue'
export default {}
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}
</style>