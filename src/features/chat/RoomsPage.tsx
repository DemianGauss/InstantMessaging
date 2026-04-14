import { useAuthStore } from "../auth/auth-store";
import styles from "./RoomsPage.module.css";

export function RoomsPage() {
  const { user } = useAuthStore();

  return (
    <div className={styles.page}>
      <div className={styles.welcomeCard}>
        <div className={styles.logo}>
          <span className={styles.logoGlow} aria-hidden />
          <span className={styles.logoInner}>💬</span>
        </div>
        <h1 className={styles.title}>
          <span className={styles.titleChrome}>聊天</span>
          <span className={styles.titleNeon}>大厅</span>
        </h1>
        <p className={styles.subtitle}>欢迎回来 · {user?.username ?? "旅行者"}</p>
        <p className={styles.hint}>从左侧选择聊天，或点击 + 创建新群聊</p>
      </div>
    </div>
  );
}
