import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 匹配所有以 /api 开头的请求
      "/api": {
        target: "https://WeChat2BackEnd-WeChat2.app.spring26b.secoder.net",
        changeOrigin: true, // 必须为 true，修改请求头中的 Origin 为目标地址
        rewrite: (path) => path.replace(/^\/api/, ""), // 去掉路径中的 /api 再发给后端
      },
    },
  },
});
