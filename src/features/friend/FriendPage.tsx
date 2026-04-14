import React, { useEffect } from "react";
import { useFriendStore } from "./store/useFriendStore";
import FriendList from "./components/FriendList";
import { UserDetail } from "./components/UserDetail";
import { ContactManager } from "./components/ContactManager";

export const FriendPage: React.FC = () => {
  const { fetchFriends, selectedId } = useFriendStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // 右侧面板渲染结果
  const renderRightContent = () => {
    // 展示用户详细信息
    if (typeof selectedId === "number") return <UserDetail />;

    // 通讯录管理页面
    if (selectedId === "contactManager") return <ContactManager />;

    // 没有选中任何东西，展示Logo页面
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          color: "#ccc",
        }}
      >
        <img
          src="/favicon.svg"
          alt="logo"
          style={{ opacity: 0.2, width: 100 }}
        />
      </div>
    );
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}
    >
      <div
        style={{
          width: 280,
          borderRight: "1px solid #e0e0e0",
          backgroundColor: "#eee",
        }}
      >
        <FriendList />
      </div>
      <div style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        {renderRightContent()}
      </div>
    </div>
  );
};
