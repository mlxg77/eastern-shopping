# 硅谷甄选（vue3-guigu-shopping）

基于 Vue 3 + TypeScript 的电商项目，Vite 构建，pnpm 管理依赖。

> 本 README 兼作学习笔记：按开发阶段分 Part 追加记录，每个 Part 一般包含「目标 → 操作过程 → 原理与决策 → 踩坑记录」。

## 学习笔记目录

| Part | 主题 | 日期 | 状态 |
|---|---|---|---|
| 1 | 项目初始化与环境搭建 | 2026-09-13 | ✅ 完成 |
| 2 | 引入 Element Plus 组件库 | 2026-09-13 | ✅ 完成 |
| 3 | 清理示例代码与最小骨架搭建 | 2026-09-13 | ✅ 完成 |
| 4 | axios 封装与首次接口联调 | 2026-09-13 | ✅ 完成 |
| 5 | 接入真实后端与登录联调 | 2026-09-13 | ✅ 完成 |
| 6 | 路由守卫与退出登录 | 2026-09-13 | ✅ 完成 |
| 7 | 后台布局与动态菜单骨架 | 2026-09-13 | ✅ 完成 |
| 8 | 品牌管理（第一个 CRUD 业务页） | 2026-09-13 | ✅ 完成 |
| 9 | 品牌 LOGO 图片上传 | 2026-09-14 | ✅ 完成 |
| 10 | 平台属性管理（三级联动 + 嵌套 CRUD） | 2026-09-14 | ✅ 完成 |
| 11 | SPU 列表展示与三级分类公共组件抽取 | 2026-09-15 | ✅ 完成 |
| 12 | SPU 管理 CRUD（完整表单与 205 契约破案） | 2026-09-16 | ✅ 完成 |
| 13 | SKU 管理（笛卡尔积生成 + SPU 子资源联动 + 上架/下架） | 2026-09-16 | ✅ 完成 |
| 14 | 用户管理（ACL 三件套之一：搜索 + CRUD + 分配角色抽屉） | 2026-09-16 | ✅ 完成 |
| 15 | 角色管理（ACL 三件套之二：权限树分配 + el-tree） | 2026-09-16 | ✅ 完成 |
| 16 | （待开始） | — | ⬜ |
| 附录 | Vue 概念补充（持续累积，始终置于文末） | 2026-09-13 | 🔄 持续更新 |
| └ A.10 | 具名插槽与作用域插槽（源于菜单与表格实践） | 2026-09-13 | ✅ 完成 |
| └ A.11 | 动态组件 `<component :is>`（源于 layout 菜单实践） | 2026-09-13 | ✅ 完成 |
| └ A.12 | 模板字符串与接口路径拼接（源于品牌接口） | 2026-09-13 | ✅ 完成 |

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
| axios | ^1.20.0 | HTTP 请求库（Part 4 引入） |

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
├── .env.development      # 开发环境变量（VITE_API_BASE_URL）
├── vite.config.ts        # Vite 配置（@ 别名指向 src）
├── env.d.ts              # 环境类型声明 + *.vue 模块兜底声明
├── src
│   ├── main.ts           # 应用入口（Pinia / Router / Element Plus 注册）
│   ├── App.vue           # 根组件（外壳：导航 + 路由出口 + 用户信息）
│   ├── api/user.ts       # 用户相关接口（api 层）
│   ├── utils/request.ts  # axios 实例 + 拦截器
│   ├── router/index.ts   # 路由表
│   ├── stores/user.ts    # 用户 store（token / userInfo）
│   ├── views/            # 页面（Home / Login）
│   └── assets/           # 全局样式
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
6. 验收四连：`pnpm dev` 页面正常 → `pnpm lint` 写得规范 → `pnpm type-check` 类型安全→ `pnpm build`打包正常，全过才算完成。

## 原理与决策

- **`<RouterView />` 是路由出口**：页面组件渲染的位置；`<RouterLink>` 是声明式导航，当前路由自动带 `router-link-active` class，配 CSS 即可高亮。
- **main.css 清空而不删文件**：`main.ts` 里 `import './assets/main.css'`，删文件会让构建直接报错；清空内容、保留文件是安全做法。
- **阶段验收标准**：dev 页面能打开只代表"浏览器没崩"；`lint`（代码规范）+ `type-check`（TS 严格检查，dev 服务器不做）+ `build`（生产构建）三道全过才算代码健康。以后每个 Part 结束都跑这套。
- **构建产物观察**：首次 build 产出 js 1.15MB（gzip 364KB）、css 360KB（gzip 48KB），js 偏大的主因是全量引入 Element Plus（Part 2 的决策，警告非错误）；按需引入留待业务成型后评估。

## 踩坑记录

1. **误删 `src/main.ts` → 页面全白**：清理示例文件时把应用入口一起删了，浏览器拿不到 JS，页面空白且没有任何报错弹窗。排查路径：dev 服务器日志出现 `Failed to load url /src/main.ts ... Does the file exist?` → 确认文件缺失 → `git checkout -- src/main.ts` 从首次提交恢复。**页面全白先查入口文件**：index.html 里的 `/src/main.ts` 是否在、dev 日志有无 Pre-transform error、浏览器控制台有无红色报错。
2. **`env.d.ts` 兜底声明被新版 ESLint 判错**：编辑器兜底用的 `declare module '*.vue'` 采用老写法 `DefineComponent<{}, {}, any>`，触发 `no-empty-object-type` ×2 + `no-explicit-any` ×1，`pnpm lint` 整体失败（结尾 `[ELIFECYCLE] Command failed` 只是失败转述，不是新错误）。修法：去掉类型参数，用裸 `DefineComponent`（默认类型等效，且规则友好）。**教训：老教程里的 shim 片段，抄之前先过一遍新版工具链的检查。**
3. **eslint 的"安静"即通过**：oxlint 通过时会明确报 `Found 0 warnings and 0 errors`；eslint 没问题时什么都不打印、直接回到提示符——不代表它没跑。

---

# Part 4 · axios 封装与首次接口联调

## 目标

搭出 `request 实例 → api 层 → 页面` 三层数据链路，首页从真实接口取数据并展示，请求错误统一提示。

## 操作过程

1. `pnpm add axios`（^1.20.0）。
2. 新建 `src/utils/request.ts`：`axios.create` 建共享实例（baseURL 暂指向公开测试接口一言 `https://v1.hitokoto.cn`，超时 5 秒）；请求拦截器留空（预留 token 注入位置）；响应拦截器统一拆包返回 `response.data`，错误统一 `ElMessage.error` 提示。
3. 新建 `src/api/home.ts`：定义 `Hitokoto` 接口（`hitokoto`/`from` 字段），`getHitokoto()` 用 `request.get<Hitokoto, Hitokoto>('/')` 声明类型。
4. 重写 `src/views/HomeView.vue`：`onMounted` 钩子中 `await getHitokoto()`，成功回填 `sentence`/`source`；catch 兜底（拦截器已统一提示，页面不重复弹）。
5. 验收四连通过（lint / type-check / build 全绿）；构建产物 js 增至 1.2MB（gzip 383KB，axios 约占 50KB）。

## 原理与决策

- **三层分层的意义**：页面永远不直接碰 axios。换后端只改 `request.ts` 的 baseURL 和 api 文件里的函数，页面层无感；新增业务模块 = 新增一个 api 文件。
- **响应拦截器拆包的代价**：页面拿到的是数据本体，不用写 `.data`；但 axios 的默认类型"谎报"（声明返回 AxiosResponse，实际已被拆成 data），所以 `request.get<T, T>` 要写两个相同泛型——第一个是响应数据类型，第二个才是真实返回值类型。
- **错误处理集中在拦截器**：网络错误、404、500 统一弹提示，页面 catch 只做善后。自己加的防御：`source.value = data.from || '未知'`，应对接口返回空出处。
- **baseURL 暂写死**：后续用 `.env.development` / `.env.production` + `import.meta.env.VITE_API_BASE_URL` 管理，多环境切换不改代码。
- **拦截器是切面**：鉴权头、全局 loading、埋点都挂这两个钩子，业务代码零侵入。

## 踩坑记录

本 Part 验收一次通过，未踩坑。仅留一个理解易错点备忘：**`v-if` 只作用于它所在的那一个元素**——首页"句子"行无条件显示（空时用"加载中"占位），"出处"行的 `v-if="source"` 只控制它自己显隐，两行之间没有联动；真要写"二选一"得用 `v-if` / `v-else` 成对出现。

---

# Part 5 · 接入真实后端与登录联调

## 目标

接入真实后端（`http://159.75.82.153:10086`），打通登录全链路：环境变量管理 baseURL → request 升级（自动带 token + 业务码判断）→ 第一个真实 Pinia store → 登录页，登录后右上角显示用户头像与名称，刷新不丢。

## 后端侦察（动手前先用 swagger 实测）

- swagger 文档：`GET /swagger/doc.json`（PowerShell 的 `ConvertFrom-Json` 遇重复键会报错，用 Node `fetch` + `JSON.parse` 解析）
- 46 个接口**全是后台管理**：`/admin/acl/*`（登录/权限/角色/用户）、`/admin/product/*`（分类/品牌/SPU/SKU/属性）；前台商城接口若教程提供会是另一个服务
- 跨域：响应头 `Access-Control-Allow-Origin: *`，**前端直连，无需代理**
- 鉴权：请求头 `token: <JWT>`（实测确认，header 名就是小写 token）
- 业务错误约定：**HTTP 恒 200**，成败看 body 的 `code`（200 成功；204 用户名或密码错误），文案在 `message`
- 测试账号：`admin` / `111111`
- 关键接口：`POST /admin/acl/index/login`（body `{username,password}`，`data` 直接是 token 字符串）；`GET /admin/acl/index/info`（`data: {name, avatar, routes, buttons, roles}`）

## 操作过程

1. `.env.development` 新建 `VITE_API_BASE_URL=http://159.75.82.153:10086`；`env.d.ts` 追加 `ImportMetaEnv` 类型声明。**env 改动必须重启 dev 服务器**（Vite 启动时只读一次）。
2. `src/utils/request.ts` 升级：`baseURL` 改读环境变量；请求拦截器从 localStorage 取 token 挂到 `token` 头；响应拦截器增加业务码判断（`code !== 200` → `ElMessage.error(message)` + reject）。
3. 清理 Part 4 临时产物：删除 `src/api/home.ts`、`src/stores/counter.ts`——拦截器要求 `code === 200` 后，一言接口的纯 JSON 必挂，顺势体会全局改动的连锁影响。
4. 新建 `src/api/user.ts`：定义 `ResponseBody<T>` 统一响应体契约、`UserInfo` 类型、`reqLogin` / `reqUserInfo`（`post<unknown, ResponseBody<...>>` 双泛型，见附录 A.2）。
5. 新建 `src/stores/user.ts`：token 初始化从 localStorage 读（`?? ''`），`login()` / `fetchUserInfo()` 两个 action，登录状态唯一出口。
6. 新建 `src/views/LoginView.vue`：el-form 登录卡片（预填测试账号、loading 防重复提交、catch 静默因为拦截器已提示）。
7. `src/router/index.ts` 增加 `/login` 路由，`component: () => import(...)` **懒加载**写法。
8. `src/App.vue`：`onMounted` 有 token 即拉用户信息；右上角 `<template v-if>` 显示头像 + 名字，`v-else` 显示登录入口。

## 原理与决策

- **该后端是后台管理接口集**：记录此事实，避免后续按"商城前台接口"的期待去调用。
- **HTTP 状态 vs 业务 code 双层判断**：该后端 HTTP 恒 200，拦截器两个回调分工——第一个管 HTTP 成功时的业务码，第二个管 HTTP 异常（超时/断网/5xx）。
- **token 存 localStorage**：刷新不丢、实现简单；代价是 XSS 可读，正式项目需评估 HttpOnly Cookie 等方案。请求拦截器统一携带，业务代码无感。
- **登录状态唯一出口在 Pinia store**：组件只跟 store 打交道，token 存取细节不外泄。
- **路由懒加载**：登录页代码按需下载，首页首包不背它的体积。

## 踩坑记录

1. **登录成功但右上角无头像，`info` 请求未发出**：设计遗漏——`App.vue` 的 `onMounted` 只在整页加载执行一次；登录成功后的 `router.push('/')` 是前端路由切换，外壳组件不重挂，无人触发 `fetchUserInfo()`。修复：LoginView 中登录成功后先 `await userStore.fetchUserInfo()` 再跳转。两条触发路径并存：登录后显式调用 + F5 刷新走 `onMounted`；正规解法是路由守卫（后续 Part 处理）。此坑已沉淀为附录 A.1 易错点 4。
2. **PowerShell 解析 swagger JSON 失败**：`ConvertFrom-Json` 遇到重复键（swaggo 生成的 doc.json 常见）直接报错；改用 Node 的 `fetch + JSON.parse`（JS 对重复键宽容，后者覆盖前者）。

---

# Part 6 · 路由守卫与退出登录

## 目标

1. 未登录访问任意页面 → 弹回 `/login`；已登录访问 `/login` → 回首页。
2. "F5 刷新拉用户信息"从 `App.vue` 的 `onMounted` **上移到全局前置守卫**——收敛 Part 5 的补丁式修复，落地附录 A.1 易错点 4 的正规解法。
3. 退出登录：调后端登出接口 + **无条件**清理本地登录态。

## 操作过程

1. `src/api/user.ts` 加 `reqLogout`（`POST /admin/acl/index/logout`）。
2. `src/stores/user.ts` 加 `logout()`：try 里调后端登出（失败不阻塞），try 之外清空 `token` / `userInfo` / `localStorage`。
3. `src/router/index.ts` 注册 `router.beforeEach(async (to) => {...})` 全局前置守卫，三分支：未登录只放行 `/login`；已登录访问 `/login` 回首页；已登录但无 `userInfo` 则补拉（失败即 token 失效 → `logout()` + 回登录页）。`useUserStore()` 必须写在回调内部（时机原理见附录 A.7）。
4. `src/App.vue`：删除 `onMounted`（职责被守卫接管）；用户区加"退出"按钮（`el-button link`），`onLogout` = `store.logout()` + 成功提示 + 跳 `/login`。
5. `src/views/LoginView.vue`：删除 Part 5 修复时加的 `fetchUserInfo()`——守卫第 3 分支统一拉取，留着会双发 `info` 请求。

## 原理与决策

- **守卫返回值语义**：`true` / 不返回 = 放行；`false` = 中断；字符串/对象 = 重定向到该地址。
- **职责归位**：登录态初始化是"路由层"职责而非某个组件的生命周期；本 Part 是"组件补丁演进为结构性方案"的典型过程。
- **JWT 无状态退出**：前端清空 token 即完成退出；调后端 logout 只是"告知"（后端有黑名单机制时才有实际意义）；因此本地清理必须放在 try/catch 之外无条件执行。
- **store 与组件的职责边界**：store 管"数据变成什么样"（清状态），组件管"用户看到什么、去哪儿"（提示语 + 跳转）——`logout()` 会被多处复用（主动退出 / token 失效 / 未来的 401），提示与目标页各不相同，写死在 store 里就没法区分（详见附录 A.7 末节）。

## 踩坑记录

本 Part 一次通过，未踩坑。守卫中 `useUserStore()` 的调用时机（回调内 vs 模块顶层）已沉淀为附录 A.7。

---

# Part 7 · 后台布局与动态菜单骨架

## 目标

1. 经典后台布局：**左侧深色菜单栏 + 顶栏（折叠按钮 / 用户信息 / 退出）+ 右侧内容区**。
2. 菜单**数据驱动**：菜单项抽成配置数组（`src/layout/menu.ts`），模板 `v-for` 渲染——后续接权限时只改数据。
3. 路由改**嵌套结构**：`/login` 独立全屏，业务页面全部作为布局组件 `AdminLayout.vue` 的 children。
4. 7 个菜单项先挂同一个**占位页** `PlaceholderView.vue`（读 `route.meta.title` 显示标题），Part 8 起逐个替换为真实业务。

## 操作过程

1. 新建 `src/layout/menu.ts`：`MenuLeaf`（必有 path）/ `MenuNode`（icon 可选、children 可选）接口 + `menuConfig` 配置数组（首页 / 商品管理 4 项 / 权限管理 3 项）。
2. 新建 `src/layout/AdminLayout.vue`：`el-container` 外壳；`el-aside` 内 `el-menu` 三关键 prop——**`router`**（index 当路径跳转）、**`:default-active="route.path"`**（刷新保持高亮）、**`:collapse`**（折叠）；顶栏放折叠按钮 + 用户区（头像/名字/退出，`onLogout` 与 Part 6 相同）。
3. 新建 `src/views/PlaceholderView.vue`：`el-card` + `route.meta.title`。
4. `App.vue` 退化为纯 `<RouterView />`——布局由路由决定渲染谁，App 不再关心长什么样。
5. `src/router/index.ts` 重写：routes 变为 `/login` 独立路由 + `/` 布局路由带 8 个 children（path 不带前导 `/`，由父路径拼接），每个 children 配 `meta.title`；**守卫一字未改**。
6. `src/assets/main.css` 精简为全局基础（`html/body/#app` 高度 100% + 字体），废弃的 `.site-header` 等死样式删除，布局样式全部收进组件 `scoped`。

## 原理与决策

- **布局即组件**：后台壳是一个普通组件，登录页与后台壳平级，由路由选择渲染——这是"App 变薄、职责下沉"的标准组织方式。
- **嵌套路由 + `meta`**：children 渲染在布局的 `<RouterView />` 里；`meta` 是路由的"自定义备注字段"，面包屑、页签、占位页标题都从这里读。
- **数据驱动菜单**：菜单模板只写一遍（el-sub-menu / el-menu-item 二选一），内容来自 `menuConfig`——从写死到配置化是"权限化菜单"的过渡形态。
- **职责分离验证**：布局大改而守卫零改动，说明鉴权逻辑放对了层。

## 踩坑记录

- **`Index.vue` 被 ESLint 判 `vue/multi-word-component-names` 错**：组件名取自文件名，`Index` 是单词即违规。改名 `AdminLayout.vue` 并同步路由引用后通过。规则本意是避免与（未来的）原生 HTML 标签撞名，命名组件时直接用多词（如 `XxxLayout` / `XxxView`）最省事。

---

# Part 8 · 品牌管理（第一个 CRUD 业务页）

## 目标

1. 经典 CRUD 三板斧：**分页列表 + 新增/编辑对话框 + 删除二次确认**——建立的"模子"后续所有业务页复用。
2. 跑通"增删改查 → 刷新列表"的单一数据流。
3. 学习 el-table 作用域插槽、el-pagination 双向绑定、el-form 校验、el-popconfirm 二次确认。

## 接口侦察（动手前先探明契约）

沿用 Part 5 规矩：先写探针脚本实测，再写代码。四接口全确认：

| 接口 | 方法/路径 | 请求体 | 返回 |
|---|---|---|---|
| 分页列表 | `GET /admin/product/baseTrademark/{page}/{limit}` | — | `data: { records, total, size, current, pages }` |
| 新增 | `POST /admin/product/baseTrademark/save` | `{ tmName, logoUrl }` | `data: null` |
| 修改 | `PUT /admin/product/baseTrademark/update` | `{ id, tmName, logoUrl }` | `data: null` |
| 删除 | `DELETE /admin/product/baseTrademark/remove/{id}` | — | `data: null` |

记录字段：`id` / `tmName` / `logoUrl` / `createTime` / `updateTime`。**关键发现**：`logoUrl` 是相对路径（如 `/api/static/img/sph/...`），前端显示时需拼 baseURL——这是“绝对地址”列显示破损图的根源。

## 操作过程

1. 新建 `src/api/trademark.ts`：`Trademark`（id 可选——新增时没有）/ `TrademarkListData` 接口 + 三个请求函数；新增/修改共用 `reqAddOrUpdateTrademark`（看有没有 `id` 分流，教程同款写法）。
2. 新建 `src/views/product/TrademarkView.vue`（首个业务页面组件）：列表区（el-table + el-pagination + loading）、对话框区（el-form + rules 校验）、删除区（el-popconfirm）；LOGO 列用 `toFullUrl` 拼接 + `el-image` 预览。
3. `src/router/index.ts` 改一行：trademark 路由指向新组件，其余 children 不动。

## 原理与决策

- **CRUD 单一数据流**：增/删/改成功后都调同一个 `loadList()`——列表永远从服务器重新拉，不信任本地拼接，数据永远不会“漂”。
- **el-pagination 双向绑定**：`v-model:current-page="page"` + `v-model:page-size="limit"` 两个双向绑定；切页/切条数触发 `@current-change` / `@size-change` 事件回调里重新加载。
- **el-table 作用域插槽**：`<template #default="{ row }">` 里拿当前行数据，每行一套按钮；`prop` 列直接读字段，插槽列自己控制渲染。
- **el-popconfirm 的 `#reference` 插槽**：不写它就不知道点哪儿弹确认框——这是和普通 prop 最大的区别。
- **对话框复用**：同一个 form + dialog，有 `id` 是编辑模式（标题/提示语区分），没有是新增；`onEdit` 逐字段复制到 form（不直接传 row 引用，避免表单编辑直接污染列表）。
- **删除的“回退页”细节**：当前页只剩一条且不在第一页时，删除后 `page-1` 再拉，否则会请求一个空页。
- **表单校验的坑位对齐**：`el-form-item` 的 `prop` 必须跟 `rules` 的 key 完全一致，校验才会挂到对应输入框上。

## 踩坑记录

本 Part 一次通过，未踩坑。遇到的两个认知点已另记：模板字符串拼接口路径 → 附录 A.12；`#reference` 插槽语义 → 任务书/代码注释。

---

# Part 9 · 品牌 LOGO 图片上传

## 目标

1. 把品牌管理的 LOGO 字段从 el-input（手动填 URL）换成 **el-upload 真实图片上传**——了结 Part 8 留的尾巴。
2. 上传成功自动回填 `form.logoUrl`，列表 LOGO 列显示上传后的图片。
3. 学习 el-upload 自定义上传 + 单图预览模式。

## 接口侦察

沿用惯例，动手前先用探针脚本实测上传接口。五个候选路径中只有 `/admin/product/fileUpload` 返回 200 + 正确 body，其余全返回 `code: 209 "请求路径不存在"`：

| 接口 | 方法/路径 | 请求体 | 返回 |
|---|---|---|---|
| 图片上传 | `POST /admin/product/fileUpload` | `multipart/form-data`，字段名 `file` | `data: "/api/static/img/sph/YYYYMMDD/文件名"` |

**关键发现**：返回的 `data` 是带 `/api` 前缀的相对路径（如 `/api/static/img/sph/...`），但实际可访问的静态资源路径是 `/static/img/sph/...`（不带 `/api`）——这是图片加载失败的根本原因（详见踩坑记录）。

## 操作过程

1. `src/api/trademark.ts` 追加 `reqUploadImage(file)`：用 FormData 组装 multipart 请求，调 `request.post`，**不手写 Content-Type**（axios 检测到 FormData 会自动设并加 boundary）。
2. `src/views/product/TrademarkView.vue`：
   - 对话框里 `LOGO URL` 的 el-input 替换为 el-upload（`show-file-list=false`、`before-upload` 校验、`http-request` 自定义上传）。
   - 上传区内有图时显示 `el-image` 预览，无图时显示 `<Plus />` 加号图标。
   - `beforeUpload` 校验图片类型 + 5MB 限制。
   - `handleUpload` 调 `reqUploadImage`，成功后把返回路径回填 `form.logoUrl`。
   - **修复 `toFullUrl`**：自动去掉 `/api` 前缀（`/api/static/...` → `/static/...`），拼 baseURL 后才是可访问地址。

## 原理与决策

- **el-upload 自定义上传（`:http-request`）**：覆盖默认 axios 行为，走我们自己的 `request` 实例（自动带 token 头、统一错误处理）。`action` prop 传空即可——实际请求由回调函数发出。
- **FormData + axios 不能手写 Content-Type**：axios 检测到 FormData 会自动加 `multipart/form-data; boundary=...`；手写会覆盖掉 `boundary`，后端收不到文件。
- **单图预览模式**：`show-file-list=false` 不显示文件列表；触发元素里用 `v-if/v-else` 切换"已上传预览图"与"加号占位"。
- **api 层聚合**：上传函数放在 `api/trademark.ts`，页面只调业务函数，不直接碰 `request` 实例。

## 踩坑记录

- **图片全部"加载失败"**：后端 logoUrl 存的是 `/api/static/img/...`，但静态文件实际挂在 `/static/img/...`（无 `/api` 前缀）。原 `toFullUrl` 直接拼 baseURL 得到的是不存在的路径，浏览器收到的是 JSON 错误 `code:209` 而非图片。修复：`toFullUrl` 检测到 `/api` 前缀自动去掉。这是"后端存的路径 ≠ 实际可访问路径"的典型坑。
- **`handleUpload` 缺闭合 `}`**：粘贴代码时漏了函数右花括号，导致后续 `onMounted(loadList)` 被吞进函数体，Vite 解析 500。补上 `}` 后恢复。

---

# Part 10 · 平台属性管理（三级联动 + 嵌套 CRUD）

## 目标

1. **三级分类联动**：选一级 → 加载二级 → 选二级 → 加载三级 → 选三级 → 加载属性列表；切换上级时清空所有下级与表格。
2. **嵌套 CRUD**：属性行内属性值用 `el-tag` 展示；对话框里属性值列表可动态增删（输入 + 回车/按钮添加）。
3. **整存整取**：保存时一次性提交属性名 + 全部属性值（后端全量替换），这是与品牌管理（单表单）最大的差异。

## 接口侦察

这 Part 接口多，侦察花了四轮探针：

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| 一级分类 | `GET /admin/product/getCategory1` | `data: [{id, name}]` |
| 二级分类 | `GET /admin/product/getCategory2/{c1id}` | 同上 |
| 三级分类 | `GET /admin/product/getCategory3/{c2id}` | 同上 |
| 属性列表 | `GET /admin/product/attrInfoList/{c1}/{c2}/{c3}` | **无分页**，一次全返回 |
| 保存属性 | `POST /admin/product/saveAttrInfo` | `{categoryId, categoryLevel:3, attrName, attrValueList:[{valueName}]}` |
| 删除属性 | `DELETE /admin/product/deleteAttr/{id}` | — |

侦察中的弯路：属性列表接口试了 5 个候选路径才找到 `attrInfoList`；保存接口第一版探针带 `category1Id/2/3Id` 三字段返回 201，去掉冗余只留 `categoryId + categoryLevel` 后成功——**探针契约要最小化，多余字段反而干扰判断**。

## 操作过程

1. 新建 `src/api/attr.ts`：`Category` / `AttrValue` / `Attr` 三个接口类型 + 六个请求函数。
2. 新建 `src/views/product/AttrView.vue`：三级联动（三个 `el-select`，`onC1Change` 清空 2/3 级 + 表格、`onC2Change` 清空 3 级 + 表格）→ 属性表格（`el-tag` 列属性值）→ 对话框（属性名 + 属性值动态列表）→ 删除二次确认。
3. 路由 `product/attr` 从占位页换成 `AttrView.vue`。

## 原理与决策

- **级联清空顺序**：`onC1Change` 里先 `c2/c3 = undefined`、`cat2List/cat3List/attrs = []` 再请求二级——切上级时下级数据"跟着失效"，不清空会显示与所选不符的旧数据。
- **深拷贝属性值**：`onEdit` 里 `row.attrValueList.map(v => ({...v}))`——直接引用 row 的话，在对话框里改输入框会**实时污染表格里的原数据**（取消也回不去）。
- **整存整取**：保存请求体永远带完整 `attrValueList`，新增的值没有 id，编辑保留的值有 id，后端全量覆盖。前端不做"逐个增删"的 diff。
- **`attrValues` 独立 ref 指向 `form.attrValueList` 同一数组**：模板 `v-for="(v, idx) in attrValues"` 绑定更直观，`v.valueName` 的 v-model 直接改的就是 form 里的对象。
- **未选三级时"添加属性"禁用**（`:disabled="!c3"`）：属性挂在三级分类上，没有 c3 就没有 `categoryId` 可提交。
- **校验双保险**：el-form rules 管 `attrName` 非空；`attrValues.length === 0` 手动拦截（rules 管不到数组长度）。

## 踩坑记录

本 Part 功能一次跑通（联动/CRUD/校验全过），但有一个值得展开的认知点：

- **普通 `<script>` 块 import 的图标能否被模板使用**：`AttrView.vue` 底部有个普通 `<script lang="ts">` 块（`import { Delete } from '@element-plus/icons-vue'`），模板里 `:icon="Delete"` 引用它。直觉上可疑（import 不在 `<script setup>` 里），但 lint/type-check/build 全过。用 `@vue/compiler-sfc` 编译产物验证：模板里的 `Delete` 被编译为**模块作用域的直接引用**（而非 `_ctx.Delete`）——普通 script 的 import 会纳入绑定分析，render 函数通过闭包访问。结论：**共存 script 的 import 对模板可见**，但要省心还是优先写进 `<script setup>`（绝大多数场景的标准做法）。
- **`:icon="Delete"` 需要组件对象而非字符串**：与 Part 7 菜单的 `<component :is="item.icon">`（字符串走全局注册）是两条路——`:icon` prop 收的是组件对象引用，必须 import；字符串只在全局注册 + 动态组件场景下生效。

## 与品牌管理（Part 8）的模子差异

| 维度 | 品牌管理 | 平台属性 |
|---|---|---|
| 列表 | 分页（page/limit） | 无分页（三级分类确定后全量） |
| 入口 | 直接进页面就能看 | 必须先选完三级分类 |
| 表单字段 | 扁平（tmName/logoUrl） | 嵌套（attrName + attrValueList 数组） |
| 保存 | 单条记录字段 | 属性值整存整取（全量替换） |
| 编辑回显 | 拷贝字段即可 | 属性值数组要逐项深拷贝 |

---

# Part 11 · SPU 列表展示与三级分类公共组件抽取

## 目标

1. **组件抽取**：把 `AttrView.vue` 里的三级分类联动逻辑抽成公共组件 `src/components/CategorySelector.vue`，通过 `emit('change', c1, c2, c3)` 通知父组件（实战附录 A.6 的 props/emit 模式）。
2. **SPU 列表页**：三级分类选齐 → 加载 SPU 分页列表，每行展示 spuName / description / 操作按钮（添加图片、编辑、删除）。
3. 本 Part 只做**列表展示**，SPU 的增删改查留 Part 12。

## 接口侦察

SPU 列表接口路径靠穷举命中（swagger 不可用）：

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| SPU 分页列表 | `GET /admin/product/spu/list?page=&size=&category3Id=` | query 参数；返回 `PageResult<SpuItem>` |

`SpuItem` 字段：`id` / `spuName` / `description` / `category3Id` / `tmId`。

保存/修改接口（`/admin/product/saveSpuInfo`）探测到返回 205（服务端异常），留 Part 12 细探。

## 操作过程

1. 新建 `src/components/CategorySelector.vue`：把 AttrView 原有的三级联动逻辑（`c1/c2/c3` ref、`cat1List/cat2List/cat3List`、`loadCat1/onC1Change/onC2Change/onC3Change`、`onMounted(loadCat1)`）原样搬入；三处 `emit('change', ...)` 在选级变化时广播当前三级状态。
2. 重构 `src/views/product/AttrView.vue`：删除全部三级联动代码（约 52 行），改引 `<CategorySelector @change="onCategoryChange" />`；`onCategoryChange` 回调接收三个参数同步到本地 ref，三级选齐才 `loadAttrs()`。
3. 新建 `src/api/spu.ts`：`SpuItem` / `PageResult<T>` 类型 + `reqSpuList(page, size, category3Id)` 函数（query string 拼接）。
4. 新建 `src/views/product/SpuView.vue`：复用 `<CategorySelector>`，`onCategoryChange` 只关心 `c3` 参数（SPU 列表只依赖三级分类 ID）；`el-table` + `el-pagination` 展示列表；添加/编辑/删除按钮先用 `ElMessage.info` 占位。
5. `src/router/index.ts`：spu 路由从 `PlaceholderView.vue` 换成 `SpuView.vue`。

## 原理与决策

1. **为什么抽公共组件**：属性页和 SPU 页共享完全相同的三级联动逻辑（约 50 行），复制粘贴 = 改一处漏一处。抽出后逻辑只维护一份，父组件通过 `@change` 各自决定收到通知后做什么。
2. **emit 参数设计**：三个参数 `(c1, c2, c3)` 全量传出，父组件按需取用（AttrView 三个都用，SpuView 只用 c3）。选级变化时未选的层级传 `undefined`，父组件据此判断"选齐没有"。
3. **父子 c1/c2/c3 是两套独立数据**：子组件的 ref 是私有的，父组件拿不到；靠 emit 把值"抄"过来同步。这正是单向数据流：子不直接改父的数据，只广播事件。
4. **`PageResult<T>` 泛型**：SPU 分页返回结构与品牌管理（Part 8）相同，抽成泛型后续 SKU/用户管理等分页接口复用。
5. **SPU 操作按钮占位**：`onAdd/onEdit/onDelete` 只弹 info 提示——Part 12 才接真实接口，避免这 Part 信息量过载。

## 踩坑记录

- **SPU 接口路径难找**：swagger 远程不可用，穷举了近 30 个候选路径才命中 `/admin/product/spu/list?page=&size=&category3Id=`。规律：该后端 SPU 用 query 参数而非路径参数（与品牌管理的 `/baseTrademark/{page}/{limit}` 路径参数风格不同），同一项目内接口风格并不统一，每次都得实测。

---

# Part 12 · SPU 管理 CRUD（完整表单与 205 契约破案）

> 本 Part 分两阶段：09-15 先做基础 CRUD（save/update 报 205，当时误记为后端 bug）；09-16 借 swagger 文档 + 实测矩阵破解 205 真相，表单升级为完整版。本节按最终结论重写。

## 目标

1. 把 Part 11 三个占位按钮（添加/编辑/删除）接上真实接口，完成 SPU 的完整 CRUD 闭环。
2. 对话框表单完整版：spuName（必填）、品牌下拉 tmId（必填）、description（选填）、**图片上传区（至少 1 张）**、**销售属性编辑区（至少 1 个属性且带值）**。
3. 删除后智能回退页（复用 Part 8 模式）。

## 接口侦察

save/update 路径靠穷举命中，delete 一次命中：

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| 保存 | `POST /admin/product/saveSpuInfo` | 契约见下方破案记录 |
| 修改 | `POST /admin/product/updateSpuInfo` | 在保存契约之上再加一层要求 |
| 删除 | `DELETE /admin/product/deleteSpu/{id}` | 实测可用 |
| 品牌列表 | `GET /admin/product/baseTrademark/1/100` | 复用已有接口 |
| 基础销售属性 | `GET /admin/product/baseSaleAttrList` | 颜色/版本/尺码字典 |
| SPU 图片列表 | `GET /admin/product/spuImageList/{spuId}` | 编辑回显用 |
| SPU 销售属性 | `GET /admin/product/spuSaleAttrList/{spuId}` | 编辑回显用 |

## 205 破案记录（本 Part 最大收获）

第一阶段 save/update 实测均返回 `code: 205 "服务繁忙"`，当时记为"服务端内部异常，前端无解"。第二阶段推翻了这个结论——真相是**请求体契约不完整**。

实测矩阵（创建后即删，不污染数据）：

| 请求体 | 结果 |
|---|---|
| 裸 body（只有 spuName/description/category3Id/tmId） | ❌ 205 |
| + 两个空数组 `spuImageList:[], spuSaleAttrList:[]` | ❌ 205 |
| + 仅图片 1 张 | ❌ 205 |
| + 仅销售属性 1 个（含值） | ❌ 205 |
| + 图片 1 张 + 销售属性 1 个（含值） | ✅ 200 落库 |

**save 契约**：`spuImageList` 与 `spuSaleAttrList` 必须双双非空，只带其一照样 205。与 `saveAttrInfo` 要求非空 `attrValueList`（Part 10）是同一类坑。

**update 契约**还叠了第三层：每个销售属性必须带**非空的** `spuSaleAttrValueList`——

| update 请求体来源 | 结果 |
|---|---|
| 列表接口返回的数据原样回传 | ❌ 205（列表里两个子数组是 null） |
| `spuSaleAttrList/{id}` 接口拉回的数据 | ❌ 205（拉回的值列表是 null） |
| 手工组装完整嵌套结构（含值列表） | ✅ 200 |

**后端半残行为**：无论 save 还是 update，提交的销售属性值都不落库（拉回恒为 null；update 是先删后插重建属性子表，属性 id 会变，值还是不插）。预置数据（华为 SPU 的蓝/黑两色）是直接灌库的。后果：前端新建的 SPU 在 SKU 添加表单里拉不到属性值、生成不了笛卡尔积——前端无解，属后端缺陷。图片倒是正常落库可拉回。

## 操作过程

第一阶段（09-15）：
1. `src/api/spu.ts` 追加 `reqSaveSpu` / `reqUpdateSpu` / `reqDeleteSpu` / `reqBrandList`。
2. `SpuView.vue` 基础版：三字段表单（spuName/品牌/描述）、按 id 分流提交、智能回退页。
3. 用户改进：`SpuItem.tmId` 改可选，`form.tmId` 用 `undefined` 代替 `0`。

第二阶段（09-16，破案后表单升级）：
4. `api/spu.ts` 新增提交契约类型 `SpuImage` / `SpuSaleAttrValue` / `SpuSaleAttr` / `SaveSpuPayload` + `reqBaseSaleAttrList`；save/update 函数参数换为 `SaveSpuPayload`。
5. `SpuView.vue` 表单升级（186 → 302 行）：图片上传区（复用 Part 9 自定义上传模式）、销售属性编辑区（基础属性下拉 + 回车加值，Part 10 属性值模子的变体）、提交前三条前置拦截、编辑回显 `Promise.all` 并行拉两个子资源接口拼装。
6. 端到端实测：与新表单 payload 完全同构的探针走 save → update → delete 全 200，探测数据已清理。

## 原理与决策

1. **新增/编辑共用对话框**：`form.id` 有值 = 编辑，无值 = 新增，提交时按 id 分流。
2. **新增时排除 id 字段**：`const { id: _, ...data } = form; void _` 剔除 id 并消费变量。
3. **`tmId` 用 `undefined` 而非 `0`**：`0` 会被 el-select 当作已选择、骗过 required 校验。
4. **前置拦截优先于提交**：三条拦截（无图/无属性/属性无值）把后端 205 翻译成用户能懂的提示，避免发了请求才收到"服务繁忙"。
5. **编辑回显不信任列表数据**：列表接口的子数组是 null，编辑时必须现拉 `spuImageList` + `spuSaleAttrList` 拼装；拉回值列表为 null 时置空数组让用户重填（后端不落值的缺陷，前端补不了）。
6. **提交前显式映射**：表单状态直接按 `SaveSpuPayload` 契约 shape 定义，但提交时仍 `.map()` 一遍白名单字段，防止未来表单加字段时把 UI 态漏进请求体。
7. **删除智能回退页**：同 Part 8。

## 踩坑记录

- **ESLint `no-unused-vars`**：`const { id: _unused, ...data } = form` 被判未使用，改 `const { id: _, ...data }; void _` 消费。
- **TS 严格索引检查**：`form.spuSaleAttrList[attrIdx].xxx` 按下标取值可能为 undefined，函数入口 `const attr = ...; if (!attr) return` 收窄。
- **"205 = 后端 bug"的误判持续了两天**：教训一：**业务码错误先做请求体组合的实测矩阵，再下结论**，本案正是靠矩阵（仅图/仅属性/双全）锁定非空约束的。教训二：**swagger 的 required 列表为空 ≠ 字段可缺省**——这种隐性非空约束文档查不出来，只能实测。教训三（反向）：文档字段定义里挂着 `spuImageList`/`spuSaleAttrList`，保存时却只传基础字段，这本身就是可疑信号，契约应该以"文档字段全集 + 实测验证"为准。

---

# Part 13 · SKU 管理（笛卡尔积生成 + SPU 子资源联动）

## 目标

1. **选 SPU 入口**：三级分类选齐 → 加载该分类下 SPU 列表 → 下拉选一个 SPU。
2. **SPU 子资源展示**：选中 SPU 后并行拉取销售属性（tag 展示）和图片列表（缩略图 + 预览）。
3. **SKU 列表 + 删除**：分页表格展示该 SPU 下所有 SKU，删除带二次确认和智能回退页。
4. **添加 SKU**：按销售属性笛卡尔积生成草稿行（预填 skuName / 默认图），填价格后逐条提交。
5. **上架 / 下架**（09-16 补充）：状态列（el-tag）+ 一键切换按钮，调 `onSale`/`cancelSale` 接口。

## 接口侦察

穷举命中四个接口，SKU 列表用路径参数 + query 混合：

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| SKU 分页列表 | `GET /admin/product/list/{page}/{limit}?spuId=` | 空库时返回空 records |
| SPU 销售属性 | `GET /admin/product/spuSaleAttrList/{spuId}` | `[{id, baseSaleAttrId, saleAttrName, spuSaleAttrValueList}]` |
| SPU 图片列表 | `GET /admin/product/spuImageList/{spuId}` | `[{id, imgName, imgUrl}]` |
| 基础销售属性 | `GET /admin/product/baseSaleAttrList` | `[{id, name}]`（颜色/版本/尺码） |
| 保存 SKU | `POST /admin/product/saveSkuInfo` | 字符串契约（见下） |
| 删除 SKU | `DELETE /admin/product/deleteSku/{id}` | 实测可用 |
| 上架 SKU | `GET /admin/product/onSale/{skuId}` | `isSale` 0 → 1 |
| 下架 SKU | `GET /admin/product/cancelSale/{skuId}` | `isSale` 1 → 0 |

> 上架/下架补充时已是 swagger 文档时代：两接口从 `GET /swagger/doc.json` 直接查到，不再穷举（文档里下架叫 `cancelSale`，不是 `offSale`）。

## 操作过程

1. 新建 `src/api/sku.ts`：`SkuItem` / `SaveSkuPayload` / `SpuSaleAttr` / `SpuImage` 类型 + 六个请求函数。
2. 新建 `src/views/product/SkuView.vue`（350 行，项目最大页面）：三级分类 + SPU 下拉两层联动、`Promise.all` 并行拉销售属性和图片、笛卡尔积生成草稿、逐条提交。
3. `src/router/index.ts`：sku 路由从占位页换成 `SkuView.vue`。
4. （09-16 补充）`api/sku.ts` 加 `reqOnSale`/`reqCancelSale`；`SkuView.vue` 表格加状态列（el-tag 已上架/未上架），操作列按 `row.isSale` 切换显示上架/下架按钮。

## 原理与决策

1. **笛卡尔积工具函数**：`reduce + flatMap` 两层展开——两个属性各 N/M 个值就生成 N×M 行草稿，每行预拼 skuName（如“vivo 蓝色 128G”）。
2. **`Promise.all` 并行加载**：销售属性和图片互不依赖，并行请求省一半等待时间。
3. **价格单位是分**：后端存分（999 = ¥9.99），列表展示时 `/100` 格式化。
4. **`SpuSaleAttr.id` 是 string**：后端以字符串返回雪花 ID（防 JS 大数精度丢失），保存 SKU 时原样透传给 `saleAttrId`。
5. **草稿结构分层**：页面私有 `SkuDraft`（编辑态）与后端契约 `SaveSkuPayload`（提交态）分离，提交时才映射——避免编辑结构被后端契约绑架。
6. **用 GET 做状态变更**：上架/下架是 `GET /onSale/{skuId}`、`GET /cancelSale/{skuId}`——按 HTTP 语义本应是 POST/PUT，这是该后端的怪设计（无请求体的动作全用 GET），前端照文档实现即可。实测闭环：onSale 把 `isSale` 从 0 改 1，cancelSale 改回 0。
7. **低风险操作不二次确认**：删除不可逆所以带 el-popconfirm；上架/下架可逆（再点一次就切回来），直接执行，按钮 loading 防连点，错误提示交给响应拦截器统一弹。

## 踩坑记录

- **saveSkuInfo 的 205 真相（本 Part 最大收获）**：初探时按任务书 number 类型提交返回 205“服务繁忙”，一度当成后端 bug。实际是**契约格式问题**：Go 后端用 `strconv` 按字符串解析数字字段，JSON number 会被读成空串 → 解析失败 → 205。修复：`price/spuID/category3Id/tmId/weight` 全部 `String()` 转字符串，`spuID` 键名大写 ID，`saleAttrId` 用销售属性 id 而非 `baseSaleAttrId`，`skuImageList` 每项带 `spuImgId`。修复后实测落库成功（库里现有一条“华为 银色”）。
- **`skuDefaultImg` 为空触发 205**：无图片的 SPU 生成草稿会在提交时炸，`generateDrafts` 里前置拦截并提示“请先在 SPU 管理中上传图片”。
- **Part 12 的 SPU 205 已验证不是同根因**：字符串契约修正无效，真正根因是嵌套数组必须非空（双列表非空 + 值列表非空三层契约），详见 Part 12 重写后的 205 破案记录。
- **`SkuItem.spuId` 键名笔误（09-16 补充时顺手修正）**：列表接口实际返回 `spuID`（大写 ID，与 saveSkuInfo 请求体一致），此前类型里写的小写 `spuId`——因无消费方从未暴露。教训：类型定义与后端实际响应对不上时，只要没人读那个字段就不会报错，接触该接口时顺手核对一遍键名。

---

# Part 14 · 用户管理（ACL 三件套之一）

## 目标

1. CRUD 模子第五次复用：用户列表（**username 模糊搜索 + 分页**）+ 新增/编辑对话框 + 删除二次确认。
2. 新交互：**分配角色抽屉**（el-drawer + el-checkbox-group）——调回显接口勾选已有角色，保存时全量提交。
3. ACL 三件套开工（用户/角色/菜单），本 Part 是其中最基础的用户管理。

## 接口侦察（swagger 文档时代的第二次实战）

ACL 模块 19 个接口从 `GET /swagger/doc.json` **一次查全**（对照 Part 11~13 时穷举探针的惨痛，文档化侦察的效率是碾压级的）。请求体定义有窝小坑：`$ref` 引用 `model.ParamRoleSave`，但 definitions 的 key 带前缀 `model.ParamRoleSave`，直接按 ref 名查会 NOT FOUND，需要拼前缀或全局搜。

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| 用户列表 | `GET /admin/acl/user/{page}/{limit}?username=` | username 可选搜索词 |
| 新增用户 | `POST /admin/acl/user/save` | `{username, name, password}` 三字段全必填 |
| 修改用户 | `PUT /admin/acl/user/update` | `{id, username, name}`——**契约里没有 password** |
| 删除用户 | `DELETE /admin/acl/user/remove/{id}` | — |
| 角色回显 | `GET /admin/acl/user/toAssign/{adminId}` | `data: {assignRoles(已选), allRolesList(全量)}` |
| 分配角色 | `POST /admin/acl/user/doAssignRole` | `{userId, roleIdList}` 全量覆盖式 |

实测数据要点：用户记录含 `id / username / name / phone / roleName / createTime`（password 是哈希不展示）；列表的 `roleName` 是后端拼好的字符串，分配角色后**必须刷新列表**才能看到变化。

## 操作过程

1. 新建 `src/api/acl.ts`：UserItem / RoleItem / ToAssignData 类型 + 六个请求函数。首次用到 **GET query 参数**的 axios 写法：`request.get(url, { params: { username } })`（对照品牌管理的路径参数风格，同一后端两种参数风格并存）。
2. 新建 `src/views/acl/UserView.vue`：搜索区（回车/按钮查询、clearable 清空重置）→ 表格 → 分页 → 对话框（isEdit 区分新增/编辑）→ 分配角色抽屉。
3. `src/router/index.ts`：`acl/user` 从占位页换成 `UserView.vue`。

## 原理与决策

1. **el-drawer vs el-dialog 的场景分工**：对话框适合“填表单”（阻断式、居中、有确定语义）；抽屉适合“查看 + 勾选”类轻操作（侧滑不打断列表上下文，关闭即走）。分配角色是典型抽屉场景。
2. **el-checkbox-group 数组绑定**：`v-model` 绑 `selectedRoleIds: number[]`，每个 el-checkbox 的 `:value="role.id"`——勾谁就把谁的 id push 进数组，提交时整个数组就是答案。对照 el-radio 的单选语义，这是多选的标准范式。注意 Element Plus 2.6+ 用 `:value`，旧版叫 `:label`（本项目 2.14 用 `:value` 一次过）。
3. **覆盖式提交**：doAssignRole 不做 diff，前端只发“当前全部选中项”（空数组 = 清空角色）。增删全靠后端自己对比新旧集合——前端状态管理大幅简化，代价是提交体稍大（可忽略）。
4. **编辑表单按后端契约裁剪字段**：update 契约没有 password，编辑对话框就**不显示密码框**（v-if="!isEdit"）——不做“改密码”功能，宁可少做也不造后端不支持的假象。
5. **搜索后回第一页**：`onSearch` 里 `page.value = 1`。否则停在第 3 页时搜索，可能落在不存在的页码上看到空列表。

## 踩坑记录

本 Part 一次通过，未踩坑。验收时做了端到端闭环实测（建 `_probe_user_` → 分配“测试”角色 → 改昵称 → 删除全 200，roleName 分配后正确变“测试”），数据已清理。任务书预判的两个隐患都没触发：el-checkbox `:value` 写法直接通过（Element Plus 2.14 是新版）；GET query 的 `params` 写法也一次过。文档 `$ref` 带 `model.` 前缀的坑见接口侦察节——这是 swaggo 生成的特点，查 definitions 时要么拼前缀要么全文搜。

---

# Part 15 · 角色管理（ACL 三件套之二）

## 目标

1. 角色列表（roleName 搜索 + 分页）+ 新增/编辑对话框 + 删除二次确认——CRUD 模子第六次复用。
2. **分配权限抽屉（el-tree 树形控件 + 复选框）**：项目最后一个重量级 Element 组件，踩通 doAssign 的四个怪契约。
3. ACL 三件套的中间环节——角色层做完，Part 16 的菜单管理 + 动态路由就有基础。

## 接口侦察（临时 probe 角色做实验，测完即删）

### doAssign 实测矩阵（本 Part 最大收获）

| 实验 | 结果 | 解读 |
|---|---|---|
| assign 8 → assign 9 | 8 变 false，9 变 true | **整体替换式**：每次调用覆盖全部权限，非累加 |
| `permissionId=8,9`（逗号） | ✅ 两个都生效 | Go 切片绑定支持逗号分隔 |
| `permissionId=8&permissionId=9`（重复 key） | ❌ 只取第一个 | axios params 默认序列化就是这种，**不能用来传数组** |
| 传父节点 7 | 只存 7 本身，子节点不级联 | 保存必须传“勾选+半选”完整集合 |
| `permissionId=`（空串） | 201 参数错误 | 空集合不能提交，前端要前置拦截 |

### 完整接口表

| 接口 | 方法/路径 | 说明 |
|---|---|---|
| 角色列表 | `GET /admin/acl/role/{page}/{limit}?roleName=` | roleName 可选搜索词 |
| 新增角色 | `POST /admin/acl/role/save` | `{roleName, remark}` |
| 修改角色 | `PUT /admin/acl/role/update` | `{id, roleName, remark}` |
| 删除角色 | `DELETE /admin/acl/role/remove/{id}` | — |
| 权限树回显 | `GET /admin/acl/permission/toAssign/{roleId}` | 63 节点 4 层树，每节点带 `select` |
| 分配权限 | `POST /admin/acl/permission/doAssign?roleId=&permissionId=` | 逗号分隔批量，整体替换式 |

admin 角色的权限树 63 节点全 true，存储级联一致（父 true 时子也全 true）——回显时把所有 select=true 的 id 直接 set 进去，el-tree 自己算父子级联显示。

## 操作过程

1. `src/api/acl.ts` 追加角色管理四个函数（复用已有的 PageData / RoleItem）+ `MenuNode` 类型 + `reqToAssignMenu` + `reqDoAssignPermission`（手动拼 URL 逗号串，注释说明了 axios params 数组序列化陷阱）。
2. 新建 `src/views/acl/RoleView.vue`：列表+搜索+对话框+删除（CRUD 模子六次复用）+ 分配权限抽屉（el-tree 五配置 + setCheckedKeys 时序 + getCheckedKeys+getHalfCheckedKeys 合并）。
3. `src/router/index.ts`：`acl/role` 从占位页换成 `RoleView.vue`。

## 原理与决策

1. **el-tree 五配置（缺一不可）**：`node-key="id"` 必设（勾选状态靠它记录身份）；`:props="{label:'name',children:'children'}"` 字段映射；`show-checkbox` 复选框模式；`default-expand-all` 4 层深必须全展开才看到叶子；`:data` 接树形数据。
2. **半选父节点必须合并提交**（权限树保存的头号经典坑）：`getCheckedKeys()` 只返回完全勾选的节点，**半选状态的父节点在 `getHalfCheckedKeys()` 里**。漏掉后者保存后父菜单就丢了——下次打开抽屉时父节点变未勾选，虽然子节点还在，但父的权限（如“权限管理”菜单的进入资格）会丢。提交集合 = `checked + halfChecked`，后端整体替换式存储，下次回显级联一致。
3. **setCheckedKeys 比 default-checked-keys 更可控**：`default-checked-keys` 动态改在某些 Element Plus 版本下不生效；用 `nextTick` 后调 `treeRef.value?.setCheckedKeys(...)` 是稳的。打开抽屉时先 `menuTree.value = []` 再赋新值——data 重建后树的状态自然归零，避免上次残留。
4. **整体替换式保存**：doAssign 是“先删后插”语义，前端只发“当前应拥有的完整集合”（含勾选+半选），不做 diff。代价是空集合提交报 201（后端不允许清空），UI 要做前置拦截“请至少勾选一个权限节点”。
5. **手动拼 URL 传逗号参数**：axios params 传数组默认序列化成 `permissionId[]=8&permissionId[]=9`（带方括号），Go 不认。改用 `request.post(`/doAssign?roleId=${rid}&permissionId=${ids.join(',')}`)` 手动拼 URL，直接对齐侦察时实测成功的格式。

## 踩坑记录

本 Part 一次通过，未踩坑。验收时做了端到端闭环（建 `_probe_role_` → doAssign 8,9,11,12 逗号批量 → toAssign 验证四个都 true、父节点 7/1 保持 false 符合预期 → DELETE 清理）。任务书预判的三个隐患全部未触发：setCheckedKeys 时序、半选父节点合并、空集合拦截——代码里直接按设计写了，无需回退。

重点记一笔：**半选父节点丢失**是后台权限树保存的“教科书级经典坑”，本项目用 getCheckedKeys + getHalfCheckedKeys 合并绕开，这个坑的根因是 el-tree 的半选状态和勾选状态存在两个不同集合里——前端必须自己合起来才能表达“完整拥有的节点集合”。这个坑在硅谷甄选原版 Java 教程里也是必踩项，本次用 Go 后端绕开但逻辑一致。

---

# 附录 · Vue 概念补充（持续累积）

> 本部分不占用 Part 序号，作为**持续累积的 Vue 概念笔记始终置于整篇最后**：开发中遇到新概念就往这里追加一小节。日后新增的开发阶段 Part 都插在本附录**之前**，确保它永远是末章。

## 目录

- [A.1 生命周期 onMounted](#a1-生命周期-onmounted)
- [A.2 axios 完整请求流程与拦截器](#a2-axios-完整请求流程与拦截器)
- [A.3 Pinia 两种写法与 setup 风格为何是箭头函数](#a3-pinia-两种写法与-setup-风格为何是箭头函数)
- [A.4 空值合并运算符与问号家族](#a4-空值合并运算符与问号家族)
- [A.5 v-bind 单向传值与 v-model 双向绑定](#a5-v-bind-单向传值与-v-model-双向绑定)
- [A.6 父子组件通信（props 与 emit）](#a6-父子组件通信props-与-emit)
- [A.7 组件外使用 Pinia 的时机](#a7-组件外使用-pinia-的时机)
- [A.8 模块引入路径：裸模块名、别名与相对路径](#a8-模块引入路径裸模块名别名与相对路径)
- [A.9 Element Plus 菜单的 index 与 Vue 的 key 之辨](#a9-element-plus-菜单的-index-与-vue-的-key-之辨)
- [A.10 具名插槽与作用域插槽](#a10-具名插槽与作用域插槽)
- [A.11 动态组件 `<component :is>`](#a11-动态组件-component-is)
- [A.12 模板字符串与接口路径拼接](#a12-模板字符串与接口路径拼接)

## A.1 生命周期 onMounted

### 概念

`onMounted` 是 Vue 3 组合式 API（Composition API）的**生命周期钩子**：在组件**挂载完成（模板渲染成真实 DOM 并插入页面）之后**，自动执行你传进去的回调函数一次。相当于 Vue 2 选项式 API 里的 `mounted`。

```ts
import { onMounted } from 'vue'

onMounted(() => {
  // 组件已经在页面上了，这里做初始化
})
```

### 触发时机

组件从创建到显示的顺序：

```
执行 setup / 组件逻辑 → 生成真实 DOM → 插入页面(挂载) → onMounted 触发 → 更新 → 卸载
     ↑                                    ↑
  DOM 还不存在                          DOM 已存在
```

- **只在首次挂载时触发一次**；之后数据变化引起的重新渲染**不会**再触发（那是 `onUpdated` 的职责）。
- 可以简单理解为：**模板渲染完、DOM 真正上屏后，自动执行里面的方法**。

### 为什么要等渲染完，而不提前执行

核心原因：**很多操作依赖"真实 DOM 已经存在"，而 DOM 是渲染完成后才生成的**。在 `setup` 顶层提前执行时，DOM 还没生成，`ref` 绑定的元素是 `null`，会扑空报错。

- 不依赖 DOM 的代码（定义数据、计算属性、监听）本来就该写在 `setup` 顶层，越早越好；
- 依赖 DOM 的操作（初始化图表/地图等第三方库、读取元素尺寸）必须放 `onMounted`；
- 请求初始数据虽不强依赖 DOM，但放 `onMounted` 语义清晰（"组件上屏 → 拉数据填充"），且数据回来时页面结构已就绪，衔接顺畅。本项目 Part 4 首页就是这么做的。

类比：`setup` 是买材料画图纸（房子还没盖），挂载是房子盖好，`onMounted` 才是进屋摆家具通水电——房子没盖好没法摆家具。

### 常见用途

1. **请求初始数据**（最常用）：`onMounted(async () => { data.value = await getXxx() })`。
2. **操作 DOM / 初始化依赖真实 DOM 的插件**：echarts、地图、轮播等。
3. **注册全局副作用**：`addEventListener`、定时器等；通常要在 `onUnmounted` 里成对清理，避免内存泄漏。

### 易错点

1. **在 `setup` 顶层直接访问 DOM 拿到 `null`**：此时 DOM 未生成，需挪进 `onMounted`。
2. **误以为每次更新都会触发**：`onMounted` 只跑一次，响应式更新触发的是 `onUpdated`。
3. **副作用只加不清**：`onMounted` 里 `addEventListener`/`setInterval` 不在 `onUnmounted` 清理，组件反复挂载卸载会累积泄漏。
4. **以为路由切换会触发 `onMounted`**：前端路由跳转（`RouterLink` / `router.push`）只替换 `<RouterView />` 里的页面组件，外壳组件（如 `App.vue`）不会卸载重挂，`onMounted` 不会重跑。实际案例（本项目 Part 5 登录联调）：登录成功 `router.push('/')` 后 `App.vue` 不重挂，需显式调用 `fetchUserInfo()` 才能更新右上角用户信息；F5 整页刷新才会走 `onMounted`。正规解法是路由守卫（后续 Part 处理）。

## A.2 axios 完整请求流程与拦截器

### 概念

项目把网络请求封装成**共享的 axios 实例**（`src/utils/request.ts` 里 `axios.create` 出来的 `request`），并在上面挂两个**拦截器**：请求发出前、响应回来后各做一道统一处理。拦截器是**切面**：鉴权头、全局错误提示、拆包都集中在这里，业务代码零侵入。

### 完整请求流程

以页面调用 `getXxx()` 为例，一次请求从发起到拿到数据经历的完整链路：

```
页面/api 层调用 request.get('/xxx')
        ↓
axios 组装出 config（url、method、headers…）
        ↓
请求拦截器(config) → 加 token → return config   ① 还给 axios
        ↓
axios 用这份 config 发出真正的 HTTP 请求
        ↓
后端返回，HTTP 层面完成
        ↓
响应拦截器(response) → 拆包/判业务码 → return body / reject   ②
        ↓
回到页面的 await request.get() → 拿到 body 或进 catch
```

关键：拦截器里的 `return` **不是给你业务代码手动接的，而是交回给 axios 内部**，由它继续往下一环传递。

### 请求拦截器

```ts
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.set('token', token)
  }
  return config   // 必须 return：axios 拿这份（可能被改过的）配置去发请求
})
```

- 作用：每次请求发出**前**自动跑一遍，有 token 就挂到请求头（后端约定放 `token` 头）。
- **为什么必须 `return config`**：这是拦截器的契约——你把加工完的配置还回给 axios，它才知道用哪份配置发请求；不 return（返回 `undefined`）请求就发不出去。

### 响应拦截器（双层判断）

```ts
request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body.code !== 200) {              // 业务错误：HTTP 恒 200，成败看 body.code
      ElMessage.error(body.message || '请求失败')
      return Promise.reject(new Error(body.message))
    }
    return body                           // 成功：拆包后直接返回业务数据
  },
  (error) => {                            // HTTP 错误：超时/断网/4xx/5xx
    ElMessage.error('网络异常，请稍后再试')
    return Promise.reject(error)
  },
)
```

- **两个回调**：第一个处理 HTTP 成功（状态码 2xx），第二个处理 HTTP 失败。
- **双层判断**：即使 HTTP 成功，还要看后端业务码 `body.code`；不是 200 也算失败，统一弹提示并 `reject`。
- `return body` 的去向：往**你的业务代码**方向走，最终变成 `await request.get()` 拿到的东西；`reject` 则让调用处进 `catch`。

### 泛型为什么要写 unknown 占位

api 层常见写法（见 `src/api/user.ts`）：

```ts
request.post<unknown, ResponseBody<string>>('/admin/acl/index/login', data)
//           ↑第1个（用不到）  ↑第2个（真正的返回类型）
```

axios 的 `post`/`get` 泛型签名简化后是：

```ts
post<T = any, R = AxiosResponse<T>, D = any>(url, data?): Promise<R>
//   ↑第1个 T：原始响应 data 类型   ↑第2个 R：Promise 最终 resolve 的类型
```

- 因为响应拦截器**已拆包**（`return body`），`await` 后真正拿到的是**第 2 个泛型 `R`**，所以要设的是它。
- 但 **TS 泛型是按位置的，不能跳过第 1 个只填第 2 个**；想给第 2 个赋值，必须先把第 1 个位置占住。第 1 个确实用不到（已被拆掉），于是拿 `unknown` 当占位符。
- **反例**：只写 `request.post<ResponseBody<string>>(...)` 会把它当成第 1 个 `T`，第 2 个 `R` 仍是默认 `AxiosResponse`，`await` 拿到的类型就和拆包后的真实情况对不上。
- **为何用 `unknown` 而非 `any`**：两者都能占位，但 `unknown` 表达"有个类型但我不关心、也不该直接用它"，更安全（不允许不检查就访问属性）；`any` 会彻底关闭检查且易"传染"，还会触 ESLint 告警。
- 补充：`utils/request.ts` 里的写法是 `request.get<T, T>`（两个相同泛型），本质一样——都是为了让第 2 个泛型（真实返回值）生效；api 层因为不关心第一个才换成 `unknown`。

### 三层分层

```
页面组件  →  api 层(src/api/*.ts)  →  request 实例(src/utils/request.ts)  →  后端
```

- 页面**永远不直接碰 axios**；换后端只改 `request.ts` 的 baseURL 和 api 函数，页面层无感。
- 新增业务模块 = 新增一个 api 文件。

### 易错点

1. **请求拦截器忘写 `return config`**：请求发不出去，且报错难定位。
2. **以为 HTTP 200 就是成功**：本项目后端 HTTP 恒 200，真正成败看 `body.code`，必须在响应拦截器里再判一层。
3. **拆包后类型“谎报”**：响应拦截器直接 `return body`，但 axios 默认类型仍声明为 `AxiosResponse`，所以 `request.get<T, T>` 要写两个相同泛型（第二个才是真实返回值类型）。
4. **错误提示重复弹**：拦截器已统一 `ElMessage.error`，页面 `catch` 只做善后，不要再弹一次。

## A.3 Pinia 两种写法与 setup 风格为何是箭头函数

### 概念

`defineStore('id', 第二个参数)` 的第二个参数**可以是对象，也可以是函数**，对应两种风格。本项目 `src/stores/user.ts` 用的是**传函数**的 Setup 风格。

### 两种写法

**写法 A·Options 风格（第二个参数是对象）**

```ts
defineStore('user', {
  state: () => ({ token: '', userInfo: null }),
  getters: { ... },
  actions: { login() { /* 用 this.token */ } },
})
```

**写法 B·Setup 风格（第二个参数是函数，本项目用这种）**

```ts
defineStore('user', () => {
  const token = ref('')            // 相当于 state
  async function login() { ... }   // 相当于 action
  return { token, login }          // 暴露出去的东西
})
```

### 为什么这里必须是函数

函数体里用了 `ref(...)`、`await` 这些**要执行才产生结果**的代码。写成函数，Pinia 才能在 store **第一次被使用时才调用它（懒执行）**，此时才创建响应式 `token`、注册 `login`。这跟组件的 `setup()` 同理：**函数体 = 初始化逻辑，`return` 的东西 = 对外暴露的状态和方法**。

对照组件 setup：

| store 里 | 组件 setup | 角色 |
|---|---|---|
| `const token = ref(...)` | `const count = ref(0)` | 响应式状态（state） |
| `async function login()` | `function add()` | 方法（action） |
| `return { token, login }` | `return { count, add }` | 暴露给外部 |

### 为什么是箭头函数

**普通 `function () {}` 也完全可以，效果一样。** 用箭头只是因为：

1. **简洁**：少写个 `function` 关键字。
2. **这里不需要 `this`**：Setup 风格靠闭包里的 `ref` 拿状态，不像 Options 风格要 `this.token`；箭头函数没有自己的 `this`，恰好贴合"压根不需要 this"的场景，避免误用。

> 一句话："必须是函数"是硬性要求（Setup 风格），"用箭头"只是简洁 + 无 this 需求下的最简写法。

### 两种风格怎么选

- **Setup 风格**（本项目）：写法和组件一致、心智负担低，`ref`/`computed`/`watch` 随便用，复杂逻辑更灵活。
- **Options 风格**：结构固定（state/getters/actions 分区），从 Vue2/Vuex 过来的人更熟悉。
- 两者能力等价，选一种统一风格即可；本项目统一用 Setup 风格。

## A.4 空值合并运算符与问号家族

### 概念

`??` 是**一个整体的运算符**（不是两个独立的问号），叫**空值合并运算符**（nullish coalescing，ES2020）。语义：`a ?? b` —— **左边是 `null` 或 `undefined` 时才取右边**，否则一律用左边。

本项目 `src/stores/user.ts` 里的用法：

```ts
const token = ref(localStorage.getItem('token') ?? '')
```

`localStorage.getItem()` 有两种结果：存过就返回字符串，没存过（首次打开、退出登录清掉了）返回 `null`。`?? ''` 保证 `token.value` **永远是字符串**，后面判断真假、往请求头里塞值都不用再防 `null`，类型也干净（`Ref<string>` 而不是 `Ref<string | null>`）。

### 为什么不用 `||`

`||` 的判断范围更宽——只要左边是「假值」就走右边，**包括 `0`、`''`、`false`、`NaN`**：

| 表达式 | `??` 结果 | `\|\|` 结果 |
|---|---|---|
| `null ?? 'd'` | `'d'` | `'d'` |
| `undefined ?? 'd'` | `'d'` | `'d'` |
| `'' ?? 'd'` | `''` | `'d'` |
| `0 ?? 9` | `0` | `9` |
| `false ?? true` | `false` | `true` |

本行因为兜底值本身就是 `''`，`??` 和 `||` 效果恰好一样。但**默认用 `??` 更安全**：遇到「0 或空串是合法值」的场景（如 `count ?? 10`、`pageSize ?? 20`），`||` 会把 `0` 一起吃掉，形成难查的逻辑 bug。

### 能改成一个问号吗——不能

单个 `?` 在 JS 里只有两种身份，都套不进这个位置：

```ts
// ❌ 语法错误：三元运算符的 ? 必须配对 :
const token = ref(localStorage.getItem('token') ? '')
//                                              ↑ Expression expected

// ❌ 就算补上 : ，语义还是反的（有 token 时反而给空串）
localStorage.getItem('token') ? '' : localStorage.getItem('token')
```

可选链 `?.` 也不行——它后面必须紧跟 `.`、`[` 或 `(`。真要用单问号，得先存变量写成完整三元，白多一行还得重复变量名：

```ts
const saved = localStorage.getItem('token')
const token = ref(saved ? saved : '')
```

结论：**保持 `?? ''`**，它是处理「可能为 null 的默认值」最标准、最短的写法，Vite + TS 编译无障碍。

### 问号家族速查

| 语法 | 名称 | 含义 |
|---|---|---|
| `a ?? b` | 空值合并 | a 是 `null`/`undefined` 才取 b |
| `a?.b` | 可选链 | a 是 `null`/`undefined` 时整体返回 `undefined`，不抛错 |
| `a ??= b` | 空值赋值 | a 是 `null`/`undefined` 时才给它赋值 b |
| `a ? b : c` | 三元运算符 | 这个才是**单个**问号，必须配 `:` |
| `name?: string` | 可选属性/参数 | TS 类型层面的语法，与运行时无关 |

### 易错点

1. **把 `??` 当成两个问号想删一个**：它是不可拆分的单个运算符，删一个就是语法错误。
2. **随手用 `||` 兜底默认值**：`0`、`''`、`false` 会被误判为「没值」；只想拦 `null`/`undefined` 就用 `??`。
3. **`??` 与 `||`/`&&` 直接混写会报错**：`a ?? b || c` 语法非法，必须加括号明确优先级 `(a ?? b) || c`。
4. **误以为 `?.` 能兜默认值**：`a?.b` 拿不到时给的是 `undefined`，要默认值得再接一个 `??`，如 `user?.name ?? '匿名'`。

## A.5 v-bind 单向传值与 v-model 双向绑定

### 概念

模板里给组件传数据有两种写法，区别只在**数据能不能回流**：

- `:xxx="data"`（`v-bind:xxx` 的简写）——**单向**，父 → 子，只是把值交给子组件的 prop。
- `v-model="data"` ——**双向**，父 ⇄ 子，传下去的同时接受子组件写回来的新值。

### v-model 展开后是什么

`v-model` 是**语法糖**，并非新机制：

```vue
<el-input v-model="form.username" />

<!-- 等价于（Vue 3 默认 prop 名为 modelValue） -->
<el-input
  :model-value="form.username"
  @update:model-value="form.username = $event"
/>
```

两件事合一：**下行**把值给 prop（输入框才能回显当前值），**上行**监听 `update:modelValue` 事件把新值赋回变量。注意双向不是“双向魔法”，底层仍是单向数据流 + 事件回写。

### 项目实例：登录页为何两种都用

`src/views/LoginView.vue`：

```vue
<el-form :model="form" label-width="60px">   <!-- 单向：整个 form 对象 -->
  <el-form-item label="用户名">
    <el-input v-model="form.username" />     <!-- 双向：form 里的单个字段 -->
  </el-form-item>
</el-form>
```

- `el-form` 的 `:model` 是**单向**：它只需要“知道表单数据长什么样”，用于配合 `:rules` 字段校验、`resetFields()` 重置时定位字段；它不会反向改 `form`。（未写 `:rules` + `ref` 前，这个 `:model` 暂时不发挥作用，校验靠 `onSubmit` 里手写的 if。）
- `el-input` 的 `v-model` 必须**双向**：用户敲字得能写回 `form.username`，否则 `onSubmit` 里读到的永远是初始值。

### 对比表

| | `:model="form"` | `v-model="form.username"` |
|---|---|---|
| 本质 | `v-bind` 简写 | `:model-value` + `@update:model-value` 的糖 |
| 数据流向 | 单向（父 → 子） | 双向（父 ⇄ 子） |
| 绑定粒度 | 整个对象 | 对象里的单个字段 |
| 绑定目标 | 子组件名为 `model` 的 prop | 约定的 `modelValue` prop + 同名事件 |
| 去掉后果 | 目前无影响，加校验后失效 | 输入框变“只读死值”，登录必败 |

### 相关用法

- **多个 v-model**：一个组件可同时双向多个值，用参数区分：`<Comp v-model:title="t" v-model:content="c" />`。
- **自己写双向组件**：子组件 `const model = defineModel()`（Vue 3.4+），模板里直接用 `model`；旧写法是 `defineProps(['modelValue'])` + `emit('update:modelValue', v)`。
- **修饰符**：`v-model.trim`（去首尾空格，登录表单常用）、`.number`（转数字）、`.lazy`（改为 change 事件时才同步）。
- **注意大小写**：模板中用 kebab-case（`:model-value`、`@update:model-value`），JS 中用 camelCase（`modelValue`），两边自动对应。

### 易错点

1. **输入框敲不进字 / 改了没反应**：把 `v-model` 写成了 `:model-value`（或 `:value`），只下行没上行，值被锁死。
2. **把 `el-form` 的 `:model` 写成 `v-model`**：`el-form` 不发 `update:modelValue` 事件，写了也不会报错，但多出的监听永远不触发，属于无意义写法。
3. **`v-model` 绑整个对象**：输入框类组件要的是**单个值**，写 `v-model="form"` 会把对象当字符串显示成 `[object Object]`。
4. **`v-model` 绑常量或 props**：双向需要可写的响应式变量；直接绑父组件传下来的 prop 会触发“单向数据流”警告。
5. **忘了 `:` 冒号**：`model="form"`（无冒号）传的是**字符串 `"form"`** 而非变量，校验会说不出错但完全失效。

## A.6 父子组件通信（props 与 emit）

### 概念

Vue 的组件通信遵循**单向数据流**，两个方向各有工具：

- **父传子**：用 **props**，模板里 `:xxx="data"` 把值向下传。子组件**只能读，不能改**。
- **子传父**：用 **emit 事件**，子组件发一个事件把值“向上报”，父组件监听并自己改自己的数据。

### 父传子：props

本项目 `src/App.vue` 里用 `el-avatar` 就是父传子：

```vue
<el-avatar :size="28" :src="userStore.userInfo.avatar" />
<!-- App.vue（父）通过 prop 把 size、src 传给 el-avatar（子） -->
```

自己写子组件接收 prop（`<script setup>`）：

```ts
// 子组件
const props = defineProps<{ size: number; src: string }>()
// 模板/逻辑里用 props.size、props.src（只读）
```

要点：`:size="28"` 中 `size` 是子组件定义的 prop（Element Plus 组件就是它自己定的），`:`（v-bind）是 Vue 语法——负责把值当 JS 表达式传（所以 `28` 是数字，不加冒号就是字符串）。

### 子传父：emit

```ts
// 子组件：声明要发的事件
const emit = defineEmits<{ submit: [value: string] }>()
function onClick() {
  emit('submit', '子组件的数据')   // 向上报
}
```

```vue
<!-- 父组件：监听子组件事件 -->
<Child @submit="handleSubmit" />
<!-- handleSubmit(value) 里的 value 就是子组件 emit 传上来的 -->
```

要点：子组件**不直接改父的数据**，而是“通知”父组件，由父组件自己改——这就是单向数据流的意义：数据只从上往下流，修改源头可追溯。

### 实战时序：CategorySelector 的 change 事件

「子传父」在项目里最典型的一次落地是三级分类公共组件 `src/components/CategorySelector.vue`（属性页、SPU 页共用）。

**第 1 步：子组件声明事件（相当于登记一个“广播频道”）**

```ts
const emit = defineEmits<{
  change: [c1: number | undefined, c2: number | undefined, c3: number | undefined]
}>()
```

`change` 是事件名，父组件将来用 `@change` 监听；元组类型规定事件携带 3 个参数，`number | undefined` 是因为可能只选到一级、二三级还没选。

**第 2 步：状态一变就广播（三处 emit 对应三种“选到一半”）**

```ts
emit('change', val, undefined, undefined)   // 只选了一级
emit('change', c1.value, val, undefined)    // 选到了二级
emit('change', c1.value, c2.value, val)     // 三级选齐
```

**第 3 步：父组件登记监听并处理（AttrView.vue）**

```vue
<CategorySelector @change="onCategoryChange" />
```

```ts
function onCategoryChange(c1Val, c2Val, c3Val) {
  c1.value = c1Val              // 把真实值“抄”进父组件自己的 ref
  if (c1Val && c2Val && c3Val) loadAttrs()  // 三级选齐才查属性列表
  else attrs.value = []          // 没选齐就清空表格数据
}
```

**完整时序**

```text
用户在子组件下拉框选了「手机」(id=2)
        ↓
子组件内部更新：c1.value = 2
        ↓
子组件广播：emit('change', 2, undefined, undefined)   ← 携带真实值
        ↓
Vue 查模板发现父组件监听了 @change
        ↓
自动调用 onCategoryChange(2, undefined, undefined)    ← 真实值按顺序注入参数
        ↓
父组件决定自己的行为：存下 3 个值 / 加载数据 / 清空数据
```

要点：

1. **`change` 是“事件”不是“方法”**——子组件只是“喊一嗓子”：我这边变了，值都在参数里，谁在监听谁来处理；它不关心谁来处理、怎么处理。
2. **父子的 `c1/c2/c3` 是两套独立数据**——子组件的三个 ref 是私有的，父组件拿不到，正是靠这个事件把值“抄”过来同步。
3. 属性页拿到事件去查属性列表，SPU 页拿到同一个事件去查 SPU 分页——**同一个组件，每个父组件自己决定收到通知后干什么**，这就是抽公共组件的意义。

### v-model = props + emit 的语法糖

`v-model`（见 A.5）本质就是把上面两个方向合写：

```
v-model="x"  ≡  :model-value="x"（父传子 props） + @update:model-value="x = $event"（子传父 emit）
```

所以“双向”不是魔法，底层仍是 props 下行 + emit 上行。

### 方向速查

| 方向 | 工具 | 写法 |
|---|---|---|
| 父 → 子 | props | 父：`:size="28"`；子：`defineProps` |
| 子 → 父 | emit 事件 | 子：`defineEmits` + `emit('x', v)`；父：`@x="fn"` |
| 父 ⇄ 子 | v-model | 上两者的语法糖 |
| 跨层/全局 | Pinia store | 多组件共享（如本项目 `useUserStore`） |

### 易错点

1. **子组件直接改 prop**：会报“单向数据流”警告；要改得 emit 通知父，或把值拷贝到子组件自己的 `ref`。
2. **父监听事件名与 emit 不一致**：`emit('submit')` 就得 `@submit`，名字对不上时静默失效不报错。
3. **多层组件逐级透传**：props 一层层往下传太繁琐时，跨层共享用 Pinia 或 `provide/inject`，别硬透。
4. **大小写**：模板里事件/prop 用 kebab-case（`@update:model-value`），JS 里用 camelCase（`modelValue`），两边自动对应。

## A.7 组件外使用 Pinia 的时机

### 概念

`useUserStore()` 不是“创建 store”，而是**去当前激活的 pinia 实例里取 store**。而 pinia 只在 `main.ts` 执行 `app.use(createPinia())` 的那一刻才被激活。所以在组件之外用 store，关键不是能不能 import，而是**什么时候调用**。

一句话规则：**在组件外，`useUserStore()` 必须写在“会被延迟执行的函数体内部”，不能写在模块顶层。**

本项目 `src/router/index.ts` 的写法：

```ts
import { useUserStore } from '@/stores/user'   // ✅ import 只是拿到函数，没调用

router.beforeEach(async (to) => {
  const userStore = useUserStore()             // ✅ 导航发生时才调用，pinia 早已激活
  // ...
})
```

### 为什么顶层调用会炸

因为 **ES module 的 import 会被提升**：被导入模块的顶层代码，在导入方自己的代码之前就全部执行完了。看 `main.ts` 的真实时间线：

```
① import './router'  →  router/index.ts 模块体开始执行
     ├─ createRouter({...})        ✅ 没问题
     └─ 若此处写 useUserStore()    ❌ pinia 还不存在
② createApp(App)
③ app.use(createPinia())          ← pinia 到这一刻才激活
④ app.use(router)
⑤ app.mount()  →  触发首次导航  →  beforeEach 回调执行  ✅ 此时取得到 store
```

顶层调用发生在 ①，激活发生在 ③，①在③之前，所以必然报错：

```
"getActivePinia()" was called but there was no active Pinia.
Did you forget to install pinia?
```

写进 `beforeEach` 回调，调用时机被推迟到 ⑤，问题自然消失。

### 为什么 import 和 defineStore 都不报错

| 代码 | 做了什么 | 需要 pinia 吗 |
|---|---|---|
| `import { useUserStore }` | 只取到函数引用 | 不需要 |
| `defineStore('user', () => {...})` | 只登记一份“配方”（见 A.3 懒执行） | 不需要 |
| `useUserStore()` | 按配方造实例并挂到 pinia 上（首次），之后复用 | **需要** |

### 适用范围速查

| 场景 | 写法 |
|---|---|
| 组件内（`<script setup>`） | 顶层直接调用即可，渲染必在 `app.mount()` 之后 |
| 路由守卫 | 写在 `beforeEach` 等回调**内部** |
| axios 拦截器（取 token、处理 401） | 写在拦截器函数**内部** |
| 普通工具函数 | 写在函数体内，别放模块顶层 |

### 易错点

1. **在 `main.ts` 里把 `app.use(router)` 写在 `app.use(createPinia())` 之前**：`app.use(router)` 会触发首次导航解析，那时 pinia 还没装，守卫里即使写在回调内也一样报 `getActivePinia` 错误。正确顺序：**先 pinia，再 router**。
2. **在模块顶层缓存 store**（`const store = useUserStore()` 放文件顶部再到处用）：等价于顶层调用，同样报错。
3. **误以为是 import 路径问题**：报错信息只提 pinia 未安装，容易往别处找；只要看到 `getActivePinia`，就往“调用时机太早”上想。
4. **在 store 里跳路由**：`useRouter()` 是组件专用的 composable，store/拦截器里拿不到，只能 `import router from '@/router'`；但更推荐把跳转留给调用方（职责边界见下）。

### 顺带一条：store 与组件的职责边界

- **store 管“数据变成什么样”**：调接口、改 `token`/`userInfo`、清 localStorage。
- **组件管“用户看到什么、去哪儿”**：`ElMessage` 提示、`router.push` 跳转。

所以 `App.vue` 的退出登录写成两层是刻意的：`userStore.logout()` 只负责清登录态，提示语和跳转留在组件里。因为同一个 `logout()` 会被多处调用——用户主动点退出（提示“已退出登录”）、路由守卫发现 token 失效（回登录页重来）、拦截器收到 401（提示“登录已失效”）——提示语和目标页各不相同，写死在 store 里就没法区分了。

## A.8 模块引入路径：裸模块名、别名与相对路径

### 概念

`import` 后面跟的那串字符串叫**模块请求路径**，它的开头几个字符就决定了 Vite/TS 去哪里找。`src/layout/AdminLayout.vue` 开头那几行正好集齐三种：

```ts
import { ref } from 'vue'                 // 裸模块名
import { useUserStore } from '@/stores/user'  // 别名
import { menuConfig } from './menu'       // 相对路径
```

| 写法 | 含义 | 解析结果 |
|---|---|---|
| `'vue'` | **裸模块名**（不以 `.` 或 `/` 开头）→ 去 `node_modules` 找第三方包 | `node_modules/vue` |
| `'@/stores/user'` | **别名**：`@` 被配成了 `src` | `src/stores/user.ts` |
| `'./menu'` | **相对路径**：从当前文件所在目录出发 | `src/layout/menu.ts` |

### `./` 到底是什么

`./` = **当前文件所在的目录**。参照物是“写这行 import 的文件自己在哪”，**不是**项目根目录、也不是运行目录。`AdminLayout.vue` 在 `src/layout/` 下，所以 `./menu` 就是隔壁的 `src/layout/menu.ts`。

```
./menu          同级目录
../views/X      上一级（每个 .. 往上跳一层）
../../utils/y   上两级
@/stores/user   别名，等价 src/stores/user
```

### 别名 `@` 不是 JS 自带的

它需要**两处配置保持一致**：

- `vite.config.ts` 的 `resolve.alias` → 管**构建时能不能跑**
- `tsconfig.app.json` 的 `compilerOptions.paths` → 管**TS/编辑器能不能识别**

只配一边就会出现“能跑但编辑器报红”或反之（对照 Part 5 踩坑记录里的 ts(2307)）。

### 后缀能不能省

Vite/TS 会自动补 `.ts` `.tsx` `.js` `.json` 等，**但 `.vue` 必须写全**：

```ts
import { menuConfig } from './menu'           // ✅ .ts 可省
import HomeView from '../views/HomeView.vue'  // ✅ .vue 必须写
import HomeView from '../views/HomeView'      // ❌ 找不到
```

### 选用原则

- **用 `./` 相对路径**：引用**紧密关联、同目录**的文件。如 `menu.ts` 是专给 layout 用的配置，跟 `AdminLayout.vue` 是一体，用 `./` 能表达“它俩是一伙的”，整个 `layout/` 文件夹搬走也不断链。
- **用 `@/` 别名**：引用**跨模块的公共资源**（stores / api / utils / components）。不用数 `../../`，文件换位置也不用改路径。

### 易错点

1. **以为 `./` 是“项目根目录”**：它永远参照当前文件位置，同一串 `./menu` 写在不同文件里指向不同。
2. **写成 `/menu`**（少了点）：那是“服务器根”路径，前端源码里几乎用不到，会直接找不到模块。
3. **`.vue` 漏写后缀**：报 “Cannot find module”，容易误判为路径写错。
4. **两处别名配置不同步**：新增别名（如 `~` `#`）时必须 vite 和 tsconfig 同时改。

## A.9 Element Plus 菜单的 index 与 Vue 的 key 之辨

### 概念

`el-sub-menu` / `el-menu-item` 上的 `index` 是 **Element Plus 组件自己声明的 prop**（必填，`string`），跟 A.6 里 `:size="28"` 完全同一机制的父传子。

它**不是“索引下标”**，跟 `v-for` 的第二个参数毫无关系；Element Plus 只是借 `index` 这个词表示“**唯一标识**”，可以理解成这一项的身份证号。

```vue
<div v-for="(item, index) in list">   <!-- v-for 的 index：数组下标 0 1 2 -->
<el-sub-menu :index="item.title">    <!-- 组件的 index：唯一标识字符串 -->
```

### 两个 index 作用不同

| 用在哪 | 本项目传的值 | 作用 |
|---|---|---|
| `el-sub-menu` | `item.title`（如 `'商品管理'`） | **仅唯一标识**，用于记录该分组展开/收起 |
| `el-menu-item` | `child.path`（如 `'/product/trademark'`） | 既是唯一标识，**又被当成跳转路径** |

为什么后者会“顺便跳转”？因为 `el-menu` 上加了 `router` 属性，开启后点击 `el-menu-item` 时 Element Plus 会拿它的 `index` 去调 `router.push()`。此时 `index` 必须是**真实存在的路由路径**。

而 `el-sub-menu` 是不可点击跳转的分组容器，点它只展开/收起，不参与 `router` 跳转；加上 `menu.ts` 里带 `children` 的节点本来就没有 `path`（`MenuNode.path` 是可选），所以传 `title` 正好现成又唯一。

### index 与 key 分属不同体系

```vue
<template v-for="item in menuConfig" :key="item.title">   <!-- key：给 Vue 用 -->
  <el-sub-menu v-if="item.children" :index="item.title">  <!-- index：给 Element Plus 用 -->
```

| 属性 | 谁在用 | 干什么 |
|---|---|---|
| `:key` | **Vue 框架** | diff 时复用 DOM 节点；为保留属性，**不会**传进子组件 props |
| `:index` | **Element Plus 组件** | 组件自己的业务逻辑（展开状态、跳转路径） |

两者碰巧都传了 `item.title`，但用途毫无关系。

### 易错点

1. **把 `index` 当数组下标传数字**：类型要求 `string`，且开启 `router` 后会被当路径，传下标会导致跳转到不存在的路由。
2. **`index` 重复**：要求在整个 `el-menu` 内全局唯一；若出现两个同名分组，展开状态会互相串。解法：改传 `'group-' + item.title` 或在 `MenuNode` 里加独立的 `key` 字段。
3. **高亮对不上**：`el-menu` 的 `default-active` 传的值必须能在某个 `el-menu-item` 的 `index` 里找到；本项目传 `route.path`，所以菜单 `path` 必须与路由表完全一致。
4. **给 `el-sub-menu` 传了真路径**：不报错但无意义，还可能跟子项的 `index` 撞车；分组节点只需一个不重复的标识。

## A.10 具名插槽与作用域插槽

### 概念

**插槽（slot）= 组件预留的“坑位”**：组件把一部分内容的决定权交给使用方，使用方往坑里填任意模板。跟 props 的分工：**props 传“数据”，插槽传“结构”**（对照 A.6）。

`<template #title>` 中的 `#title` 是 **`v-slot:title` 的缩写**，意思是“这块内容请放到组件里叫 `title` 的那个坑位上”。没写 `#xxx` 的内容则落入**默认插槽**。

### 组件内部是怎么“留坑”的

子组件用 `<slot>` 声明坑位，带 `name` 就是具名插槽：

```vue
<!-- 子组件（类似 el-sub-menu 的简化结构） -->
<div class="sub-menu">
  <div class="title-row" @click="toggle">
    <slot name="title" />   <!-- 坑位一：永远可见的标题行 -->
  </div>
  <div v-show="opened">
    <slot />                <!-- 坑位二：默认插槽，展开后才露出 -->
  </div>
</div>
```

“插槽名叫什么”完全由组件作者定，Element Plus 的每个组件文档都有一张 **Slots 表**，用前先查。

### 本项目实例一：el-sub-menu 的两个坑位

`src/layout/AdminLayout.vue`：

```vue
<el-sub-menu v-if="item.children" :index="item.title">
  <template #title>          <!-- → title 插槽：一级标题行 -->
    <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
    <span>{{ item.title }}</span>
  </template>

  <el-menu-item v-for="child in item.children" :index="child.path">
    {{ child.title }}        <!-- → 默认插槽：展开后的二级子项 -->
  </el-menu-item>
</el-sub-menu>
```

| 插槽 | 放什么 | 显示在哪 |
|---|---|---|
| `title` | 分组标题（图标 + 文字） | 那一行**永远可见**，点它展开/收起，右侧带小箭头 |
| 默认插槽 | 子菜单项 `el-menu-item` | 展开后才露出的下拉列表 |

**去掉 `<template #title>` 的后果**：图标和文字会掉进默认插槽，跟子菜单项混在一起变成“展开后才看得到的一项”，而一级标题行变成空白——不报错，但菜单直接错乱。

### 本项目实例二：el-menu-item 的 #title 是另一个用途

```vue
<el-menu-item v-else :index="item.path">
  <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>  <!-- 插槽外 -->
  <template #title>{{ item.title }}</template>                       <!-- 插槽内 -->
</el-menu-item>
```

这里的 `title` 插槽是为了**配合侧边栏折叠**：

- 图标写在插槽**外面** → 折叠成 64px 时依旧保留；
- 文字写在 `#title` **里面** → 折叠时自动隐藏，鼠标悬停时变成小气泡（tooltip）提示。

这就是点折叠按钮后“只剩一列图标、悬停还能看到名字”的实现方式；文字直接裸写在外面的话，折叠时它会被挤压变形。

### 实例三：el-card 的 #header——插槽与同名 prop 的取舍

`src/views/product/TrademarkView.vue`：

```vue
<el-card shadow="never">
  <template #header>
    <div class="card-header">
      <span>品牌列表</span>
      <el-button type="primary" @click="onAdd">添加品牌</el-button>
    </div>
  </template>

  <el-table ... />        <!-- 没写 #xxx → 自动落入默认插槽（卡片正文） -->
  <el-pagination ... />
</el-card>
```

```
┌─────────────────────────────┐
│ 品牌列表        [添加品牌]  │ ← #header 插槽（带下边框、独立内边距）
├─────────────────────────────┤
│  表格 + 分页                 │ ← 默认插槽（body 区）
└─────────────────────────────┘
```

`el-card` 的头部其实**两种写法都支持**，这里必须用插槽：

```vue
<el-card header="品牌列表" />        <!-- prop：只能塞纯文本 -->
<el-card><template #header>...</template></el-card>   <!-- 插槽：能塞任意结构 -->
```

因为头部不只有文字，还有个“添加品牌”按钮——**prop 传不了组件，插槽才行**（即本节开头“props 传数据、插槽传结构”的实战场景）。配套的 `.card-header` 用 `display: flex` + `justify-content: space-between` 实现“左标题右按钮”，是后台页头部的标准套路。

### 作用域插槽：数据从子组件反流回父模板

前面三个例子都是**父→子 单向填结构**。而表格列多了一个 `="{ row }"`：

```vue
<template #default="{ row }">
<!--  ↑#default      ↑="{ row }" 接子组件反传上来的数据 -->
```

拆成两半看：`#default` = `v-slot:default`，填“默认插槽”这个坑位；`="{ row }"` 是接住子组件递出来的当前行数据。这种带参数的插槽叫**作用域插槽**（scoped slot）。

#### 为什么表格列非要它

```vue
<el-table-column prop="tmName" label="品牌名称" />   <!-- 有 prop：组件自己取值渲文本 -->

<el-table-column label="LOGO">                       <!-- 无 prop：显示什么由你定 -->
  <template #default="{ row }">
    <el-image :src="toFullUrl(row.logoUrl)" />
  </template>
</el-table-column>
```

- `prop="tmName"` 是“**告诉组件取哪个字段**”，组件直接把文本渲出来，够用就别写模板；
- LOGO 列要渲染 `<el-image>`、操作列要渲染两个按钮——这些**组件不可能预知**，只能把数据交给你、你自己写模板。

关键在于：**循环是 `el-table` 内部做的**。你的模板写在外面，子组件不把当前行递出来，你根本无法知道“现在渲染的是哪一条”。

#### 数据是怎么绕一圈回来的

```
你：:data="tableData"                      ← 整个数组交给 el-table
        ↓
el-table 内部 v-for 遍历每一行
        ↓
每渲染一行，调用你的 #default 插槽，塞给你 { row, column, $index }
        ↓
你的模板：toFullUrl(row.logoUrl)       ← 拿到单行数据，渲染这一格
```

所以 `row` 这个名字**不是你起的**，是 Element Plus 定的（文档 Slots 表里写着）。

#### 子组件内部是怎么反传的

就是在 `<slot>` 上像传 props 一样绑值：

```vue
<!-- 子组件（类似 el-table 的极简结构） -->
<tr v-for="(item, i) in data" :key="item.id">
  <td>
    <slot :row="item" :$index="i">   <!-- 把当前行绑到插槽上递出去 -->
      {{ item[prop] }}               <!-- 插槽内容为空时的默认内容：直接取 prop 字段 -->
    </slot>
  </td>
</tr>
```

两个附带结论：① 插槽里能拿到什么参数，完全由组件作者决定；② `<slot>` 标签之间可以写**默认内容**，使用方不填时就用它——这就是为何只写 `prop="tmName"` 不写模板也能正常显示文本。

#### 能解构出来的三个字段

```vue
<template #default="{ row, column, $index }">
  <span>{{ $index + 1 }}</span>      <!-- 序号列常用：数组下标，从 0 开始 -->
  <span>{{ row.tmName }}</span>      <!-- 当前行的完整数据对象 -->
</template>
```

不想解构也可以整个接下来，效果一样：

```vue
<template #default="scope">
  <el-image :src="toFullUrl(scope.row.logoUrl)" />
</template>
```

`{ row }` 只是 **ES6 解构语法**，把 `scope.row` 直接取出来少写一层，现在更常见。

### 实例四：el-popconfirm 的 #reference——插槽也能当“锚点”

```vue
<el-popconfirm title="确定删除该品牌吗？" @confirm="onDelete(row.id)">
  <template #reference>
    <el-button size="small" type="danger">删除</el-button>
  </template>
</el-popconfirm>
```

这个 `#reference` 特别一点：它不是“往里填内容”，而是“**告诉组件拿哪个元素当触发锚点**”——气泡框得知道贴着谁弹、点谁才弹。删除按钮写在插槽外面就不会触发确认框，点下去直接执行删除。`el-tooltip`、`el-popover`、`el-dropdown` 都是同一套路。

### 本项目插槽用法一览

到 Part 8 为止，插槽已在五处出现，正好覆盖三种类型：

| 位置 | 写法 | 类型 | 作用 |
|---|---|---|---|
| `el-sub-menu` | `#title` | 具名 | 分组标题行（永远可见、可点展开） |
| `el-menu-item` | `#title` | 具名 | 折叠时隐藏文字、悬停变 tooltip |
| `el-card` | `#header` | 具名 | 卡片头部（标题 + 主操作按钮） |
| `el-table-column` | `#default="{ row }"` | **作用域** | 自定义单元格，`row` 为当前行数据 |
| `el-popconfirm` | `#reference` | 具名（锚点） | 指定触发气泡确认的元素 |
| `el-dialog` | `#footer` | 具名 | 弹窗底部按钮区 |

### 写法速查

| 写法 | 全写 | 含义 |
|---|---|---|
| `<template #title>` | `v-slot:title` | 填名为 title 的具名插槽 |
| 直接写内容 | — | 落入默认插槽（等价 `#default`） |
| `#default="{ row }"` | `v-slot:default="{ row }"` | 作用域插槽 + 解构取 `row` |
| `#default="scope"` | `v-slot:default="scope"` | 同上，不解构，用 `scope.row` |
| `#[name]` | `v-slot:[name]` | 动态插槽名，插槽名取自变量 |
| 子组件 `<slot name="x" :row="item" />` | — | 声明坑位并反传数据 |

常见插槽名：`title` / `header` / `footer` / `default` / `reference` / `append` / `empty`。不确定时查组件文档页**最底部的 Slots 表**，里面列了每个坑位名及它会反传哪些参数。

### 易错点

1. **忘写 `<template #title>`**：内容静默地掉进默认插槽，不报错但布局错位；看到“标题没了、内容多了一项”先查插槽名。
2. **`#title` 写到普通元素上**：`v-slot` 只能用在 `<template>` 或组件标签上，写成 `<div #title>` 会报错。
3. **插槽名大小写不会自动转换**：Vue 3 的插槽名是原样匹配，`#itemTitle` 和 `#item-title` 是两个不同的坑（不同于 props/事件的 kebab ↔ camel 自动对应，见 A.6）；名字拼错就是静默不渲染。
4. **以为 `#title` 只能放文字**：它是一整块区域，图标、标记、`el-tag` 都能塞——本项目就是图标 + 文字两个元素。
5. **分不清插槽与同名 prop**：`el-card` 的 `header`、`el-dialog` 的 `title` 两者都支持——prop 只能传纯文本，插槽能放任意结构；同时写时插槽优先。
6. **作用域插槽漏写参数**：`#default` 不接 `="{ row }"` 时拿不到行数据，模板里用 `row` 报未定义。
7. **`#default="row"` 套错一层**：不带花括号时接到的是整个 scope 对象，得写 `row.row.logoUrl` 才对；要么加花括号解构，要么改名叫 `scope`。
8. **`prop` 与插槽同时写**：插槽优先，`prop` 被忽略；没坏处但冗余，看代码的人会困惑。
9. **照搬 Vue 2 老写法**：`slot-scope="scope"`、`<template slot="header">` 在 Vue 3 已废除，对应现在的 `#default="scope"` 和 `#header`；参考旧教程代码时尤其容易中招。
10. **在插槽里直接改 `row`**：`row` 指向 `tableData` 里的原对象，直接改会绕过接口悄悄改掉列表数据（页面变了但后端没变）；这也是 `onEdit` 里逐字段拷到 `form`、而不是 `form = row` 的原因。

## A.11 动态组件 `<component :is>`

### 概念

`<component>` **不是子组件**，`is` 也**不是它的 prop**。两者合起来是 Vue 的内置机制——**动态组件**。

- `<component>` 是 **Vue 编译器认识的内置标签**，跟 `<template>` / `<slot>` / `<transition>` 同类；项目里找不到 `component.vue` 这个文件。它自己不渲染任何 DOM，只是个占位符：“看 `is` 指向谁，我就变成谁。”
- `is` 是 **Vue 保留的特殊属性**，会被 Vue 自己拦下来用来决定渲染谁，**不会**作为 prop 传给目标组件。

```vue
<component :is="item.icon" />
<!-- item.icon = 'HomeFilled' 时等价于手写 <HomeFilled /> -->
<!-- item.icon = 'Goods'      时等价于手写 <Goods /> -->
```

### 与已学过的三个“类属性”对照

| 属性 | 谁定义的 | 会不会传进子组件 |
|---|---|---|
| `:index`（A.9） | **Element Plus 组件**用 `defineProps` 声明的 | 会，它就是 prop |
| `:key`（A.9） | **Vue 保留属性** | 不会，Vue 截走做 diff |
| `:is`（本节） | **Vue 保留属性** | 不会，Vue 截走决定“渲染谁” |

所以 `HomeFilled` 这个图标组件内部并没声明过叫 `is` 的 prop，它压根不知道 `is` 的存在。

### 除 is 之外的属性会正常透传

```vue
<component :is="item.icon" :size="20" class="menu-icon" @click="fn" />
<!-- 等价于（设 is 解析为 HomeFilled）： -->
<HomeFilled :size="20" class="menu-icon" @click="fn" />
```

可以把 `<component>` 理解成一个“插座”：`is` 决定插哪个组件进来，其余属性、class、事件、插槽内容都原样交给被插进来的那个组件。

### is 能接什么值

```vue
<component :is="item.icon" />   <!-- ① 字符串 = 组件名（必须已注册），本项目走这条 -->
<component :is="Foo" />         <!-- ② 组件对象本身（import 进来的） -->
<component :is="'h1'" />        <!-- ③ 原生标签名 → 渲染成 <h1> -->
```

### 本项目为何用它

菜单是 `v-for` 循环出来的，每项图标不同。没有动态组件就得穷举：

```vue
<HomeFilled v-if="item.icon === 'HomeFilled'" />
<Goods v-else-if="item.icon === 'Goods'" />
<Lock v-else-if="item.icon === 'Lock'" />
```

而 `<component :is>` 让你只改 `menu.ts` 配置、模板一行不动——这正是 Part 7“数据驱动菜单”的基础。能存字符串而不是组件对象，前提是 `main.ts` 把图标包全量注册为全局组件（见下）；日后若为减体积改成按需 import，`menu.ts` 里就得存组件对象，改走②。

### 图标为何不用 import：全局注册

`main.ts` 里这个循环把图标包里**所有**图标一次性注册成全局组件，所以任何 `.vue` 里直接写 `<Fold />` 就能用：

```ts
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
```

对照 `import { menuConfig } from './menu'`（局部引入，必须写），两者差别就是全局 vs 局部注册。

### 图标为何要套 el-icon

```vue
<el-icon v-if="item.icon">
  <component :is="item.icon" />
</el-icon>
```

图标 SVG 自己没尺寸也没颜色（`fill="currentColor"` 表示颜色跟父元素的 `color` 走）。`el-icon` 是容器组件，负责给尺寸（`:size`）、给颜色、处理垂直对齐。两层职责完全不同：**`el-icon` 是真组件，`component` 是内置占位符**，别看成嵌套了两个组件。

### 另一个典型场景：页签 / 多步表单

```vue
<script setup>
import StepOne from './StepOne.vue'
import StepTwo from './StepTwo.vue'
const current = ref(StepOne)
</script>

<template>
  <KeepAlive>
    <component :is="current" />   <!-- 包 KeepAlive 可保留各页已填的数据 -->
  </KeepAlive>
</template>
```

不包 `<KeepAlive>` 时，切走的组件会被卸载，内部状态全丢；包上则只是隐藏，切回来还是原样。

### 易错点

1. **以为 `is` 会传给目标组件**：它被 Vue 截走了，目标组件收不到。
2. **忘了 `:` 直接写 `is="item.icon"`**：会被当成字符串字面量，Vue 去找一个名叫 `item.icon` 的组件 → 页面空白 + 控制台警告。
3. **组件名拼错或大小写不对**：`'homeFilled'` 找不到组件，Vue 只警告不报错，那块位置静默空白。
4. **`is` 收到 `undefined`**：`MenuNode.icon` 是可选字段，所以模板里先用 `v-if="item.icon"` 把整层挡掉，没配图标的菜单项不渲染。
5. **用在原生 HTML 标签上的 `is` 需前缀**：Vue 3 里 `<div is="Foo">` 不生效，得写 `<div is="vue:Foo">`；`<component :is>` 这种用法不受影响。

## A.12 模板字符串与接口路径拼接

### 反引号不是单引号

`src/api/trademark.ts` 里路径外层包的是 **反引号 `` ` ``**（backtick，键盘左上角、Esc 下面、跟 `~` 同一个键），不是单引号 `'`。反引号包起来的字符串叫**模板字符串**（template literal，ES6），比普通引号多一个本领：**能用 `${}` 往字符串里塞变量**。

```ts
// ✅ 反引号：${} 被求值，page=1 limit=10 → '/admin/product/baseTrademark/1/10'
`/admin/product/baseTrademark/${page}/${limit}`

// ❌ 单引号：${page} 原样当文字发出去 → 后端收到字面量，必 404
'/admin/product/baseTrademark/${page}/${limit}'

// 😑 老写法：能跑但一堆加号和斜杠，容易漏
'/admin/product/baseTrademark/' + page + '/' + limit
```

### 为何同一文件里两种引号并存

| 例子 | 引号 | 原因 |
|---|---|---|
| `'/admin/product/baseTrademark/update'` | 单引号 | **纯静态**路径，没变量要插 |
| `` `/admin/product/baseTrademark/remove/${id}` `` | 反引号 | **有变量**要插值 |

项目 `.prettierrc.json` 配了 `"singleQuote": true`，意为“字符串默认用单引号”；但 Prettier **不会去动反引号**——它认得出模板字符串是另一种语法，不属于引号风格问题。所以规律是：**默认单引号，只有需要 `${}` 插值（或写多行字符串）时才换反引号**。没插值却用反引号属于多余写法。

### 路径参数 vs 查询参数

后端接口传参有两种风格，**前端写法完全不同**（具体用哪种以 swagger 为准）：

```ts
// ① 路径参数（path param）——本项目品牌分页用的这种
request.get(`/admin/product/baseTrademark/${page}/${limit}`)

// ② 查询参数（query param）——交给 axios 的 params，别手拼
request.get('/some/list', { params: { page, limit, keyword } })
// axios 自动拼成 ?page=1&limit=10&keyword=xxx
```

| | 路径参数 | 查询参数 |
|---|---|---|
| URL 长相 | `/baseTrademark/1/10` | `/some/list?page=1&limit=10` |
| 语义 | **定位资源**，通常必填 | **过滤/分页/排序**，多为可选 |
| 前端写法 | 模板字符串 `${}` 插值 | axios 的 `params` 对象 |
| 缺值后果 | 路径直接变形 → 404 | 后端走默认值或忽略 |
| 怎么确认 | 看 swagger 里路径含不含 `{xxx}` | swagger 标 `in: query` |

**优先用 `params` 而不手拼 `?a=1&b=2`** 的理由：axios 会自动做 URL 编码（关键词带空格、`&`、`#` 不会把参数截断），且值为 `undefined` 的字段会被自动省略，写法还更好读。

### 模板字符串的其他能力

```ts
`第 ${page} 页，共 ${Math.ceil(total / limit)} 页`   // ${} 里能放任意表达式，不只变量名
`删除后不可恢复，确定删除“${row.tmName}”？`        // 拼提示文案（后续删除确认框会用）
`第一行
第二行`                                          // 天然支持换行，不用 \n
```

### 易错点

1. **该用反引号却用了单引号**：`${page}` 原文发给后端，**编译不报错**，最难查；排查看浏览器 Network 里的真实请求 URL。
2. **插值变量是 `undefined`**：URL 变成 `/baseTrademark/undefined/10`，后端参数解析失败；可给函数参数加默认值（`page = 1, limit = 10`）防一手。
3. **拼接处斜杠多一个或少一个**：`//` 双斜杠在部分后端不等于单斜杠，直接 404；baseURL 末尾与路径开头只保留一边的 `/`。
4. **手拼查询参数忘编码**：关键词里的空格、`&`、`#` 会把参数截断或错位；交给 `params` 由 axios 编码。
5. **把反引号敲成中文引号 `‘’`**：输入法在中文状态下容易敲错，会直接报语法错误或变成普通汉字。
6. **在模板字符串里写业务逻辑**：`${}` 里尽量只放变量或简单表达式，复杂计算先算成变量，否则路径很难读也难调。




