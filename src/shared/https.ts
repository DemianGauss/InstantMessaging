import axios from "axios";
import { useAuthStore } from "../features/auth/auth-store";

// 获取环境变量中的 API 地址
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// 创建自定义请求
const https = axios.create({
  baseURL: API_BASE,
  timeout: 3000, // 1s
  // 发送json， 返回接受json
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 请求拦截器: 自动添加token
https.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器：处理登录失效与异常反馈
https.interceptors.response.use(
  (response) => response,
  (error) => {
    // 后端返回 401，登录已过期
    if (error.response?.status === 401) {
      console.warn("登录已过期，正在清理状态并跳转...");
      useAuthStore.getState().logout();
    }
    // 方便前端 UI 展示
    const message = error.response?.data?.message || "网络请求失败";
    return Promise.reject(new Error(message));
  },
);

export default https;
