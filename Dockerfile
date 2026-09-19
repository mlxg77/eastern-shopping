# ========== 构建阶段：Node 中执行 vite build ==========
# ⚠️ 别改回 node:22-alpine（最新版）：其 Alpine 3.22 与 CentOS 7 的 3.10 老内核不兼容，
#    pnpm 装完包收尾时必现 EPERM（2026-09 实测；3.21 及更老、slim 系列均正常）
FROM node:22-alpine3.21 AS build

WORKDIR /app

# 安装 pnpm（走国内镜像加速；海外服务器可去掉 --registry 参数）
# 锁定大版本 10：与仓库里 lockfileVersion 9.0 完全兼容
RUN npm install -g pnpm@10 --registry=https://registry.npmmirror.com

# 先装依赖，利用镜像层缓存：package.json / pnpm-lock.yaml 没变时跳过重装
COPY package.json pnpm-lock.yaml ./
# 国内用淘宝 npm 源加速；海外服务器可删掉这行
RUN pnpm config set registry https://registry.npmmirror.com \
    && pnpm install --frozen-lockfile

# 拷贝源码并构建（读取 .env.production，产出 dist/）
COPY . .
RUN pnpm build

# ========== 运行阶段：Nginx 托管静态产物 ==========
# ⚠️ 同理别用 nginx:alpine（最新版）：老内核上启动卡死、请求无响应
#    2026-09 实测 1.27-alpine / 1.26-alpine / 1.28-bookworm 均正常，取较新的 1.27-alpine
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
