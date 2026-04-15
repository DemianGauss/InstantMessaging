import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/auth-store";
import { BsChatDots, BsPeople, BsGear } from "react-icons/bs";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { key: "chat", label: "聊天", icon: <BsChatDots />, path: "/" },
    { key: "contacts", label: "通讯录", icon: <BsPeople />, path: "/contact" },
  ];

  const sidebarStyle: React.CSSProperties = {
    width: "60px",
    background:
      "linear-gradient(180deg, rgba(10,10,46,0.98) 0%, rgba(22,33,62,0.98) 50%, rgba(15,52,96,0.98) 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 0 20px 0",
    height: "100vh",
    flexShrink: 0,
    zIndex: 100,
    borderRight: "1px solid rgba(255, 0, 255, 0.3)",
    boxShadow:
      "4px 0 24px rgba(255, 0, 255, 0.12), inset -1px 0 0 rgba(0, 255, 255, 0.1)",
    fontFamily: "'Arial Black', Arial, sans-serif",
  };

  const getIsActive = (itemPath: string) => {
    if (itemPath === "/") {
      return (
        location.pathname === "/" ||
        location.pathname.startsWith("/rooms")
      );
    }
    return location.pathname.startsWith(itemPath);
  };

  const iconWrapperStyle = (isActive: boolean): React.CSSProperties => ({
    fontSize: "20px",
    cursor: "pointer",
    margin: "6px 0",
    padding: "9px",
    borderRadius: "10px",
    color: isActive ? "#00ffff" : "rgba(255, 255, 255, 0.45)",
    backgroundColor: isActive
      ? "rgba(0, 255, 255, 0.12)"
      : "transparent",
    boxShadow: isActive
      ? "0 0 12px rgba(0, 255, 255, 0.35), inset 0 0 8px rgba(0, 255, 255, 0.08)"
      : "none",
    border: isActive
      ? "1px solid rgba(0, 255, 255, 0.35)"
      : "1px solid transparent",
    display: "flex",
    justifyContent: "center",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  });

  return (
    <div style={sidebarStyle}>
      {/* Avatar */}
      <div
        style={{
          marginBottom: "28px",
          position: "relative",
          width: 42,
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Neon glow ring behind avatar */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "10px",
            background:
              "conic-gradient(from 0deg, #ff00ff, #00ffff, #ffff00, #ff00ff)",
            animation: "avatarRingSpin 6s linear infinite",
            filter: "blur(4px)",
            opacity: 0.7,
          }}
        />
        <img
          src={
            user?.avatar ||
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"
          }
          alt="avatar"
          style={{
            position: "relative",
            width: "38px",
            height: "38px",
            borderRadius: "8px",
            cursor: "pointer",
            objectFit: "cover",
            backgroundColor: "#1a1a3e",
            border: "1px solid rgba(255,255,255,0.2)",
            zIndex: 1,
          }}
          onClick={() => navigate("/settings")}
        />
      </div>

      {/* Main nav */}
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

      {/* Settings */}
      <div
        title="设置"
        style={iconWrapperStyle(location.pathname === "/settings")}
        onClick={() => navigate("/settings")}
      >
        <BsGear />
      </div>

      {/* Keyframe for the avatar ring — injected as a style tag */}
      <style>{`
        @keyframes avatarRingSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
