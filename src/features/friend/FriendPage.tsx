import React, { useEffect } from "react";
import { useFriendStore } from "./store/useFriendStore";
import FriendList from "./components/FriendList";
import { UserDetail } from "./components/UserDetail";
import { ContactManager } from "./components/ContactManager";
import styles from "./FriendPage.module.css";

export const FriendPage: React.FC = () => {
  const { fetchFriends, selectedId } = useFriendStore();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const renderRightContent = () => {
    if (typeof selectedId === "number") return <UserDetail />;
    if (selectedId === "contactManager") return <ContactManager />;
    return (
      <div className={styles.emptyState}>
        <img src="/favicon.svg" alt="logo" className={styles.emptyLogo} />
      </div>
    );
  };

  return (
    <div className={styles.shell}>
      {/* Ambient background */}
      <div className={styles.background} aria-hidden>
        <div className={styles.grid} />
        <div className={styles.scanLines}>
          <div className={`${styles.scanLine} ${styles.scan1}`} />
          <div className={`${styles.scanLine} ${styles.scan2}`} />
          <div className={`${styles.scanLine} ${styles.scan3}`} />
        </div>
        <div className={styles.orbs}>
          <div className={`${styles.orb} ${styles.orb1}`} />
          <div className={`${styles.orb} ${styles.orb2}`} />
          <div className={`${styles.orb} ${styles.orb3}`} />
        </div>
      </div>

      <div className={styles.leftPanel}>
        <FriendList />
      </div>

      <div className={styles.rightPanel}>
        {renderRightContent()}
      </div>
    </div>
  );
};
