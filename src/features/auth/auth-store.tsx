import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import https from "../../shared/https";

// 用户对象
interface User {
  id: number;
  username: string;
  avatar?: string; // 头像
  email?: string;
}

// 认证状态
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // 登录、登出、注册操作
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  updateProfile: (fields: Partial<Pick<User, "username" | "avatar">>) => Promise<void>;
}

// 用户认证状态管理
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,

      // 登录
      login: async (token, user) => {
        set({ token, user, isAuthenticated: true });

        // To Do：触发消息同步流程
        try {
          console.log("正在执行初始消息同步...");
        } catch (err) {
          console.error("消息同步失败，请检查数据完整性机制", err);
        }
      },

      // 登出
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // 更新个人资料（昵称 / 头像）
      updateProfile: async (fields) => {
        await https.patch("/api/user/profile", fields);
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : state.user,
        }));
      },

      // 注销
      deleteAccount: async () => {
        try {
          // 服务器端的数据清理
          await https.delete("/user/account");
          // 后端清理成功后，前端执行登出清理
          get().logout();
        } catch (err) {
          console.error("注销账号失败，服务器处理异常", err);
          throw err; // 抛出错误让 UI 层捕获并显示友好提示
        }
      },
    }),
    {
      name: "wechat2-auth-storage", // localStorage 中的键名
      storage: createJSONStorage(() => localStorage), // 浏览器本地存储
    },
  ),
);
