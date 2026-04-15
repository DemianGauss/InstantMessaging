import React, { useState, useMemo, useEffect } from "react";
import { useFriendStore, type Friend } from "../store/useFriendStore";
import styles from "./FriendList.module.css";

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

  const [isNewFriendsOpen, setIsNewFriendsOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(true);
  const [contactsMode, setContactsMode] = useState<ContactsMode>("pinyin");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = keyword.trim();
      if (value) searchUsers(value);
      else clearSearchResults();
    }
  };

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
        key = (friend.remark || friend.username).charAt(0).toUpperCase();
        if (!/[A-Z]/.test(key)) key = "#";
      } else {
        key = friend.labelName || "未分组";
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(friend);
    });
    return Object.keys(groups)
      .sort()
      .map((key) => ({ title: key, list: groups[key] }));
  }, [friends, contactsMode]);

  return (
    <div className={styles.panel}>
      {/* Search */}
      <div className={styles.searchRow}>
        <div className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            placeholder="搜索用户"
            value={keyword}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <span className={styles.searchHologram} aria-hidden />
        </div>
      </div>

      <div className={styles.scrollArea}>
        {keyword.trim() ? (
          /* Search results */
          <>
            <p className={styles.stateText}>搜索结果</p>
            {searchResults.map((user) => (
              <div
                key={user.userId}
                className={`${styles.item} ${
                  selectedId === user.userId ? styles.itemActive : ""
                }`}
                onClick={() => setSelectedId(user.userId)}
              >
                <div className={styles.avatarWrap}>
                  <span className={styles.avatarGlow} aria-hidden />
                  <img src={user.avatar} className={styles.avatar} alt="avatar" />
                </div>
                <div className={styles.itemBody}>
                  <span className={styles.itemName}>{user.username}</span>
                </div>
                <span className={styles.addTag}>添加</span>
              </div>
            ))}
            {searchResults.length === 0 && (
              <p className={styles.stateText}>未找到相关用户</p>
            )}
          </>
        ) : (
          /* Normal list */
          <>
            {/* Contact manager */}
            <div
              className={`${styles.managerBtn} ${
                selectedId === "contactManager" ? styles.managerBtnActive : ""
              }`}
              onClick={() => setSelectedId("contactManager")}
            >
              <span>👤</span> 通讯录管理
            </div>

            <div className={styles.sectionDivider} />

            {/* Friend requests */}
            <div
              className={styles.sectionHeader}
              onClick={() => setIsNewFriendsOpen(!isNewFriendsOpen)}
            >
              <span className={`${styles.arrow} ${isNewFriendsOpen ? styles.arrowOpen : ""}`}>▶</span>
              <span style={{ flex: 1 }}>好友申请</span>
              {requests.length > 0 && (
                <span className={styles.badge}>{requests.length}</span>
              )}
            </div>

            {isNewFriendsOpen && (
              <>
                {sortedRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className={`${styles.item} ${
                      selectedId === req.sender.userId ? styles.itemActive : ""
                    }`}
                    onClick={() => setSelectedId(req.sender.userId)}
                  >
                    <div className={styles.avatarWrap}>
                      <span className={styles.avatarGlow} aria-hidden />
                      <img src={req.sender.avatar} className={styles.avatar} alt="avatar" />
                    </div>
                    <div className={styles.itemBody}>
                      <span className={styles.itemName}>{req.sender.username}</span>
                      <span className={styles.itemSub}>{req.applyMsg}</span>
                    </div>
                  </div>
                ))}
                <div className={styles.sectionDivider} />
              </>
            )}

            {/* Contacts */}
            <div className={styles.sectionHeaderRow}>
              <div
                className={styles.sectionHeader}
                style={{ flex: 1 }}
                onClick={() => setIsContactsOpen(!isContactsOpen)}
              >
                <span className={`${styles.arrow} ${isContactsOpen ? styles.arrowOpen : ""}`}>▶</span>
                联系人
                <span className={styles.friendCount}>{friends.length}</span>
              </div>
              {isContactsOpen && (
                <select
                  className={styles.modeSelect}
                  value={contactsMode}
                  onChange={(e) => setContactsMode(e.target.value as ContactsMode)}
                >
                  <option value="pinyin">拼音</option>
                  <option value="label">标签</option>
                </select>
              )}
            </div>

            {isContactsOpen &&
              groupedFriends.map((group) => (
                <div key={group.title}>
                  <div className={styles.groupLabel}>{group.title}</div>
                  {group.list.map((friend) => (
                    <div
                      key={friend.userId}
                      className={`${styles.item} ${
                        selectedId === `friend_${friend.userId}` ? styles.itemActive : ""
                      }`}
                      onClick={() => setSelectedId(friend.userId)}
                    >
                      <div className={styles.avatarWrap}>
                        <span className={styles.avatarGlow} aria-hidden />
                        <img src={friend.avatar} className={styles.avatar} alt="avatar" />
                      </div>
                      <div className={styles.itemBody}>
                        <span className={styles.itemName}>
                          {friend.remark || friend.username}
                        </span>
                      </div>
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
