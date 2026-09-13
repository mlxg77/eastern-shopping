<script setup lang="ts">
import { ref } from 'vue'
const msg = ref('coming soon ~~')
</script>

<template>
  <div class="home">
    <h1>硅谷甄选</h1>
    <p>{{ msg }}</p>
    <el-button type="primary" :icon="'Search'">随便看看</el-button>
  </div>
</template>
