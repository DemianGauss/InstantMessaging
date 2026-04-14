import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/auth-store";
import { BsChatDots, BsPeople, BsGear } from "react-icons/bs";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { key: "chat", label: "WeChat", icon: <BsChatDots />, path: "/" },
    { key: "contacts", label: "通讯录", icon: <BsPeople />, path: "/contact" },
  ];

  // --- 修改后的侧边栏样式 ---
  const sidebarStyle: React.CSSProperties = {
    width: "60px",
    // 改为非常浅的冷灰色，带一点点透明度会更显高级
    backgroundColor: "#f7f7f7",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 0 20px 0",
    height: "100vh",
    flexShrink: 0,
    zIndex: 100,
    // 添加一条极细的右侧边框，使内容区分更优雅
    borderRight: "1px solid #e5e5e5",
  };

  const getIsActive = (itemPath: string) => {
    if (itemPath === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(itemPath);
  };

  // --- 修改后的图标包装样式 ---
  const iconWrapperStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: "22px",
    cursor: "pointer",
    margin: "8px 0",
    padding: "8px",
    borderRadius: "6px", // 增加圆角背景
    // 激活时颜色改为微信绿，未激活改为深灰
    color: isActive ? "#07C160" : "#555",
    backgroundColor: isActive ? "#ededed" : "transparent",
    display: "flex",
    justifyContent: "center",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    // 模拟鼠标悬停效果（如果需要更完美的 hover，建议在 CSS 文件里写）
  });

  return (
    <div style={sidebarStyle}>
      {/* 1. 顶部用户头像 - 增加阴影和留白 */}
      <div style={{ marginBottom: "25px" }}>
        <img
          src={
            user?.avatar ||
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"
          }
          alt="avatar"
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "6px",
            cursor: "pointer",
            objectFit: "cover",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* 2. 中间主导航区域 */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {menuItems.map((item) => (
          <div
            key={item.key}
            title={item.label}
            style={iconWrapperStyle(getIsActive(item.path))}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
          </div>
        ))}
      </div>

      {/* 3. 底部设置按钮 */}
      <div
        title="设置"
        style={iconWrapperStyle(location.pathname === "/settings")}
        onClick={() => navigate("/settings")}
      >
        <BsGear />
      </div>
    </div>
  );
};
