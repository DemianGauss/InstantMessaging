import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NewRoomModal } from "./components/NewRoomModal/NewRoomModal";
import { RoomsListPanel } from "./components/RoomsListPanel/RoomsListPanel";
import styles from "./ChatLayout.module.css";

export function ChatLayout() {
  const [showNewRoom, setShowNewRoom] = useState(false);

  return (
    <div className={styles.shell}>
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

      <RoomsListPanel onOpenNewRoom={() => setShowNewRoom(true)} />

      <section className={styles.content}>
        <Outlet />
      </section>

      {showNewRoom && (
        <NewRoomModal onClose={() => setShowNewRoom(false)} />
      )}
    </div>
  );
}
