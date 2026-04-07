import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../auth-store";
import http from "../../../shared/http";

/**
 * 定义后端错误响应的结构，避免使用 any
 */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setError("请输入用户名和密码");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      /**
       * 1. 真实后端验证阶段
       */
      const response = await http.post("/api/auth/login/", {
        username: cleanUser,
        password: password,
      });

      const { token, user } = response.data;

      /**
       * 2. 状态更新阶段
       */
      await login(token, user);

      // 3. 跳转到聊天列表首页
      navigate("/");
    } catch (err) {
      /**
       * 4. 修复 ESLint Unexpected any 报错
       * 使用接口断言代替 any，既安全又符合规范
       */
      const apiError = err as ApiError;
      const serverMessage = apiError.response?.data?.message;
      setError(
        serverMessage || apiError.message || "登录失败，请检查网络或账号密码",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-500 p-4">
      <section className="w-full max-w-md p-8 bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          WeChat2
        </h1>
        <p className="text-white/80 text-center mb-8 text-sm">
          请输入你的凭证进入工作区
        </p>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-white text-sm ml-1">用户名</label>
            <input
              type="text"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="请输入用户名"
            />
          </div>

          <div className="space-y-2">
            <label className="text-white text-sm ml-1">密码</label>
            <input
              type="password"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-white/40 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="请输入密码"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 text-sm p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            disabled={submitting}
            type="submit"
            className="w-full bg-white text-blue-600 font-bold p-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
          >
            {submitting ? "正在验证..." : "登录系统"}
          </button>
        </form>

        <div className="mt-6 text-center text-white/70 text-sm">
          还没有账号？{" "}
          <Link
            to="/register"
            className="text-white font-bold hover:underline transition-all"
          >
            立即注册
          </Link>
        </div>
      </section>
    </main>
  );
}
