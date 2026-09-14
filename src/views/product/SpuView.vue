<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import CategorySelector from '@/components/CategorySelector.vue'
import { reqSpuList } from '@/api/spu'
import type { SpuItem } from '@/api/spu'

const c3Id = ref<number>()
const loading = ref(false)
// spu 列表
const spuList = ref<SpuItem[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(10)

function onCategoryChange(_c1: number | undefined, _c2: number | undefined, c3: number | undefined) {
  c3Id.value = c3
  spuList.value = []
  total.value = 0
  page.value = 1
  if (c3) loadList()
}

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

function onAdd() { ElMessage.info('添加 SPU 功能待 Part 12 实现') }
function onEdit(row: SpuItem) { ElMessage.info(`编辑 ${row.spuName} 功能待 Part 12 实现`) }
function onDelete(row: SpuItem) { ElMessage.info(`删除 ${row.spuName} 功能待 Part 12 实现`) }
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
</template>

<style scoped>
.table-header { display: flex; justify-content: flex-end; margin-bottom: 12px; }
.pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>