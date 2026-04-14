import { Outlet } from "react-router-dom";
import { RoomsListPanel } from "./components/RoomsListPanel/RoomsListPanel";
import styles from "./ChatLayout.module.css";

export function ChatLayout() {
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

      <RoomsListPanel />

      <section className={styles.content}>
        <Outlet />
      </section>
    </div>
  );
}
