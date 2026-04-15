import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import styles from "./SettingsPage.module.css";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();

  // ── Username form ────────────────────────────────
  const [username, setUsername] = useState(user?.username ?? "");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "saving" | "ok" | "error"
  >("idle");
  const [usernameError, setUsernameError] = useState("");

  async function handleSaveUsername(e: FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError("请输入用户名");
      return;
    }
    if (trimmed === user?.username) {
      setUsernameError("用户名未更改");
      return;
    }
    setUsernameStatus("saving");
    setUsernameError("");
    try {
      await updateProfile({ username: trimmed });
      setUsernameStatus("ok");
      setTimeout(() => setUsernameStatus("idle"), 2500);
    } catch {
      setUsernameStatus("error");
      setUsernameError("保存失败，请稍后重试");
    }
  }

  // ── Avatar form ──────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? "");
  const [avatarStatus, setAvatarStatus] = useState<
    "idle" | "saving" | "ok" | "error"
  >("idle");
  const [avatarError, setAvatarError] = useState("");

  // Live preview — show current saved avatar when input is empty
  const previewSrc = avatarUrl.trim() || user?.avatar || "";

  async function handleSaveAvatar(e: FormEvent) {
    e.preventDefault();
    const trimmed = avatarUrl.trim();
    if (!trimmed) {
      setAvatarError("请输入头像链接");
      return;
    }
    if (trimmed === user?.avatar) {
      setAvatarError("头像未更改");
      return;
    }
    setAvatarStatus("saving");
    setAvatarError("");
    try {
      await updateProfile({ avatar: trimmed });
      setAvatarStatus("ok");
      setTimeout(() => setAvatarStatus("idle"), 2500);
    } catch {
      setAvatarStatus("error");
      setAvatarError("保存失败，请稍后重试");
    }
  }

  // ── Logout ───────────────────────────────────────
  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={styles.page}>
      <p className={styles.pageTitle}>个人设置</p>

      {/* ── Profile overview card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>当前资料</p>
        <div className={styles.profilePreview}>
          <div className={styles.avatarWrap}>
            <span className={styles.avatarGlow} aria-hidden />
            <img
              src={
                user?.avatar ||
                "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix"
              }
              alt="avatar"
              className={styles.avatar}
            />
          </div>
          <div className={styles.profileMeta}>
            <p className={styles.profileName}>{user?.username ?? "—"}</p>
            <p className={styles.profileSub}>{user?.email ?? "未设置邮箱"}</p>
          </div>
        </div>
      </div>

      {/* ── Change username card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>修改用户名</p>
        <form onSubmit={handleSaveUsername} noValidate>
          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="settings-username"
                className={styles.input}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameStatus("idle");
                  setUsernameError("");
                }}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="settings-username" className={styles.label}>
                新用户名
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          {usernameStatus === "ok" && (
            <p className={styles.success}>✓ 用户名已更新</p>
          )}
          {(usernameStatus === "error" || usernameError) && (
            <p className={styles.error}>⚠ {usernameError}</p>
          )}

          <button
            type="submit"
            className={styles.btn}
            disabled={usernameStatus === "saving"}
          >
            <span className={styles.btnChrome} aria-hidden />
            <span className={styles.btnText}>
              {usernameStatus === "saving" ? "保存中..." : "保存用户名"}
            </span>
          </button>
        </form>
      </div>

      {/* ── Change avatar card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>修改头像</p>
        <form onSubmit={handleSaveAvatar} noValidate>
          <div className={styles.avatarRow}>
            <div className={styles.field}>
              <div className={styles.fieldChrome}>
                <input
                  id="settings-avatar"
                  className={styles.input}
                  value={avatarUrl}
                  onChange={(e) => {
                    setAvatarUrl(e.target.value);
                    setAvatarStatus("idle");
                    setAvatarError("");
                  }}
                  placeholder=" "
                  autoComplete="off"
                />
                <label htmlFor="settings-avatar" className={styles.label}>
                  头像图片链接 (URL)
                </label>
                <span className={styles.hologram} aria-hidden />
              </div>
            </div>

            {previewSrc && (
              <div className={styles.avatarPreviewWrap}>
                <span className={styles.avatarPreviewGlow} aria-hidden />
                <img
                  src={previewSrc}
                  alt="头像预览"
                  className={styles.avatarPreview}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";
                  }}
                />
              </div>
            )}
          </div>

          {avatarStatus === "ok" && (
            <p className={styles.success} style={{ marginTop: 16 }}>
              ✓ 头像已更新
            </p>
          )}
          {(avatarStatus === "error" || avatarError) && (
            <p className={styles.error} style={{ marginTop: 16 }}>
              ⚠ {avatarError}
            </p>
          )}

          <button
            type="submit"
            className={styles.btn}
            disabled={avatarStatus === "saving"}
            style={{ marginTop: 20 }}
          >
            <span className={styles.btnChrome} aria-hidden />
            <span className={styles.btnText}>
              {avatarStatus === "saving" ? "保存中..." : "保存头像"}
            </span>
          </button>
        </form>
      </div>

      {/* ── Account card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>账号</p>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={handleLogout}
        >
          <span className={styles.btnChrome} aria-hidden />
          <span className={styles.btnText}>退出登录</span>
        </button>
      </div>
    </div>
  );
}
