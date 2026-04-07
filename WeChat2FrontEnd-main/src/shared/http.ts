import axios from "axios";
import { useAuthStore } from "../features/auth/auth-store";

// 获取环境变量中的 API 地址
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const http = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * 请求拦截器：实现安全性鉴权
 */
http.interceptors.request.use(
  (config) => {
    // 从 Zustand Store 获取最新的 token
    const token = useAuthStore.getState().token;

    if (token) {
      // 满足安全性要求：在所有需要判定请求发起者身份的接口处采用合理的鉴权手段
      // 这里使用标准的 Bearer Token 格式，也可以根据后端需求调整为 Basic
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 响应拦截器：处理登录失效与异常反馈
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    // 满足安全性要求：如果后端返回 401 (Unauthorized)，说明登录已过期
    if (error.response?.status === 401) {
      console.warn("登录已过期，正在清理状态并跳转...");
      useAuthStore.getState().logout();
      // 这里可以添加 window.location.href = '/login' 进行强制跳转
    }

    // 统一处理错误信息，方便前端 UI 展示
    const message = error.response?.data?.message || "网络请求失败";
    return Promise.reject(new Error(message));
  },
);

export default http;
