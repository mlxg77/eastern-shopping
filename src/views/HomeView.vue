<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getHitokoto } from '@/api/home'
const sentence = ref('加载中')
const source = ref('')

onMounted(async () => {
  try {
    const data = await getHitokoto()
    sentence.value = data.hitokoto
    source.value = data.from || '未知'
  } catch (e) {
    console.log(e)
  }
})
</script>

<template>
  <div class="home">
    <h1>硅谷甄选</h1>
    <p>{{ sentence }}</p>
    <p v-if="source">—— {{ source }}</p>
    <el-button type="primary" :icon="'Search'">随便看看</el-button>
  </div>
</template>
