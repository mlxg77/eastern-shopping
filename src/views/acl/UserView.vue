<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  reqUserList, reqSaveUser, reqUpdateUser, reqDeleteUser,
  reqToAssign, reqDoAssignRole,
} from '@/api/acl'
import type { UserItem, RoleItem } from '@/api/acl'

// ---- 列表 + 搜索 ----
const loading = ref(false)
const userList = ref<UserItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const keyword = ref('') // 按用户名搜索，空串 = 不过滤

async function loadList() {
  loading.value = true
  try {
    const res = await reqUserList(page.value, size.value, keyword.value || undefined)
    userList.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  page.value = 1 // 搜索后回到第一页，否则可能停在不存在的页码上
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

const form = reactive<{
  id?: number
  username: string
  name: string
  password: string
}>({ username: '', name: '', password: '' })

// 编辑态由有无 id 区分：编辑时后端契约没有 password 字段，表单也不显示
const isEdit = ref(false)

function onAdd() {
  isEdit.value = false
  form.id = undefined
  form.username = ''
  form.name = ''
  form.password = ''
  dialogVisible.value = true
}

function onEdit(row: UserItem) {
  isEdit.value = true
  form.id = row.id
  form.username = row.username
  form.name = row.name
  form.password = ''
  dialogVisible.value = true
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function onSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitting.value = true
  try {
    if (isEdit.value) {
      // 契约：update 请求体只有 id/username/name
      await reqUpdateUser({ id: form.id!, username: form.username, name: form.name })
      ElMessage.success('修改成功')
    } else {
      await reqSaveUser({ username: form.username, name: form.name, password: form.password })
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
  await reqDeleteUser(id)
  ElMessage.success('删除成功')
  // 当前页只剩一条且不是第一页 → 回退一页，避免停在空页
  if (userList.value.length === 1 && page.value > 1) {
    page.value--
  }
  loadList()
}

// ---- 分配角色抽屉 ----
const drawerVisible = ref(false)
const assignLoading = ref(false)
const allRoles = ref<RoleItem[]>([])
// checkbox-group 绑定的选中 id 数组（全量覆盖式提交）
const selectedRoleIds = ref<number[]>([])
// 当前正在分配角色的用户（提示语 + 提交时要 userId）
const currentUser = ref<UserItem>()

async function onAssign(row: UserItem) {
  currentUser.value = row
  drawerVisible.value = true
  assignLoading.value = true
  try {
    const res = await reqToAssign(row.id)
    allRoles.value = res.data.allRolesList
    selectedRoleIds.value = res.data.assignRoles.map((r) => r.id)
  } finally {
    assignLoading.value = false
  }
}

async function onAssignSubmit() {
  if (!currentUser.value) return
  submitting.value = true
  try {
    await reqDoAssignRole(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success('分配成功')
    drawerVisible.value = false
    loadList() // 列表的 roleName 是后端拼好的，必须刷新才能看到变化
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
      <el-form-item label="用户名">
        <el-input
          v-model="keyword"
          placeholder="用户名模糊搜索"
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
        <el-button type="primary" @click="onAdd">添加用户</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户表格 -->
    <el-table :data="userList" v-loading="loading" border>
      <el-table-column prop="id" label="ID" width="140" />
      <el-table-column prop="username" label="用户名" width="160" />
      <el-table-column prop="name" label="用户昵称" width="160" />
      <el-table-column prop="roleName" label="角色" min-width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="240">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="onAssign(row)">分配角色</el-button>
          <el-button size="small" link @click="onEdit(row)">修改</el-button>
          <el-popconfirm title="确定删除该用户吗？" @confirm="onDelete(row.id)">
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
  <el-dialog v-model="dialogVisible" :title="isEdit ? '修改用户' : '添加用户'" width="480px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="登录账号" />
      </el-form-item>
      <el-form-item label="用户昵称" prop="name">
        <el-input v-model="form.name" placeholder="显示名称" />
      </el-form-item>
      <!-- 编辑契约没有 password 字段：新增才显示 -->
      <el-form-item v-if="!isEdit" label="密码" prop="password">
        <el-input v-model="form.password" type="password" show-password placeholder="初始密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">确定</el-button>
    </template>
  </el-dialog>

  <!-- 分配角色抽屉 -->
  <el-drawer v-model="drawerVisible" :title="'分配角色：' + (currentUser?.name ?? '')" size="400px">
    <div v-loading="assignLoading">
      <el-checkbox-group v-model="selectedRoleIds">
        <el-checkbox
          v-for="role in allRoles"
          :key="role.id"
          :value="role.id"
          style="display: flex; margin-bottom: 12px"
        >
          {{ role.roleName }}
          <span v-if="role.remark" style="color: #999; margin-left: 8px; font-size: 12px">
            {{ role.remark }}
          </span>
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="onAssignSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>