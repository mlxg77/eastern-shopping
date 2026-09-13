/// <reference types="vite/client" />

// 兜底声明：当编辑器里的 Vue 语言服务（Vue - Official / Volar）未生效时，
// 避免内置 TS 语言服务对 `.vue` 导入报 ts(2307)。
// vue-tsc 与 Volar 生效时会按真实文件解析，优先级高于此通配声明。
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // 不带类型参数，使用 DefineComponent 的默认类型（等效于旧写法，且符合 eslint 规则）
  const component: DefineComponent
  export default component
}
