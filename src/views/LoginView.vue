<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>硅谷甄选后台管理</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="60px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 预填测试账号，开发期省得每次手敲
const form = reactive({ username: 'admin', password: '111111' })
const loading = ref(false)

// el-form 实例引用，用于提交前调 validate()
const formRef = ref<FormInstance>()

// 校验规则：prop 名要与 el-form-item 的 prop 一致
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' },
  ],
}

async function onSubmit() {
  if (!formRef.value) return
  // 校验不通过会 reject，el-form 已在字段下方红字提示，这里直接返回
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    await userStore.login(form)
    await userStore.fetchUserInfo()   // 新增：登录后立刻拉用户信息，首页右上角才有头像

    ElMessage.success('登录成功')
    router.push('/')
  } catch {
    // 错误原因拦截器里已经弹过了（如"用户名或密码错误"），这里静默
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  padding-top: 80px;
}
.login-card {
  width: 400px;
}
</style>