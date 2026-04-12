# 阶段一：构建阶段
FROM node:20-alpine AS build-stage
WORKDIR /app

# 利用 Docker 缓存机制，先安装依赖
COPY package*.json ./
RUN npm install

# 复制源码并打包
COPY . .
RUN npm run build

# 阶段二：生产阶段
FROM nginx:alpine AS production-stage

# 从构建阶段复制打包好的静态文件到 Nginx 目录
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]