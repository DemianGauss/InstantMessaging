import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import https from "../../../shared/https";
import styles from "./RegisterPage.module.css";
import type { ApiError } from "../../../shared/error";


export function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15 && cardRef.current) {
        const card = cardRef.current;
        card.style.filter = "hue-rotate(90deg) saturate(1.5)";
        card.style.transform = "translate(1px, -1px)";
        setTimeout(() => {
          card.style.filter = "";
          card.style.transform = "";
        }, 100);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function triggerSystemGlitch() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "translate(2px, -2px)";
    card.style.filter = "hue-rotate(300deg) contrast(1.2)";
    setTimeout(() => { card.style.transform = "translate(-2px, 2px)"; }, 100);
    setTimeout(() => { card.style.transform = ""; card.style.filter = ""; }, 200);
  }

  function validateUsername(): boolean {
    if (username.length < 1 || username.length > 12) {
      setUsernameError("用户名长度需在 1-12 位之间");
      return false;
    }
    setUsernameError("");
    return true;
  }

  function validatePassword(): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("至少6位，且包含字母和数字");
      return false;
    }
    setPasswordError("");
    return true;
  }

  function validateConfirm(): boolean {
    if (password !== confirmPassword) {
      setConfirmError("两次输入的密码不一致");
      return false;
    }
    setConfirmError("");
    return true;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    const usernameOk = validateUsername();
    const passwordOk = validatePassword();
    const confirmOk = validateConfirm();
    if (!usernameOk || !passwordOk || !confirmOk) {
      triggerSystemGlitch();
      return;
    }

    setSubmitting(true);
    try {
      await https.post("/api/auth/register/", { username, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const apiError = err as ApiError;
      const msg =
        apiError.response?.data?.message ||
        apiError.message ||
        "注册失败，请稍后再试";
      setUsernameError(msg);
      triggerSystemGlitch();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      {/* Animated background */}
      <div className={styles["retro-background"]}>
        <div className={styles["y2k-grid"]}>
          <div className={styles["grid-dots"]} />
          <div className={styles["scanner-lines"]}>
            <div className={`${styles["scan-line"]} ${styles["scan-1"]}`} />
            <div className={`${styles["scan-line"]} ${styles["scan-2"]}`} />
            <div className={`${styles["scan-line"]} ${styles["scan-3"]}`} />
          </div>
        </div>
        <div className={styles["floating-orbs"]}>
          <div className={`${styles["retro-orb"]} ${styles["orb-1"]}`} />
          <div className={`${styles["retro-orb"]} ${styles["orb-2"]}`} />
          <div className={`${styles["retro-orb"]} ${styles["orb-3"]}`} />
        </div>
      </div>

      {/* Card */}
      <div className={styles["login-container"]}>
        <div className={styles["future-card"]} ref={cardRef}>

          {/* Header */}
          <div className={styles["chrome-header"]}>
            <div className={styles["retro-logo"]}>
              <div className={styles["logo-chrome"]}>
                <div className={styles["chrome-inner"]}>
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="16" stroke="url(#retroGradR)" strokeWidth="2" />
                    <circle cx="18" cy="18" r="10" fill="url(#chromeGradR)" />
                    <circle cx="18" cy="18" r="6"  fill="url(#centerGradR)" />
                    <defs>
                      <linearGradient id="retroGradR" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   style={{ stopColor: "#ff00ff" }} />
                        <stop offset="50%"  style={{ stopColor: "#00ffff" }} />
                        <stop offset="100%" style={{ stopColor: "#ffff00" }} />
                      </linearGradient>
                      <radialGradient id="chromeGradR">
                        <stop offset="0%"   style={{ stopColor: "#e6e6fa" }} />
                        <stop offset="100%" style={{ stopColor: "#c0c0ff" }} />
                      </radialGradient>
                      <radialGradient id="centerGradR">
                        <stop offset="0%"   style={{ stopColor: "#ffffff" }} />
                        <stop offset="100%" style={{ stopColor: "#f0f0ff" }} />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>
                <div className={styles["chrome-glow"]} />
              </div>
            </div>
            <h1 className={styles["y2k-title"]}>
              <span className={styles["title-chrome"]}>WECHAT</span>
              <span className={styles["title-neon"]}>2</span>
            </h1>
            <p className={styles["retro-subtitle"]}>创建你的账号</p>
          </div>

          {success ? (
            <div className={styles["retro-success"]}>
              <div className={styles["success-portal"]}>
                <div className={styles["portal-rings"]}>
                  <div className={`${styles["portal-ring"]} ${styles["ring-1"]}`} />
                  <div className={`${styles["portal-ring"]} ${styles["ring-2"]}`} />
                  <div className={`${styles["portal-ring"]} ${styles["ring-3"]}`} />
                  <div className={`${styles["portal-ring"]} ${styles["ring-4"]}`} />
                </div>
                <div className={styles["success-core"]}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M10 16l6 6 12-12" stroke="url(#successGradR)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <defs>
                      <linearGradient id="successGradR">
                        <stop offset="0%"   style={{ stopColor: "#00ffff" }} />
                        <stop offset="50%"  style={{ stopColor: "#ff00ff" }} />
                        <stop offset="100%" style={{ stopColor: "#ffff00" }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className={styles["success-title"]}>注册成功！</h3>
              <p className={styles["success-desc"]}>正在跳转到登录页面...</p>
            </div>
          ) : (
            <>
              <form onSubmit={onSubmit} noValidate>
                {/* Username */}
                <div className={`${styles["retro-field"]} ${usernameError ? styles.error : ""}`}>
                  <div className={styles["field-chrome"]}>
                    <div className={styles["chrome-border"]} />
                    <input
                      type="text"
                      id="reg-username"
                      value={username}
                      onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
                      onBlur={validateUsername}
                      autoComplete="username"
                      placeholder=" "
                    />
                    <label htmlFor="reg-username">用户名</label>
                    <div className={styles["field-hologram"]} />
                  </div>
                  <span className={`${styles["retro-error"]} ${usernameError ? styles.show : ""}`}>
                    {usernameError}
                  </span>
                </div>

                {/* Password */}
                <div className={`${styles["retro-field"]} ${passwordError ? styles.error : ""}`}>
                  <div className={styles["field-chrome"]}>
                    <div className={styles["chrome-border"]} />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="reg-password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                      onBlur={validatePassword}
                      autoComplete="new-password"
                      placeholder=" "
                    />
                    <label htmlFor="reg-password">密码</label>
                    <button
                      type="button"
                      className={`${styles["retro-toggle"]} ${showPassword ? styles["toggle-active"] : ""}`}
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label="切换密码可见性"
                    >
                      <div className={styles["toggle-chrome"]}>
                        <svg className={styles["eye-future"]} width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 3C6 3 2.5 6.5 1 10c1.5 3.5 5 7 9 7s7.5-3.5 9-7c-1.5-3.5-5-7-9-7z" stroke="url(#eyeGradR)" strokeWidth="1.5" fill="none" />
                          <circle cx="10" cy="10" r="3" stroke="url(#eyeGradR)" strokeWidth="1.5" fill="none" />
                          <defs>
                            <linearGradient id="eyeGradR">
                              <stop offset="0%"   style={{ stopColor: "#00ffff" }} />
                              <stop offset="100%" style={{ stopColor: "#ff00ff" }} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <svg className={styles["eye-hidden"]} width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7" stroke="url(#eyeHiddenGradR)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <defs>
                            <linearGradient id="eyeHiddenGradR">
                              <stop offset="0%"   style={{ stopColor: "#ff00ff" }} />
                              <stop offset="100%" style={{ stopColor: "#ffff00" }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </button>
                    <div className={styles["field-hologram"]} />
                  </div>
                  <span className={`${styles["retro-error"]} ${passwordError ? styles.show : ""}`}>
                    {passwordError}
                  </span>
                </div>

                {/* Confirm Password */}
                <div className={`${styles["retro-field"]} ${confirmError ? styles.error : ""}`}>
                  <div className={styles["field-chrome"]}>
                    <div className={styles["chrome-border"]} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      id="reg-confirm"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                      onBlur={validateConfirm}
                      autoComplete="new-password"
                      placeholder=" "
                    />
                    <label htmlFor="reg-confirm">确认密码</label>
                    <button
                      type="button"
                      className={`${styles["retro-toggle"]} ${showConfirm ? styles["toggle-active"] : ""}`}
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label="切换确认密码可见性"
                    >
                      <div className={styles["toggle-chrome"]}>
                        <svg className={styles["eye-future"]} width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 3C6 3 2.5 6.5 1 10c1.5 3.5 5 7 9 7s7.5-3.5 9-7c-1.5-3.5-5-7-9-7z" stroke="url(#eyeGradR2)" strokeWidth="1.5" fill="none" />
                          <circle cx="10" cy="10" r="3" stroke="url(#eyeGradR2)" strokeWidth="1.5" fill="none" />
                          <defs>
                            <linearGradient id="eyeGradR2">
                              <stop offset="0%"   style={{ stopColor: "#00ffff" }} />
                              <stop offset="100%" style={{ stopColor: "#ff00ff" }} />
                            </linearGradient>
                          </defs>
                        </svg>
                        <svg className={styles["eye-hidden"]} width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7" stroke="url(#eyeHiddenGradR2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <defs>
                            <linearGradient id="eyeHiddenGradR2">
                              <stop offset="0%"   style={{ stopColor: "#ff00ff" }} />
                              <stop offset="100%" style={{ stopColor: "#ffff00" }} />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </button>
                    <div className={styles["field-hologram"]} />
                  </div>
                  <span className={`${styles["retro-error"]} ${confirmError ? styles.show : ""}`}>
                    {confirmError}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`${styles["retro-button"]} ${submitting ? styles.loading : ""}`}
                >
                  <div className={styles["button-chrome"]} />
                  <span className={styles["button-text"]}>立即注册</span>
                  <div className={styles["button-loader"]}>
                    <div className={styles["y2k-spinner"]}>
                      <div className={`${styles["spinner-ring"]} ${styles["ring-1"]}`} />
                      <div className={`${styles["spinner-ring"]} ${styles["ring-2"]}`} />
                      <div className={`${styles["spinner-ring"]} ${styles["ring-3"]}`} />
                    </div>
                  </div>
                  <div className={styles["button-hologram"]} />
                </button>
              </form>

              <div className={styles["future-signup"]}>
                <span className={styles["signup-text"]}>已有账号？</span>
                <Link to="/login" className={styles["future-link"]}>
                  直接登录
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
