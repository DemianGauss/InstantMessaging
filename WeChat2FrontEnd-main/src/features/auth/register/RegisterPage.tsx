import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import http from "../../../shared/http";
import styles from "./RegisterPage.module.css";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 格式要求
    if (username.length < 1 || username.length > 12) {
      setError("用户名长度需在 1-12 位之间");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError("密码至少6位，且包含字母和数字");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    try {
      // 调用后端接口
      await http.post("/api/auth/register/", { username, password });
      alert("注册成功！");
      navigate("/login"); // 注册成功后跳转到登录
    } catch (err) {
      setError((err as Error).message || "注册失败，请稍后再试");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.bgDecor1}></div>
      <div className={styles.bgDecor2}></div>

      <div className={styles.registerCard}>
        <header className={styles.registerHeader}>
          <div className={styles.logoPlaceholder}></div>
          <h1>创建账号</h1>
          <p>体验全新的 we-wechat 智能协作</p>
        </header>

        <form onSubmit={handleRegister} className={styles.registerForm}>
          <div className={styles.inputGroup}>
            <label>用户账号</label>
            <input
              type="text"
              placeholder="设置 1-12 位用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>密码</label>
            <input
              type="password"
              placeholder="至少6位字母与数字"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>确认密码</label>
            <input
              type="password"
              placeholder="再次确认您的密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button type="submit" className={styles.submitBtn}>
            立即创建账号
          </button>
        </form>

        <footer className={styles.registerFooter}>
          已有账号了？ <Link to="/login">直接登录</Link>
        </footer>
      </div>
    </div>
  );
}
