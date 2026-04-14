import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../features/auth/login/LoginPage.tsx";
import { RegisterPage } from "../features/auth/register/RegisterPage.tsx";
import { RoomPage } from "../features/chat/RoomPage";
import { RoomsPage } from "../features/chat/RoomsPage";
import { FriendPage } from "../features/friend/FriendPage";
import { MainLayout } from "../layout/MainLayout"; // 确保导入路径正确

export const router = createBrowserRouter([
  // --- 1. 公共路由（不需要侧边栏） ---
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  // --- 2. 受保护路由（包裹在 MainLayout 中） ---
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <RoomsPage />,
      },
      {
        path: "/rooms/:roomId",
        element: <RoomPage />,
      },
      {
        path: "/contact",
        element: <FriendPage />,
      },
      {
        path: "/settings",
        element: <div>设置界面（待开发）</div>,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
