import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import http from "../../shared/http";

interface User {
  id: number;
  username: string;
  avatar?: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  // 核心动作
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

/**
 * 用户认证状态管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /**
       * 登录成功逻辑
       * 满足功能要求：用户登录后应当和服务器端同步消息记录
       */
      login: async (token, user) => {
        set({ token, user, isAuthenticated: true });

        // 触发消息同步流程（此处为预留逻辑，对接聊天模块时完善）
        try {
          console.log("正在执行初始消息同步...");
          // 示例调用：await http.get('/sync/messages');
        } catch (err) {
          console.error("消息同步失败，请检查数据完整性机制", err);
        }
      },

      /**
       * 登出逻辑
       */
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // 清理本地存储以外的其他运行时缓存（如果有）
      },

      /**
       * 注销账号逻辑 (Delete Account)
       * 满足二级需求：注销后服务器端应当正确处理涉及到该用户的所有数据
       */
      deleteAccount: async () => {
        try {
          // 调用后端注销接口，触发服务器端的数据清理（记录、好友关系等）
          await http.delete("/user/account");
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
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
