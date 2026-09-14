<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { reqCategory1, reqCategory2, reqCategory3 } from '@/api/attr'
import type { Category } from '@/api/attr'

// emit：选三级分类变化时通知父组件
const emit = defineEmits<{
  change: [c1: number | undefined, c2: number | undefined, c3: number | undefined]
}>()

// 三级选择器的 v-model
const c1 = ref<number>()
const c2 = ref<number>()
const c3 = ref<number>()

// 三级下拉数据
const cat1List = ref<Category[]>([])
const cat2List = ref<Category[]>([])
const cat3List = ref<Category[]>([])

async function loadCat1() {
  cat1List.value = (await reqCategory1()).data
}

async function onC1Change(val: number) {
  c2.value = undefined
  c3.value = undefined
  cat2List.value = []
  cat3List.value = []
  emit('change', val, undefined, undefined)
  cat2List.value = (await reqCategory2(val)).data
}

async function onC2Change(val: number) {
  c3.value = undefined
  cat3List.value = []
  emit('change', c1.value, val, undefined)
  cat3List.value = (await reqCategory3(val)).data
}

function onC3Change(val: number) {
  emit('change', c1.value, c2.value, val)
}

onMounted(loadCat1)
</script>

<template>
  <el-form inline style="margin-bottom: 16px">
    <el-form-item label="一级分类">
      <el-select
        v-model="c1"
        placeholder="请选择"
        clearable
        @change="onC1Change"
        style="width: 180px"
      >
        <el-option v-for="c in cat1List" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select
        v-model="c2"
        placeholder="请选择"
        clearable
        :disabled="!c1"
        @change="onC2Change"
        style="width: 180px"
      >
        <el-option v-for="c in cat2List" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select
        v-model="c3"
        placeholder="请选择"
        clearable
        :disabled="!c2"
        @change="onC3Change"
        style="width: 180px"
      >
        <el-option v-for="c in cat3List" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
    </el-form-item>
  </el-form>
</template>