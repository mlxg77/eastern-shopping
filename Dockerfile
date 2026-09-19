# ========== 构建阶段：Node 中执行 vite build ==========
FROM node:22-alpine AS build

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
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
