import React, { useState, useEffect, useMemo } from "react";
import { useFriendStore, type UserProfile } from "../store/useFriendStore";
import { friendApi } from "../api/friendApi";
import styles from "./UserDetail.module.css";

export const UserDetail: React.FC = () => {
  const { selectedId, friends, requests, fetchFriends, fetchRequests } =
    useFriendStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isError, setIsError] = useState(false);

  const userId = typeof selectedId === "number" ? selectedId : null;

  const localData = useMemo(() => {
    const f = friends.find((item) => item.userId === userId);
    if (f) return { ...f, relation: 0 as const };
    const r = requests.find(
      (item) => item.sender.userId === userId && item.status === 0,
    );
    if (r)
      return { ...r.sender, relation: 1 as const, applyMsg: r.applyMsg || "" };
    return null;
  }, [userId, friends, requests]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setIsError(false);
      try {
        const res = await friendApi.getUserProfile(userId);
        setProfile(res.data.data);
      } catch (err) {
        console.error("Fetch profile failed:", err);
        if (err instanceof Error && err.message === "网络请求失败") {
          setIsError(true);
        }
      }
    };
    load();
    return () => {
      setProfile(null);
      setIsError(false);
    };
  }, [userId]);

  const data = profile || (localData as UserProfile | null);

  if (!userId || !data) {
    return <div className={styles.empty}>请选择联系人</div>;
  }

  const handleAddFriend = () => {
    const msg = window.prompt("发送申请验证信息", `我是 ${data.username}`);
    if (msg !== null)
      friendApi.sendRequest(data.userId, msg).then(() => alert("已发送"));
  };

  const handleAccept = async () => {
    await friendApi.handleRequest(data.userId, 1);
    fetchFriends();
    fetchRequests();
  };

  return (
    <div className={styles.page}>
      {isError && (
        <div className={styles.errorBar}>⚠ 网络连接失败</div>
      )}

      {/* Profile header */}
      <div className={styles.profileSection}>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>
            {data.remark || data.username}
          </h2>
          {data.remark && (
            <p className={styles.profileMeta}>
              昵称：<span>{data.username}</span>
            </p>
          )}
          <p className={styles.profileMeta}>
            邮箱：<span>{data.email || "未设置"}</span>
          </p>
        </div>
        <div className={styles.avatarWrap}>
          <span className={styles.avatarGlow} aria-hidden />
          <img src={data.avatar} className={styles.avatar} alt="avatar" />
        </div>
      </div>

      {/* Friend — remarks & actions */}
      {data.relation === 0 && (
        <>
          <div className={styles.infoSection}>
            <div className={styles.infoLabel}>备注名和标签</div>
            <div className={styles.infoValue}>
              {data.remark || "—"}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              type="button"
              onClick={() => console.log("Chat with:", data.userId)}
            >
              <span className={styles.actionBtnChrome} aria-hidden />
              <span className={styles.actionBtnText}>发消息</span>
            </button>
          </div>
        </>
      )}

      {/* Pending request */}
      {data.relation === 1 && (
        <>
          <div className={styles.verifySection}>
            <div className={styles.verifyLabel}>验证信息</div>
            <div className={styles.verifyMsg}>
              {data.applyMsg || "请求添加你为好友"}
            </div>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.actionBtn}
              type="button"
              onClick={handleAccept}
            >
              <span className={styles.actionBtnChrome} aria-hidden />
              <span className={styles.actionBtnText}>通过验证</span>
            </button>
          </div>
        </>
      )}

      {/* Stranger */}
      {data.relation === 2 && (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            type="button"
            onClick={handleAddFriend}
          >
            <span className={styles.actionBtnChrome} aria-hidden />
            <span className={styles.actionBtnText}>添加到通讯录</span>
          </button>
        </div>
      )}
    </div>
  );
};
