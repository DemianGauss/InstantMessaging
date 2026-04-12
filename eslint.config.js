version: '3.8'

services:
  wechat2-frontend:
    build: .
    image: wechat2-frontend:latest
    container_name: wechat2-frontend-app
    ports:
      - "8080:80" # 映射本地 8080 端口到容器 80
    volumes:
      # 1. 挂载日志到宿主机（持久化）
      - ./logs/nginx:/var/log/nginx
      # 2. 如果你想动态修改 Nginx 配置，可以挂载：
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    restart: always