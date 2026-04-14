import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import { getMessages, getRooms, sendMessage } from "./api";
import styles from "./RoomPage.module.css";

export function RoomPage() {
  const { roomId } = useParams();
  const queryClient = useQueryClient();

  const currentUserId = useAuthStore((state) => state.user?.id);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const numericRoomId = useMemo(() => Number(roomId), [roomId]);

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getRooms(),
  });

  const room = roomsQuery.data?.data.results.find(
    (item) => item.id === numericRoomId,
  );

  const messagesQuery = useQuery({
    queryKey: ["messages", numericRoomId],
    queryFn: () => getMessages(numericRoomId),
    enabled: Number.isFinite(numericRoomId),
    refetchInterval: 3000,
  });

  const messages = messagesQuery.data?.data.results ?? [];

  useEffect(() => {
    // Auto-scroll to the latest message whenever the messages list changes.
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, numericRoomId]);

  const sendMutation = useMutation({
    mutationFn: (nextContent: string) =>
      sendMessage(numericRoomId, nextContent),
    onSuccess: async () => {
      setContent("");
      await queryClient.invalidateQueries({
        queryKey: ["messages", numericRoomId],
      });
    },
  });

  const handleSend = () => {
    const clean = content.trim();
    if (!clean || sendMutation.isPending) return;
    sendMutation.mutate(clean);
  };

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    handleSend();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <section className={styles.room}>
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <h1 className={styles.title}>
            {room?.name || `房间 ${roomId}`}
          </h1>
          <span className={styles.chip}>
            {room?.participants?.length ?? 0} 参与者
          </span>
        </div>
        <div className={styles.headerEdge} aria-hidden />
      </header>

      <div className={styles.messages} ref={scrollRef}>
        {messagesQuery.isLoading && (
          <p className={styles.stateText}>正在载入消息...</p>
        )}

        {!messagesQuery.isLoading && messages.length === 0 && (
          <p className={styles.stateText}>暂无消息，发送第一条打破寂静</p>
        )}

        {messages.map((msg) => {
          const isOwn =
            currentUserId !== undefined && msg.sender.id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                isOwn ? styles.messageRowOwn : styles.messageRowOther
              }`}
            >
              {!isOwn && (
                <div className={styles.bubbleAvatarWrap}>
                  <span className={styles.bubbleAvatarGlow} aria-hidden />
                  <span className={styles.bubbleAvatar}>
                    {(msg.sender.username || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className={styles.bubbleStack}>
                <div className={styles.bubbleMeta}>
                  <span className={styles.bubbleSender}>
                    {isOwn ? "我" : msg.sender.username}
                  </span>
                  <span className={styles.bubbleTime}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`${styles.bubble} ${
                    isOwn ? styles.bubbleOwn : styles.bubbleOther
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className={styles.composer}>
        <form onSubmit={onSubmit} className={styles.composerForm}>
          <div className={styles.composerField}>
            <textarea
              className={styles.textarea}
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="按 Enter 发送，Shift+Enter 换行"
            />
            <span className={styles.composerHologram} aria-hidden />
          </div>
          <button
            type="submit"
            className={styles.sendButton}
            disabled={sendMutation.isPending || !content.trim()}
          >
            <span className={styles.sendButtonChrome} aria-hidden />
            <span className={styles.sendButtonText}>
              {sendMutation.isPending ? "发送中" : "发送"}
            </span>
          </button>
        </form>
      </footer>
    </section>
  );
}
