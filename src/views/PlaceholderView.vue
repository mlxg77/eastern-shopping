<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <el-card>
    <h2>{{ route.meta.title }}</h2>
    <p>页面建设中，敬请期待——下一 Part 用真实业务替换它。</p>
  </el-card>
</template>