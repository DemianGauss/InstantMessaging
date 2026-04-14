import React, { useState, useEffect, useMemo } from "react";
import { useFriendStore, type UserProfile } from "../store/useFriendStore";
import { friendApi } from "../api/friendApi";

export const UserDetail: React.FC = () => {
  const { selectedId, friends, requests, fetchFriends, fetchRequests } =
    useFriendStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isError, setIsError] = useState(false);

  // 获取用户ID
  const userId = typeof selectedId === "number" ? selectedId : null;

  // 先利用本地数据展示 (防止网络慢或没网时白屏)
  const localData = useMemo(() => {
    // 优先从好友列表找
    const f = friends.find((item) => item.userId === userId);
    if (f) return { ...f, relation: 0 as const };

    // 从申请列表找
    const r = requests.find(
      (item) => item.sender.userId === userId && item.status === 0,
    );
    if (r)
      return { ...r.sender, relation: 1 as const, applyMsg: r.applyMsg || "" };

    return null;
  }, [userId, friends, requests]);

  // 3. 异步请求服务器最新数据
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      setIsError(false);
      try {
        const res = await friendApi.getUserProfile(userId);
        setProfile(res.data.data);
      } catch (err) {
        console.error("Fetch profile failed:", err);
        // 触发“网络连接失败”提示
        if (err instanceof Error) {
          if (err.message === "网络请求失败") {
            setIsError(true);
          }
        }
      }
    };

    loadProfile();
    return () => {
      setProfile(null);
      setIsError(false);
    };
  }, [userId]);

  // 最终合并数据：请求到的数据优先，本地兜底其次
  const data = profile || (localData as UserProfile | null);

  if (!userId || !data) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ccc",
        }}
      >
        请选择联系人
      </div>
    );
  }

  // 发送好友请求
  const handleAddFriend = () => {
    const msg = window.prompt("发送申请验证信息", `我是 ${data.username}`);
    if (msg !== null)
      friendApi.sendRequest(data.userId, msg).then(() => alert("已发送"));
  };

  // 接受好友请求
  const handleAccept = async () => {
    await friendApi.handleRequest(data.userId, 1);
    fetchFriends();
    fetchRequests();
  };

  /* --- 样式定义 --- */
  const sectionStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    padding: "20px 30px",
    marginBottom: 8,
    borderBottom: "1px solid #f0f0f0",
  };

  const btnStyle: React.CSSProperties = {
    padding: "12px 0",
    textAlign: "center",
    color: "#576b95",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "#f3f3f3",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* 错误提示条 */}
      {isError && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#fb7373",
            padding: "8px",
            textAlign: "center",
            fontSize: 13,
          }}
        >
          ⚠️ 网络连接失败
        </div>
      )}

      {/* 头部信息区 */}
      <div
        style={{
          ...sectionStyle,
          display: "flex",
          alignItems: "flex-start",
          paddingTop: 60,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
            {data.remark || data.username}
          </div>
          {data.remark && (
            <div style={{ color: "#888", fontSize: 14 }}>
              昵称：{data.username}
            </div>
          )}
          <div style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
            邮箱：{data.email || "未设置"}
          </div>
        </div>
        <img
          src={data.avatar}
          style={{ width: 65, height: 65, borderRadius: 8, objectFit: "cover" }}
          alt="avatar"
        />
      </div>

      {/* 差异化展示区 */}

      {/* 情况1：好友 (relation === 0) */}
      {data.relation === 0 && (
        <>
          <div style={sectionStyle}>
            <div style={{ color: "#888", fontSize: 14 }}>备注名和标签</div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div
              style={btnStyle}
              onClick={() => console.log("Chat with:", data.userId)}
            >
              发消息
            </div>
          </div>
        </>
      )}

      {/* 情况2：对方发了申请 (relation === 1) */}
      {data.relation === 1 && (
        <>
          <div style={sectionStyle}>
            <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
              验证信息
            </div>
            <div style={{ color: "#333" }}>
              {data.applyMsg || "请求添加你为好友"}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={btnStyle} onClick={handleAccept}>
              通过验证
            </div>
          </div>
        </>
      )}

      {/* 情况3：陌生人 (relation === 2) */}
      {data.relation === 2 && (
        <div style={{ marginTop: 20 }}>
          <div style={btnStyle} onClick={handleAddFriend}>
            添加到通讯录
          </div>
        </div>
      )}
    </div>
  );
};
