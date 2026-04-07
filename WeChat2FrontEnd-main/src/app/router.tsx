import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../features/auth/login/LoginPage.tsx";
import { RegisterPage } from "../features/auth/register/RegisterPage.tsx";
import { RoomPage } from "../features/chat/RoomPage";
import { RoomsPage } from "../features/chat/RoomsPage";

export const router = createBrowserRouter([
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <RoomsPage />,
  },
  {
    path: "/rooms/:roomId",
    element: <RoomPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
