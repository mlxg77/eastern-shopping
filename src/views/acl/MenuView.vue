<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { reqMenuTree, reqSaveMenu, reqUpdateMenu, reqDeleteMenu } from '@/api/acl'
import type { MenuNode } from '@/api/acl'

// ---- 菜单树数据 ----
const loading = ref(false)
const menuTree = ref<MenuNode[]>([])

// 平铺所有节点（用于"父菜单选择"下拉）
const allNodes = ref<MenuNode[]>([])
function flatten(ns: MenuNode[] | null): MenuNode[] {
  const out: MenuNode[] = []
  const walk = (list: MenuNode[] | null) => {
    ;(list ?? []).forEach((n) => {
      out.push(n)
      walk(n.children)
    })
  }
  walk(ns)
  return out
}

async function loadTree() {
  loading.value = true
  try {
    const res = await reqMenuTree()
    menuTree.value = res.data
    allNodes.value = flatten(res.data)
  } finally {
    loading.value = false
  }
}

// ---- 新增 / 编辑对话框 ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = ref(false)

const form = reactive<{
  id?: number
  name: string
  code: string
  type: number
  level: number
  pid: number
}>({ name: '', code: '', type: 1, level: 1, pid: 0 })

// 新增顶级菜单
function onAdd() {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.code = ''
  form.type = 1
  form.level = 1
  form.pid = 0
  dialogVisible.value = true
}

// 添加子菜单（自动继承 pid 和 level）
function onAddChild(parent: MenuNode) {
  isEdit.value = false
  form.id = undefined
  form.name = ''
  form.code = ''
  form.type = 1
  form.level = parent.level + 1
  form.pid = parent.id
  dialogVisible.value = true
}

function onEdit(row: MenuNode) {
  isEdit.value = true
  form.id = row.id
  form.name = row.name
  form.code = row.code
  form.type = row.type
  form.level = row.level
  form.pid = row.pid
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await reqUpdateMenu({
        id: form.id!,
        name: form.name,
        code: form.code,
        level: form.level,
        pid: form.pid,
      })
      ElMessage.success('修改成功')
    } else {
      await reqSaveMenu({
        name: form.name,
        code: form.code,
        type: form.type,
        level: form.level,
        pid: form.pid,
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadTree()
  } catch {
    // 错误提示交给响应拦截器统一处理
  } finally {
    submitting.value = false
  }
}

// ---- 删除 ----
async function onDelete(id: number) {
  await reqDeleteMenu(id)
  ElMessage.success('删除成功')
  loadTree()
}

onMounted(loadTree)
</script>

<template>
  <el-card shadow="never">
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="onAdd">添加顶级菜单</el-button>
    </div>

    <!-- 树形表格：row-key + tree-props 让 el-table 渲染 children 嵌套 -->
    <el-table
      :data="menuTree"
      v-loading="loading"
      row-key="id"
      border
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="code" label="权限码" width="180" />
      <el-table-column label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.type === 1 ? 'success' : 'info'">
            {{ row.type === 1 ? '菜单' : '按钮' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="层级" width="80" />
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="onAddChild(row)">添加子菜单</el-button>
          <el-button size="small" link @click="onEdit(row)">修改</el-button>
          <el-popconfirm title="确定删除该菜单吗？" @confirm="onDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 新增 / 编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="isEdit ? '修改菜单' : '添加菜单'" width="520px">
    <el-form
      ref="formRef"
      :model="form"
      :rules="{
        name: [{ required: true, message: '请输入名称' }],
        code: [{ required: true, message: '请输入权限码' }],
      }"
      label-width="80px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" placeholder="如：用户管理" />
      </el-form-item>
      <el-form-item label="权限码" prop="code">
        <el-input v-model="form.code" placeholder="如：User / btn.User.add" />
      </el-form-item>
      <el-form-item label="类型">
        <el-radio-group v-model="form.type">
          <el-radio :value="1">菜单</el-radio>
          <el-radio :value="2">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="层级">
        <el-input-number v-model="form.level" :min="1" :max="4" />
      </el-form-item>
      <el-form-item label="父菜单">
        <el-select v-model="form.pid" placeholder="顶级菜单" clearable style="width: 100%">
          <el-option :value="0" label="无（顶级）" />
          <el-option
            v-for="n in allNodes"
            :key="n.id"
            :label="n.name + '（' + n.code + '）'"
            :value="n.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
