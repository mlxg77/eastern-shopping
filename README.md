# 硅谷甄选（vue3-guigu-shopping）

基于 Vue 3 + TypeScript 的电商项目，Vite 构建，pnpm 管理依赖。

> 本 README 兼作学习笔记：按开发阶段分 Part 追加记录，每个 Part 一般包含「目标 → 操作过程 → 原理与决策 → 踩坑记录」。

## 学习笔记目录

| Part | 主题 | 日期 | 状态 |
|---|---|---|---|
| 1 | 项目初始化与环境搭建 | 2026-09-13 | ✅ 完成 |
| 2 | 引入 Element Plus 组件库 | 2026-09-13 | ✅ 完成 |
| 3 | 清理示例代码与最小骨架搭建 | 2026-09-13 | ✅ 完成 |
| 4 | （待开始） | — | ⬜ |

---

# Part 1 · 项目初始化

## 环境要求

| 工具 | 版本 | 说明 |
|---|---|---|
| Node.js | v25.8.1 | `package.json` 的 engines 要求 `^22.18.0 \|\| >=24.12.0` |
| pnpm | 12.4.1 | 本项目统一使用 pnpm，**不要混用 npm** |

## 技术栈与版本

| 依赖 | 版本 | 用途 |
|---|---|---|
| vue | ^3.5.40 | 框架 |
| vue-router | ^5.2.0 | 路由 |
| pinia | ^4.0.2 | 状态管理 |
| vite | ^8.1.5 | 构建工具 |
| typescript | ~6.0.0 | 类型系统 |
| oxlint + eslint | ~1.74 / ^10.7 | 代码检查（新版脚手架默认组合） |
| prettier | 3.9.5 | 代码格式化 |
| element-plus | ^2.14.5 | UI 组件库（Part 2 引入） |
| @element-plus/icons-vue | ^2.3.2 | Element 图标库（Part 2 引入） |

> 注意：这套版本比多数教程（Vite 4/5、Router 4、Pinia 2）新不少。跟教程写代码时如遇 API 报错，先怀疑版本差异。

## 快速开始

```sh
pnpm install      # 安装依赖（需在 package.json 所在目录执行）
pnpm dev          # 启动开发服务器，默认 http://localhost:5173
pnpm build        # 类型检查 + 打包
pnpm lint         # oxlint + eslint 自动修复
pnpm format       # prettier 格式化 src/
```

## 目录结构

```
├── index.html            # 入口 HTML
├── vite.config.ts        # Vite 配置（端口、代理跨域）
├── env.d.ts              # 环境类型声明
├── src
│   ├── main.ts           # 应用入口，已注册 Pinia 和 Router
│   ├── App.vue           # 根组件
│   ├── router/index.ts   # 路由表
│   ├── stores/counter.ts # Pinia 示例 store（写法参考）
│   ├── views/            # 页面级组件（Home / About 为示例）
│   ├── components/       # 可复用组件（当前为脚手架示例）
│   └── assets/           # 全局样式、图片
└── public/               # 静态资源
```

## 初始化决策记录（2026-09）

脚手架：`pnpm create vue@latest .`（末尾的 `.` 表示直接生成到当前目录，不再套一层文件夹）。**不使用 `vue create`**（Vue CLI + webpack 老方案，官方已不推荐）。

`create-vue` 交互选项的选择：

- TypeScript：选（商品、订单数据结构复杂，类型提示省坑）
- Router / Pinia：选（多页面路由、购物车与登录状态共享必需）
- JSX 支持：不选（Vue 用 SFC 模板）
- Vitest / 端到端测试：不选（前期增加复杂度，需要时随时可单独装）
- Linter / Prettier：选（其中 Linter 在新版脚手架中默认是 oxlint + ESLint 组合）
- 跳过示例代码：选 **No**（保留 counter store、路由示例作写法参考）

## 为什么用 pnpm 而不是 npm

1. **省空间**：所有包在全局 store（`C:\Users\issuser\AppData\Local\pnpm\store`）只存一份，项目里全是硬链接；同类项目装第二个时几乎不额外占空间、安装更快。
2. **防幽灵依赖**：npm 把依赖打平到 `node_modules` 根目录，导致没写进 `package.json` 的包也能被 import（教程里常见"碰巧能跑"的坑）；pnpm 的嵌套 + 符号链接结构只允许 import 已声明的依赖，构建可复现。

代价：极少数老包/构建工具不认符号链接（救急法：`.npmrc` 里加 `shamefully-hoist=true` 模拟 npm 扁平结构）。

常用命令对照：`pnpm add <pkg>`（生产依赖）、`pnpm add -D <pkg>`（开发依赖），其余 dev/build/lint 与 npm 相同。

## 踩坑记录

1. **create-vue 新版交互是多选列表**，不是逐个问 Yes/No：`↑↓` 移动光标，`空格` 切换选中（`[+]` 绿色 = 已选，`[•]` 蓝色 = 光标所在但未选），`回车` 确认。
2. **`pnpm install` 看起来卡住通常不是真卡**：
   - `WARN Tarball download average speed ... below 50 KiB/s` 只是网速慢的提示，不是错误；
   - 下载完成后进入链接阶段（把 `.pnpm` 里的包软链接到 `node_modules` 顶层）**没有进度条**，界面静止是正常现象；
   - 判断进度看 `Progress: resolved X, reused Y, downloaded Z, added W` 这一行，`added` 达到 `resolved` 数说明下载解包完毕；
   - 以终端输出 `Done in ...` 为准，期间不要 Ctrl+C；
   - Windows 上 Defender 实时防护会拖慢链接阶段，属正常现象；
   - 即使中断了重跑也不亏：已下载的包进了全局 store，重跑直接复用。
3. **`pnpm install` 必须在 `package.json` 所在目录执行**；不确定时先 `ls package.json` 确认。
4. **同一项目不要混用 npm 和 pnpm**：会留下两个 lock 文件，导致不同人装出不同版本依赖。
5. PowerShell 报"无法加载文件，因为在此系统上禁止运行脚本"时，执行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 后重开终端。
6. 端口 5173 被占用时 Vite 会自动换端口（如 5174），以终端实际输出地址为准；若报错而非自动换端口，说明有个旧 dev 进程还占着端口，先停掉它。

## IDE 建议

VS Code + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件（禁用旧 Vetur）。浏览器装 Vue.js devtools 扩展。

---

# Part 2 · 引入 Element Plus 组件库

## 目标

为项目引入 Element Plus（Element 的 Vue3 版本）作为 UI 组件库，统一界面风格，避免从零造按钮、弹窗、表单等基础组件。

## 操作过程

1. 安装依赖：

```sh
pnpm add element-plus
pnpm add @element-plus/icons-vue   # 官方图标库
```

2. 在 `src/main.ts` 全量注册（含中文语言包与全局图标注册）：

```ts
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
```

3. 验证：任意页面写 `<el-button type="primary">主要按钮</el-button>`，渲染出蓝色按钮即成功。组件带 `el-` 前缀，模板中无需 import，指令（如 `v-loading`）也全局可用。

## 原理与决策

- **全量引入 vs 按需引入**：`app.use(ElementPlus)` 是全量引入，所有组件全局可用、配置最简单，代价是打包体积大（gzip 后约 +250KB）；按需引入需配 `unplugin-auto-import` + `unplugin-vue-components` 两个插件，产物小一个数量级，但配置绕、新手排错难。**决策：学习阶段用全量引入**，等业务成型、`pnpm build` 确认体积成问题时再迁移，官方有现成迁移指南。
- **中文语言包**：分页、日期选择器等组件默认英文界面，`app.use(ElementPlus, { locale: zhCn })` 一键全局切中文。
- **图标全局注册**：图标包安装后不会自动可用，需循环 `app.component` 注册；之后模板里直接写 `<el-icon><Search /></el-icon>`。后期也可改为按需 import 单个图标。
- **服务式组件是例外**：`ElMessage`、`ElMessageBox`、`ElLoading` 这类用 JS 调用的服务不受全量注册覆盖，必须在 `<script setup>` 里手动 `import { ElMessage } from 'element-plus'`。
- **主题色（先了解即可）**：Element Plus 主题由 CSS 变量控制，改品牌色只需覆盖 `:root { --el-color-primary: ... }`，不用装任何插件，做首页时再调。

## 踩坑记录

1. **装了图标包但图标组件报"找不到"**：`@element-plus/icons-vue` 必须在 main.ts 里注册（for 循环那段），安装 ≠ 可用。
2. **`ElMessage is not defined`**：全量注册只管模板里写的组件；JS 调用的服务必须手动 import。样式无需额外引，全量 CSS 已包含。
3. **中文语言包导入路径**：官方写法 `element-plus/dist/locale/zh-cn.mjs`；教程常见的 `element-plus/es/locale/lang/zh-cn` 在部分 TS 配置下会报 `Cannot find module`，报红就换官方路径，效果相同。本项目直接用官方路径。
4. **`new dependencies optimized: element-plus`**：Vite 检测到新依赖后的正常重优化提示，不是报错；若页面短暂白屏，刷新即可。
5. **版本差异**：本项目为 element-plus ^2.14.5，比多数教程（2.2~2.5）新，个别组件 API 有调整；查用法以官方文档为准，不要照搬旧教程代码。

官方文档：https://element-plus.org/zh-CN/

---

# Part 3 · 清理示例代码与最小骨架搭建

## 目标

删掉脚手架示例内容（HelloWorld、About 页等），让项目跑出自己的界面：顶部导航 + 路由出口 + 首页占位。

## 操作过程

1. 删除示例文件：`src/components/` 整个目录、`src/views/AboutView.vue`、`src/assets/logo.svg`；**清空** `src/assets/main.css`（保留空文件——main.ts 仍 import 它）。`src/stores/counter.ts` 暂留，作 Pinia 写法参考。
2. `src/App.vue` 重写为纯骨架：`<header>` 站点导航（logo + RouterLink）+ `<main>` 里的 `<RouterView />`，另自加 `<footer>` 版权行。
3. `src/router/index.ts` 删除 about 路由，只保留 home。
4. `src/views/HomeView.vue` 重写为占位首页（标题 + `ref` 文案 + el-button/图标），顺带完成 Element Plus 组件、全局图标、响应式写法三合一验证。
5. 最小全局样式写入 `src/assets/main.css`（header 布局、激活路由高亮复用 `--el-color-primary` CSS 变量）。
6. 验收四连：`pnpm dev` 页面正常 → `pnpm lint` → `pnpm type-check` → `pnpm build`，全过才算完成。

## 原理与决策

- **`<RouterView />` 是路由出口**：页面组件渲染的位置；`<RouterLink>` 是声明式导航，当前路由自动带 `router-link-active` class，配 CSS 即可高亮。
- **main.css 清空而不删文件**：`main.ts` 里 `import './assets/main.css'`，删文件会让构建直接报错；清空内容、保留文件是安全做法。
- **阶段验收标准**：dev 页面能打开只代表"浏览器没崩"；`lint`（代码规范）+ `type-check`（TS 严格检查，dev 服务器不做）+ `build`（生产构建）三道全过才算代码健康。以后每个 Part 结束都跑这套。
- **构建产物观察**：首次 build 产出 js 1.15MB（gzip 364KB）、css 360KB（gzip 48KB），js 偏大的主因是全量引入 Element Plus（Part 2 的决策，警告非错误）；按需引入留待业务成型后评估。

## 踩坑记录

1. **误删 `src/main.ts` → 页面全白**：清理示例文件时把应用入口一起删了，浏览器拿不到 JS，页面空白且没有任何报错弹窗。排查路径：dev 服务器日志出现 `Failed to load url /src/main.ts ... Does the file exist?` → 确认文件缺失 → `git checkout -- src/main.ts` 从首次提交恢复。**页面全白先查入口文件**：index.html 里的 `/src/main.ts` 是否在、dev 日志有无 Pre-transform error、浏览器控制台有无红色报错。
2. **`env.d.ts` 兜底声明被新版 ESLint 判错**：编辑器兜底用的 `declare module '*.vue'` 采用老写法 `DefineComponent<{}, {}, any>`，触发 `no-empty-object-type` ×2 + `no-explicit-any` ×1，`pnpm lint` 整体失败（结尾 `[ELIFECYCLE] Command failed` 只是失败转述，不是新错误）。修法：去掉类型参数，用裸 `DefineComponent`（默认类型等效，且规则友好）。**教训：老教程里的 shim 片段，抄之前先过一遍新版工具链的检查。**
3. **eslint 的"安静"即通过**：oxlint 通过时会明确报 `Found 0 warnings and 0 errors`；eslint 没问题时什么都不打印、直接回到提示符——不代表它没跑。
