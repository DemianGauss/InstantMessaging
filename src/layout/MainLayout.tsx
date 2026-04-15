import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../features/auth/auth-store";

export const MainLayout: React.FC = () => {
  const { token } = useAuthStore();

  // 权限守卫：如果没登录，直接重定向
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0a0a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #e94560 100%)",
      }}
    >
      {/* 固定在左侧的微信侧边栏 */}
      <Sidebar />

      {/* 右侧主内容区域 */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 这里会根据 URL 渲染 RoomsPage, RoomPage 或 FriendPage */}
        <Outlet />
      </main>
    </div>
  );
};
