import {
  useState,
  useRef,
  useEffect,
  type KeyboardEvent,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../auth/auth-store";
import https from "../../../shared/https";
import styles from "./MainPage.module.css";

// ── Types ────────────────────────────────────────────────────

interface ApiUser {
  id: number;
  username: string;
  avatar?: string;
}

interface ApiMessage {
  id: number;
  content: string;
  sender: ApiUser;
  created_at: string;
}

interface ApiRoom {
  id: number;
  name: string;
  room_type: "dm" | "group";
  participants: ApiUser[];
  last_message?: ApiMessage;
  pinned?: boolean;
  unread_count?: number;
}

interface Paginated<T> {
  results: T[];
  count: number;
}

// ── API helpers ──────────────────────────────────────────────

const api = {
  rooms: () => https.get<Paginated<ApiRoom>>("/api/v1/chat/rooms/"),
  messages: (roomId: number) =>
    https.get<Paginated<ApiMessage>>(`/api/v1/chat/rooms/${roomId}/messages/`),
  send: (roomId: number, content: string) =>
    https.post<ApiMessage>(`/api/v1/chat/rooms/${roomId}/messages/`, {
      content,
    }),
  updateProfile: (data: { username?: string; password?: string }) =>
    https.patch("/api/auth/profile/", data),
};

// ── Design helpers ───────────────────────────────────────────

const GRADIENTS = [
  "linear-gradient(135deg,#ff00ff,#8800ff)",
  "linear-gradient(135deg,#00ffff,#0077cc)",
  "linear-gradient(135deg,#ffff00,#ff8800)",
  "linear-gradient(135deg,#ff4da6,#cc0044)",
  "linear-gradient(135deg,#00ff88,#00cccc)",
  "linear-gradient(135deg,#aa3bff,#ff00cc)",
];

const avatarGrad = (id: number) => GRADIENTS[Math.abs(id) % GRADIENTS.length];
const initial = (name: string) => (name ?? "?").charAt(0).toUpperCase();

function fmtTime(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 86_400_000)
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86_400_000)
    return ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

type Tab = "chats" | "contacts" | "settings";

// ── Main component ───────────────────────────────────────────

export function MainPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();

  const [tab, setTab] = useState<Tab>("chats");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [search, setSearch] = useState("");

  // profile form
  const [pUsername, setPUsername] = useState(user?.username ?? "");
  const [pPassword, setPPassword] = useState("");
  const [pConfirm, setPConfirm] = useState("");
  const [pFeedback, setPFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [pSaving, setPSaving] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // ── Data queries ──

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => api.rooms().then((r) => r.data.results),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => api.messages(roomId!).then((r) => r.data.results),
    enabled: roomId !== null,
  });

  const sendMut = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) =>
      api.send(id, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", roomId] });
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setMsgText("");
      textRef.current?.focus();
    },
  });

  // ── Derived ──

  const filtered = rooms
    .filter((r) =>
      search
        ? r.name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      const ta = a.last_message
        ? new Date(a.last_message.created_at).getTime()
        : 0;
      const tb = b.last_message
        ? new Date(b.last_message.created_at).getTime()
        : 0;
      return tb - ta;
    });

  const selectedRoom = rooms.find((r) => r.id === roomId) ?? null;
  const totalUnread = rooms.reduce((s, r) => s + (r.unread_count ?? 0), 0);

  // ── Effects ──

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, roomId]);

  useEffect(() => {
    if (showProfile) {
      setPUsername(user?.username ?? "");
      setPPassword("");
      setPConfirm("");
      setPFeedback(null);
    }
  }, [showProfile, user?.username]);

  // ── Handlers ──

  function handleSend() {
    const text = msgText.trim();
    if (!text || !roomId) return;
    sendMut.mutate({ id: roomId, text });
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    if (pPassword && pPassword !== pConfirm) {
      setPFeedback({ ok: false, text: "两次密码不一致" });
      return;
    }
    setPSaving(true);
    try {
      await api.updateProfile({
        ...(pUsername !== user?.username ? { username: pUsername } : {}),
        ...(pPassword ? { password: pPassword } : {}),
      });
      setPFeedback({ ok: true, text: "保存成功！" });
      setTimeout(() => {
        setPFeedback(null);
        setShowProfile(false);
      }, 1500);
    } catch {
      setPFeedback({ ok: false, text: "保存失败，请重试" });
    } finally {
      setPSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className={styles.root}>
      {/* Animated background */}
      <div className={styles.bg}>
        <div className={styles.bgDots} />
        <div className={styles.bgGlow1} />
        <div className={styles.bgGlow2} />
      </div>

      <div className={styles.shell}>
        {/* ── 1. Icon rail ── */}
        <nav className={styles.rail}>
          {/* Profile / avatar button */}
          <button
            className={styles.profileBtn}
            onClick={() => setShowProfile(true)}
            title="个人信息"
          >
            <div
              className={styles.profileAvatarSmall}
              style={{ background: avatarGrad(user?.id ?? 0) }}
            >
              {initial(user?.username ?? "U")}
            </div>
            <div className={styles.profileRingGlow} />
          </button>

          {/* Top nav */}
          <div className={styles.railTop}>
            <RailBtn
              active={tab === "chats"}
              onClick={() => setTab("chats")}
              label="消息"
              badge={totalUnread || undefined}
              title="消息"
            >
              <IconChat />
            </RailBtn>
            <RailBtn
              active={tab === "contacts"}
              onClick={() => setTab("contacts")}
              label="联系人"
              title="联系人"
            >
              <IconContacts />
            </RailBtn>
          </div>

          {/* Bottom nav */}
          <div className={styles.railBottom}>
            <RailBtn
              active={tab === "settings"}
              onClick={() => setTab("settings")}
              label="设置"
              title="设置"
            >
              <IconSettings />
            </RailBtn>
            <RailBtn
              active={false}
              onClick={handleLogout}
              label="退出"
              title="退出登录"
            >
              <IconLogout />
            </RailBtn>
          </div>
        </nav>

        {/* ── 2. Side panel ── */}
        <aside className={styles.panel}>
          {tab === "chats" && (
            <>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>消息</h2>
                <button className={styles.iconBtn} title="新建聊天">
                  <IconPlus />
                </button>
              </div>
              <div className={styles.searchWrap}>
                <IconSearch className={styles.searchIco} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="搜索"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.chatList}>
                {filtered.map((room) => {
                  const lastTime = room.last_message
                    ? fmtTime(room.last_message.created_at)
                    : "";
                  return (
                    <button
                      key={room.id}
                      className={`${styles.chatItem} ${roomId === room.id ? styles.chatItemActive : ""}`}
                      onClick={() => setRoomId(room.id)}
                    >
                      <div
                        className={styles.itemAvatar}
                        style={{ background: avatarGrad(room.id) }}
                      >
                        {room.room_type === "group" ? (
                          <IconGroup />
                        ) : (
                          initial(room.name)
                        )}
                      </div>
                      <div className={styles.itemInfo}>
                        <div className={styles.itemRow1}>
                          <span className={styles.itemName}>
                            {room.pinned && (
                              <span className={styles.pinMark}>📌 </span>
                            )}
                            {room.name}
                          </span>
                          <span className={styles.itemTime}>{lastTime}</span>
                        </div>
                        <div className={styles.itemRow2}>
                          <span className={styles.itemPreview}>
                            {room.last_message?.content ?? "暂无消息"}
                          </span>
                          {(room.unread_count ?? 0) > 0 && (
                            <span className={styles.badge}>
                              {room.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && (
                  <p className={styles.emptyHint}>
                    {search ? "无匹配结果" : "暂无会话"}
                  </p>
                )}
              </div>
            </>
          )}

          {tab === "contacts" && (
            <>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>联系人</h2>
              </div>
              <div className={styles.searchWrap}>
                <IconSearch className={styles.searchIco} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="搜索联系人"
                />
              </div>
              <div className={styles.chatList}>
                {Array.from(
                  new Map(
                    rooms
                      .flatMap((r) => r.participants)
                      .filter((p) => p.id !== user?.id)
                      .map((p) => [p.id, p])
                  ).values()
                ).map((p) => (
                  <div key={p.id} className={styles.contactItem}>
                    <div
                      className={styles.itemAvatar}
                      style={{ background: avatarGrad(p.id) }}
                    >
                      {initial(p.username)}
                    </div>
                    <span className={styles.contactName}>{p.username}</span>
                  </div>
                ))}
                {rooms.length === 0 && (
                  <p className={styles.emptyHint}>暂无联系人</p>
                )}
              </div>
            </>
          )}

          {tab === "settings" && (
            <>
              <div className={styles.panelHead}>
                <h2 className={styles.panelTitle}>设置</h2>
              </div>
              <div className={styles.settingsList}>
                {[
                  { label: "个人信息", onClick: () => setShowProfile(true) },
                  { label: "通知设置", onClick: () => {} },
                  { label: "隐私设置", onClick: () => {} },
                  { label: "账号安全", onClick: () => {} },
                  { label: "退出登录", onClick: handleLogout },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={styles.settingItem}
                    onClick={item.onClick}
                  >
                    <span>{item.label}</span>
                    <IconChevron />
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        {/* ── 3. Chat area ── */}
        <main className={styles.chat}>
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className={styles.chatHead}>
                <div className={styles.chatHeadLeft}>
                  <div
                    className={styles.chatHeadAvatar}
                    style={{ background: avatarGrad(selectedRoom.id) }}
                  >
                    {selectedRoom.room_type === "group" ? (
                      <IconGroup />
                    ) : (
                      initial(selectedRoom.name)
                    )}
                  </div>
                  <div>
                    <p className={styles.chatHeadName}>{selectedRoom.name}</p>
                    <p className={styles.chatHeadSub}>
                      {selectedRoom.room_type === "group"
                        ? `${selectedRoom.participants.length} 名成员`
                        : "私聊"}
                    </p>
                  </div>
                </div>
                <div className={styles.chatHeadRight}>
                  <button className={styles.iconBtn} title="视频通话">
                    <IconVideo />
                  </button>
                  <button className={styles.iconBtn} title="更多">
                    <IconMore />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className={styles.msgList}>
                {messages.map((msg) => {
                  const own = msg.sender.id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`${styles.msgRow} ${own ? styles.msgRowOwn : styles.msgRowOther}`}
                    >
                      {!own && (
                        <div
                          className={styles.msgAvatarSmall}
                          style={{ background: avatarGrad(msg.sender.id) }}
                        >
                          {initial(msg.sender.username)}
                        </div>
                      )}
                      <div className={styles.msgContent}>
                        {!own && selectedRoom.room_type === "group" && (
                          <p className={styles.msgSender}>
                            {msg.sender.username}
                          </p>
                        )}
                        <div
                          className={`${styles.bubble} ${own ? styles.bubbleOwn : styles.bubbleOther}`}
                        >
                          {msg.content}
                        </div>
                        <p
                          className={`${styles.msgTime} ${own ? styles.msgTimeOwn : ""}`}
                        >
                          {fmtTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <p className={styles.emptyHint} style={{ textAlign: "center", marginTop: 40 }}>
                    暂无消息，发送第一条消息吧
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className={styles.inputArea}>
                <div className={styles.inputToolbar}>
                  <button className={styles.toolbarBtn} title="表情">
                    <IconEmoji />
                  </button>
                  <button className={styles.toolbarBtn} title="图片">
                    <IconImage />
                  </button>
                  <button className={styles.toolbarBtn} title="文件">
                    <IconAttach />
                  </button>
                </div>
                <div className={styles.inputRow}>
                  <textarea
                    ref={textRef}
                    className={styles.textarea}
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="输入消息… (Enter 发送，Shift+Enter 换行)"
                    rows={1}
                  />
                  <button
                    className={`${styles.sendBtn} ${msgText.trim() ? styles.sendBtnOn : ""}`}
                    onClick={handleSend}
                    disabled={!msgText.trim() || sendMut.isPending}
                  >
                    <span className={styles.sendGlow} />
                    <span className={styles.sendLabel}>发送</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyOrb}>
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="url(#emG)"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <path
                    d="M22 36c0-7.732 6.268-14 14-14h8c7.732 0 14 6.268 14 14 0 5.13-2.763 9.613-6.862 12.07L54 58H28c-3.314 0-6-2.686-6-6V36z"
                    stroke="url(#emG)"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient
                      id="emG"
                      x1="0"
                      y1="0"
                      x2="80"
                      y2="80"
                    >
                      <stop stopColor="#ff00ff" />
                      <stop offset=".5" stopColor="#00ffff" />
                      <stop offset="1" stopColor="#ffff00" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className={styles.emptyTitle}>WECHAT 2</p>
              <p className={styles.emptySub}>从左侧选择会话开始聊天</p>
            </div>
          )}
        </main>
      </div>

      {/* ── Profile modal ── */}
      {showProfile && (
        <div
          className={styles.overlay}
          onClick={() => setShowProfile(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalChrome} />
            <div className={styles.modalInner}>
              <div className={styles.modalHead}>
                <h2 className={styles.modalTitle}>个人信息</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowProfile(false)}
                >
                  <IconClose />
                </button>
              </div>

              {/* Avatar display */}
              <div className={styles.avatarSection}>
                <div
                  className={styles.avatarLarge}
                  style={{ background: avatarGrad(user?.id ?? 0) }}
                >
                  {initial(pUsername || user?.username || "U")}
                </div>
                <button className={styles.changeAvatarBtn}>更换头像</button>
              </div>

              <form onSubmit={handleProfileSave}>
                <ModalField
                  label="用户名"
                  type="text"
                  value={pUsername}
                  onChange={setPUsername}
                />
                <ModalField
                  label="新密码"
                  type="password"
                  value={pPassword}
                  onChange={setPPassword}
                  placeholder="留空则不修改"
                />
                <ModalField
                  label="确认新密码"
                  type="password"
                  value={pConfirm}
                  onChange={setPConfirm}
                  placeholder="再次输入新密码"
                />

                {pFeedback && (
                  <p
                    className={`${styles.feedback} ${pFeedback.ok ? styles.feedbackOk : styles.feedbackErr}`}
                  >
                    {pFeedback.text}
                  </p>
                )}

                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowProfile(false)}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={pSaving}
                  >
                    <span className={styles.saveBtnGlow} />
                    <span className={styles.saveBtnText}>
                      {pSaving ? "保存中…" : "保存"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function RailBtn({
  active,
  onClick,
  label,
  badge,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`${styles.railBtn} ${active ? styles.railBtnActive : ""}`}
      onClick={onClick}
      title={title}
    >
      {badge !== undefined && badge > 0 && (
        <span className={styles.railBadge}>{badge > 99 ? "99+" : badge}</span>
      )}
      {children}
      <span className={styles.railLabel}>{label}</span>
    </button>
  );
}

function ModalField({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className={styles.formField}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.fieldWrap}>
        <input
          className={styles.fieldInput}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

// ── Icon components ──────────────────────────────────────────

function IconChat() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconContacts() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="9"
        cy="7"
        r="4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="16 17 21 12 16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="21"
        y1="12"
        x2="9"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGroup() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="m21 21-4.35-4.35"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconVideo() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path
        d="m22.54 6.42-2.1 2.1A4 4 0 0 1 19 12a4 4 0 0 1-1.56 3.48l2.1 2.1A2 2 0 0 0 22 16V8a2 2 0 0 0-1.46-1.58z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="2"
        y="7"
        width="15"
        height="10"
        rx="2"
        ry="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconEmoji() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 14s1.5 2 4 2 4-2 4-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="9"
        x2="9.01"
        y2="9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="9"
        x2="15.01"
        y2="9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
      <polyline
        points="21 15 16 10 5 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconAttach() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
