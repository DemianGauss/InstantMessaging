import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import https from "../../shared/https";
import { CropModal } from "./CropModal";
import styles from "./SettingsPage.module.css";

type AvailStatus = "idle" | "checking" | "ok" | "taken" | "error";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();

  // ── Avatar / file upload ─────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  function handlePickFile() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so the same file can be picked again
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth === img.naturalHeight) {
        applyAvatar(objectUrl, () => URL.revokeObjectURL(objectUrl));
      } else {
        setCropSrc(objectUrl);
      }
    };
    img.src = objectUrl;
  }

  async function applyAvatar(dataUrl: string, cleanup?: () => void) {
    setAvatarSaving(true);
    try {
      await updateProfile({ avatar: dataUrl });
    } finally {
      setAvatarSaving(false);
      cleanup?.();
    }
  }

  function handleCropConfirm(dataUrl: string) {
    const src = cropSrc;
    setCropSrc(null);
    applyAvatar(dataUrl, () => { if (src) URL.revokeObjectURL(src); });
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  }

  // ── Username change ──────────────────────────────────────
  const [newUsername, setNewUsername] = useState("");
  const [repeatUsername, setRepeatUsername] = useState("");
  const [availStatus, setAvailStatus] = useState<AvailStatus>("idle");
  const [usernameSaveStatus, setUsernameSaveStatus] = useState<
    "idle" | "saving" | "ok" | "error"
  >("idle");
  const [usernameError, setUsernameError] = useState("");

  // Debounced availability check
  useEffect(() => {
    const trimmed = newUsername.trim();
    if (!trimmed || trimmed === user?.username) {
      setAvailStatus("idle");
      return;
    }
    setAvailStatus("checking");
    const timer = setTimeout(async () => {
      try {
        await https.get(`/api/user/check-username?username=${encodeURIComponent(trimmed)}`);
        setAvailStatus("ok");
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } }).response?.status;
        setAvailStatus(status === 409 ? "taken" : "error");
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [newUsername, user?.username]);

  async function handleSaveUsername(e: FormEvent) {
    e.preventDefault();
    const trimmed = newUsername.trim();
    if (!trimmed) { setUsernameError("请输入新用户名"); return; }
    if (trimmed !== repeatUsername.trim()) { setUsernameError("两次输入不一致"); return; }
    if (availStatus === "taken") { setUsernameError("用户名已被占用"); return; }
    if (availStatus === "checking") { setUsernameError("正在检查可用性，请稍候"); return; }

    setUsernameSaveStatus("saving");
    setUsernameError("");
    try {
      await updateProfile({ username: trimmed });
      setUsernameSaveStatus("ok");
      setNewUsername("");
      setRepeatUsername("");
      setAvailStatus("idle");
      setTimeout(() => setUsernameSaveStatus("idle"), 2500);
    } catch {
      setUsernameSaveStatus("error");
      setUsernameError("保存失败，请稍后重试");
    }
  }

  // ── Logout ───────────────────────────────────────────────
  function handleLogout() {
    logout();
    navigate("/login");
  }

  const avatarSrc =
    user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";

  return (
    <div className={styles.page}>
      <p className={styles.pageTitle}>个人设置</p>

      {/* ── Profile header card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>当前资料</p>
        <div className={styles.profileRow}>
          <button
            type="button"
            className={styles.avatarWrap}
            onClick={handlePickFile}
            disabled={avatarSaving}
            title="点击更换头像"
          >
            <span className={styles.avatarGlow} aria-hidden />
            <img src={avatarSrc} alt="avatar" className={styles.avatar} />
            <div className={styles.avatarOverlay}>
              {avatarSaving ? "…" : "更换"}
            </div>
          </button>
          <div className={styles.profileMeta}>
            <p className={styles.profileName}>{user?.username ?? "—"}</p>
            <p className={styles.profileEmail}>{user?.email ?? "未设置邮箱"}</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />
      </div>

      {/* ── Change username card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>修改用户名</p>
        <form onSubmit={handleSaveUsername} noValidate>
          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="new-username"
                className={styles.input}
                value={newUsername}
                onChange={(e) => {
                  setNewUsername(e.target.value);
                  setUsernameSaveStatus("idle");
                  setUsernameError("");
                }}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="new-username" className={styles.label}>
                输入新用户名
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
            {availStatus === "checking" && <p className={styles.availChecking}>检查中…</p>}
            {availStatus === "ok"       && <p className={styles.availOk}>✓ 用户名可用</p>}
            {availStatus === "taken"    && <p className={styles.availTaken}>✗ 用户名已被占用</p>}
          </div>

          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="repeat-username"
                className={styles.input}
                value={repeatUsername}
                onChange={(e) => {
                  setRepeatUsername(e.target.value);
                  setUsernameSaveStatus("idle");
                  setUsernameError("");
                }}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="repeat-username" className={styles.label}>
                重复新用户名
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          {usernameSaveStatus === "ok" && (
            <p className={styles.success}>✓ 用户名已更新</p>
          )}
          {(usernameSaveStatus === "error" || usernameError) && (
            <p className={styles.error}>⚠ {usernameError}</p>
          )}

          <button
            type="submit"
            className={styles.btn}
            disabled={usernameSaveStatus === "saving" || availStatus === "taken"}
          >
            <span className={styles.btnChrome} aria-hidden />
            <span className={styles.btnText}>
              {usernameSaveStatus === "saving" ? "保存中…" : "保存用户名"}
            </span>
          </button>
        </form>
      </div>

      {/* ── Account card ── */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>账号</p>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          退出登录
        </button>
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
