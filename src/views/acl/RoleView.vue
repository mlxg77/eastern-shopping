<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, TreeInstance } from 'element-plus'
import {
  reqRoleList, reqSaveRole, reqUpdateRole, reqDeleteRole,
  reqToAssignMenu, reqDoAssignPermission,
} from '@/api/acl'
import type { RoleItem, MenuNode } from '@/api/acl'

// ---- 列表 + 搜索 ----
const loading = ref(false)
const roleList = ref<RoleItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('')

async function loadList() {
  loading.value = true
  try {
    const res = await reqRoleList(page.value, size.value, keyword.value || undefined)
    roleList.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1
  loadList()
}

function onReset() {
  keyword.value = ''
  onSearch()
}

// ---- 新增 / 编辑对话框 ----
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEdit = ref(false)

const form = reactive<{ id?: number; roleName: string; remark: string }>({
  roleName: '',
  remark: '',
})

function onAdd() {
  isEdit.value = false
  form.id = undefined
  form.roleName = ''
  form.remark = ''
  dialogVisible.value = true
}

function onEdit(row: RoleItem) {
  isEdit.value = true
  form.id = row.id
  form.roleName = row.roleName
  form.remark = row.remark
  dialogVisible.value = true
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      await reqUpdateRole({ id: form.id!, roleName: form.roleName, remark: form.remark })
      ElMessage.success('修改成功')
    } else {
      await reqSaveRole({ roleName: form.roleName, remark: form.remark })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadList()
  } catch {
    // 错误提示交给响应拦截器统一处理
  } finally {
    submitting.value = false
  }
}

// ---- 删除 ----
async function onDelete(id: number) {
  await reqDeleteRole(id)
  ElMessage.success('删除成功')
  if (roleList.value.length === 1 && page.value > 1) {
    page.value--
  }
  loadList()
}

// ---- 分配权限抽屉（el-tree） ----
const drawerVisible = ref(false)
const assignLoading = ref(false)
const treeRef = ref<TreeInstance>()
const menuTree = ref<MenuNode[]>([])
const currentRole = ref<RoleItem>()

// 递归收集 select===true 的节点 id（后端存储级联一致，父 true 时子也全 true）
function collectChecked(nodes: MenuNode[]): number[] {
  const ids: number[] = []
  const walk = (ns: MenuNode[] | null) => {
    ;(ns ?? []).forEach((n) => {
      if (n.select) ids.push(n.id)
      walk(n.children)
    })
  }
  walk(nodes)
  return ids
}

async function onAssign(row: RoleItem) {
  currentRole.value = row
  drawerVisible.value = true
  assignLoading.value = true
  try {
    // 先清空再赋值：树 data 重建，勾选状态归零，避免上次残留
    menuTree.value = []
    const res = await reqToAssignMenu(row.id)
    menuTree.value = res.data
    // 等树渲染完成再设勾选（default-checked-keys 动态改不一定生效）
    await nextTick()
    treeRef.value?.setCheckedKeys(collectChecked(res.data))
  } finally {
    assignLoading.value = false
  }
}

async function onAssignSubmit() {
  if (!treeRef.value || !currentRole.value) return
  // 关键：getCheckedKeys 只有完全勾选的节点；
  // 半选状态的父节点在 getHalfCheckedKeys 里，漏掉它保存后父菜单就丢了
  const ids = [
    ...treeRef.value.getCheckedKeys(),
    ...treeRef.value.getHalfCheckedKeys(),
  ].map(Number)
  if (ids.length === 0) {
    // 后端契约：空集合提交返回 201 参数错误
    ElMessage.warning('请至少勾选一个权限节点')
    return
  }
  submitting.value = true
  try {
    await reqDoAssignPermission(currentRole.value.id, ids)
    ElMessage.success('分配成功')
    drawerVisible.value = false
  } catch {
  } finally {
    submitting.value = false
  }
}

onMounted(loadList)
</script>

<template>
  <el-card shadow="never">
    <!-- 搜索区 -->
    <el-form inline style="margin-bottom: 16px">
      <el-form-item label="角色名称">
        <el-input
          v-model="keyword"
          placeholder="角色名模糊搜索"
          clearable
          style="width: 200px"
          @keyup.enter="onSearch"
          @clear="onReset"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">清空</el-button>
      </el-form-item>
      <el-form-item style="margin-left: auto">
        <el-button type="primary" @click="onAdd">添加角色</el-button>
      </el-form-item>
    </el-form>

    <!-- 角色表格 -->
    <el-table :data="roleList" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="140" />
      <el-table-column prop="roleName" label="角色名称" width="180" />
      <el-table-column prop="remark" label="备注" min-width="160" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="240">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="onAssign(row)">分配权限</el-button>
          <el-button size="small" link @click="onEdit(row)">修改</el-button>
          <el-popconfirm title="确定删除该角色吗？" @confirm="onDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger" link>删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="page"
      v-model:page-size="size"
      :total="total"
      :page-sizes="[5, 10, 20]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 16px; justify-content: flex-end"
      @current-change="loadList"
      @size-change="onSearch"
    />
  </el-card>

  <!-- 新增 / 编辑对话框 -->
  <el-dialog v-model="dialogVisible" :title="isEdit ? '修改角色' : '添加角色'" width="480px">
    <el-form
      ref="formRef"
      :model="form"
      :rules="{ roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }] }"
      label-width="80px"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="form.roleName" placeholder="如：运营专员" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="选填" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>

  <!-- 分配权限抽屉 -->
  <el-drawer v-model="drawerVisible" :title="'分配权限：' + (currentRole?.roleName ?? '')" size="420px">
    <div v-loading="assignLoading">
      <el-tree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        default-expand-all
        node-key="id"
        :props="{ label: 'name', children: 'children' }"
      />
    </div>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onAssignSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>