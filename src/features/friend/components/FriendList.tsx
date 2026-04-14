import React, { useState, useMemo, useEffect } from "react";
import { useFriendStore, type Friend } from "../store/useFriendStore";

type ContactsMode = "pinyin" | "label";

const FriendList: React.FC = () => {
  const {
    friends,
    requests,
    searchResults,
    selectedId,
    fetchRequests,
    searchUsers,
    setSelectedId,
    clearSearchResults,
  } = useFriendStore();

  const [isNewFriendsOpen, setIsNewFriendsOpen] = useState(false); // "新的朋友"折叠面板状态
  const [isContactsOpen, setIsContactsOpen] = useState(true); //"联系人"折叠面板状态
  const [contactsMode, setContactsMode] = useState<ContactsMode>("pinyin"); // "联系人"展示方式：首字母拼音 | label
  const [keyword, setKeyword] = useState(""); // 搜索框的文本

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // 处理搜索输入
  // 仅负责同步文字，不触发搜索
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
  };

  // 专门监听回车键，触发搜索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 按下的键为 "Enter"触发搜索
    if (e.key === "Enter") {
      const value = keyword.trim();
      if (value) {
        searchUsers(value);
      } else {
        // 搜索内容为空则清空
        clearSearchResults();
      }
    }
  };

  // 对好友申请列表排序，时间越新越靠前
  const sortedRequests = useMemo(() => {
    return [...requests].sort(
      (a, b) =>
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime(),
    );
  }, [requests]);

  const groupedFriends = useMemo(() => {
    const groups: Record<string, Friend[]> = {};
    friends.forEach((friend) => {
      let key = "";
      if (contactsMode === "pinyin") {
        // 首字母拼音大写
        key = (friend.remark || friend.username).charAt(0).toUpperCase();
        // 不是拼音，归到"#"组
        if (!/[A-Z]/.test(key)) key = "#";
      } else {
        key = friend.labelName || "未分组";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(friend);
    });

    return Object.keys(groups)
      .sort()
      .map((key) => ({
        title: key,
        list: groups[key],
      }));
  }, [friends, contactsMode]);

  const headerStyle: React.CSSProperties = {
    padding: "10px 15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#333",
    userSelect: "none",
  };

  const arrowStyle = (isOpen: boolean) => ({
    marginRight: "8px",
    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
    transition: "transform 0.2s",
    fontSize: "12px",
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 搜索框 */}
      <div style={{ padding: "20px 15px 10px" }}>
        <input
          placeholder="搜索用户"
          value={keyword}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          style={{
            width: "100%",
            borderRadius: "4px",
            border: "1px solid #ddd",
            padding: "6px 8px",
            backgroundColor: "#f2f2f2",
            outline: "none",
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {keyword.trim() ? (
          /* --- 搜索结果视图 --- */
          <div>
            <div
              style={{ padding: "10px 15px", fontSize: "12px", color: "#999" }}
            >
              搜索到的用户
            </div>
            {searchResults.map((user) => (
              <div
                key={user.userId}
                onClick={() => setSelectedId(user.userId)}
                style={{
                  padding: "10px 35px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor:
                    selectedId === `search_${user.userId}`
                      ? "#c5c5c5"
                      : "transparent",
                }}
              >
                <img
                  src={user.avatar}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "4px",
                    marginRight: 10,
                  }}
                  alt="avatar"
                />
                <span style={{ fontSize: "14px" }}>{user.username}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "#1890ff",
                  }}
                >
                  添加
                </span>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "13px",
                }}
              >
                未找到相关用户
              </div>
            )}
          </div>
        ) : (
          /* --- 常规列表视图 --- */
          <>
            {/* 通讯录管理 */}
            <div
              onClick={() => setSelectedId("contactManager")}
              style={{
                ...headerStyle,
                backgroundColor:
                  selectedId === "contactManager" ? "#d1d1d1" : "transparent",
                margin: "5px 10px",
                borderRadius: "6px",
                justifyContent: "center",
                border: "1px solid #ccc",
              }}
            >
              <span style={{ marginRight: "8px" }}>👤</span> 通讯录管理
            </div>

            {/* 好友申请 */}
            <div
              onClick={() => setIsNewFriendsOpen(!isNewFriendsOpen)}
              style={headerStyle}
            >
              <span style={arrowStyle(isNewFriendsOpen)}>▶</span>
              <span style={{ flex: 1 }}>好友申请</span>
              {requests.length > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "0 6px",
                    fontSize: "11px",
                  }}
                >
                  {requests.length}
                </span>
              )}
            </div>
            {isNewFriendsOpen && (
              <div style={{ borderBottom: "1px solid #eee" }}>
                {sortedRequests.map((req) => (
                  <div
                    key={req.requestId}
                    onClick={() => setSelectedId(req.sender.userId)}
                    style={{
                      padding: "10px 35px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      backgroundColor:
                        selectedId === `request_${req.requestId}`
                          ? "#c5c5c5"
                          : "transparent",
                    }}
                  >
                    <img
                      src={req.sender.avatar}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "4px",
                        marginRight: 10,
                      }}
                      alt="avatar"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>
                        {req.sender.username}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {req.applyMsg}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 联系人 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingRight: "10px",
              }}
            >
              <div
                onClick={() => setIsContactsOpen(!isContactsOpen)}
                style={{ ...headerStyle, flex: 1 }}
              >
                <span style={arrowStyle(isContactsOpen)}>▶</span> 联系人
                <span
                  style={{
                    color: "#999",
                    marginLeft: "10px",
                    fontSize: "12px",
                  }}
                >
                  {friends.length}
                </span>
              </div>
              {isContactsOpen && (
                <select
                  value={contactsMode}
                  onChange={(e) =>
                    setContactsMode(e.target.value as ContactsMode)
                  }
                  style={{
                    fontSize: "10px",
                    border: "none",
                    background: "transparent",
                    color: "#888",
                    cursor: "pointer",
                  }}
                >
                  <option value="pinyin">拼音</option>
                  <option value="label">标签</option>
                </select>
              )}
            </div>
            {isContactsOpen &&
              groupedFriends.map((group) => (
                <div key={group.title}>
                  <div
                    style={{
                      padding: "2px 35px",
                      fontSize: "12px",
                      color: "#999",
                      backgroundColor: "#eaeaea",
                    }}
                  >
                    {group.title}
                  </div>
                  {group.list.map((friend) => (
                    <div
                      key={friend.userId}
                      onClick={() => setSelectedId(friend.userId)}
                      style={{
                        padding: "10px 35px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        backgroundColor:
                          selectedId === `friend_${friend.userId}`
                            ? "#c5c5c5"
                            : "transparent",
                      }}
                    >
                      <img
                        src={friend.avatar}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "4px",
                          marginRight: 10,
                        }}
                        alt="avatar"
                      />
                      <span style={{ fontSize: "14px" }}>
                        {friend.remark || friend.username}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FriendList;
