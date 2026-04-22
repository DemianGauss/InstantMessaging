import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import https from "../../shared/https";

interface User {
  id: number;
  account_id: string; // login identifier
  username: string;   // display name (nickname)
  avatar?: string;
  email?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => void;
  deleteAccount: (password: string) => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
  updateAvatar: (dataUrl: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (token, user) => {
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      // PUT /api/auth/update-nickname
      updateNickname: async (nickname) => {
        await https.put("/api/auth/update-nickname", { nickname });
        set((state) => ({
          user: state.user ? { ...state.user, username: nickname } : state.user,
        }));
      },

      // PUT /api/auth/update-avatar  (multipart/form-data)
      updateAvatar: async (dataUrl) => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("avatar", blob, "avatar.jpg");
        const response = await https.put("/api/auth/update-avatar", formData, {
          headers: { "Content-Type": undefined },
        });
        const avatarUrl: string = response.data.avatar_url ?? dataUrl;
        set((state) => ({
          user: state.user ? { ...state.user, avatar: avatarUrl } : state.user,
        }));
      },

      // POST /api/auth/deactivate/
      deleteAccount: async (password) => {
        await https.post("/api/auth/deactivate/", { password });
        get().logout();
      },
    }),
    {
      name: "wechat2-auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
