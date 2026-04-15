import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRooms } from "../../api";
import type { ChatRoom } from "../../types";
import styles from "./RoomsListPanel.module.css";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const diffMs = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diffMs < oneDay * 7) {
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    return `周${weekdays[date.getDay()]}`;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getInitial(name: string | undefined, fallbackId: number): string {
  if (name && name.trim().length > 0) {
    // Use the first visible character (works for Chinese + ASCII)
    return Array.from(name.trim())[0]!.toUpperCase();
  }
  return String(fallbackId).slice(-2);
}

function getSubtitle(room: ChatRoom): string {
  const count = room.participants?.length ?? 0;
  if (room.room_type === "direct") return "私聊";
  return `${count} 人群聊`;
}

interface Props {
  onOpenNewRoom: () => void;
}

export function RoomsListPanel({ onOpenNewRoom }: Props) {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const activeRoomId = roomId ? Number(roomId) : null;

  const [query, setQuery] = useState("");

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getRooms(),
    refetchInterval: 8000,
  });

  const rooms = useMemo(
    () => roomsQuery.data?.data.results ?? [],
    [roomsQuery.data],
  );

  const filteredRooms = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter((room) => {
      const nameMatch = (room.name || "").toLowerCase().includes(keyword);
      const participantMatch = room.participants?.some((p) =>
        p.username.toLowerCase().includes(keyword),
      );
      return nameMatch || participantMatch;
    });
  }, [rooms, query]);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.searchField}>
          <span className={styles.searchIcon} aria-hidden>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
            aria-label="搜索聊天"
          />
          <span className={styles.searchHologram} aria-hidden />
        </div>
        <button
          type="button"
          className={styles.addButton}
          onClick={onOpenNewRoom}
          title="创建新群聊"
          aria-label="创建新群聊"
        >
          <span className={styles.addButtonGlow} aria-hidden />
          <span className={styles.addButtonIcon}>+</span>
        </button>
      </div>

      <div className={styles.listScroll}>
        {roomsQuery.isLoading && (
          <p className={styles.stateText}>正在加载房间列表...</p>
        )}

        {!roomsQuery.isLoading && filteredRooms.length === 0 && (
          <p className={styles.stateText}>
            {rooms.length === 0
              ? "你还没有任何聊天，邀请好友并开始聊天吧！"
              : "没有匹配的结果"}
          </p>
        )}

        <ul className={styles.list}>
          {filteredRooms.map((room) => {
            const isActive = activeRoomId === room.id;
            return (
              <li
                key={room.id}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onClick={() => navigate(`/rooms/${room.id}`)}
              >
                <div className={styles.avatarWrap}>
                  <span className={styles.avatarGlow} aria-hidden />
                  <span className={styles.avatar}>
                    {getInitial(room.name, room.id)}
                  </span>
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTopRow}>
                    <span className={styles.itemName}>
                      {room.name || `未命名房间 ${room.id}`}
                    </span>
                    <span className={styles.itemTime}>
                      {formatTimestamp(room.updated_at)}
                    </span>
                  </div>
                  <span className={styles.itemSubtitle}>
                    {getSubtitle(room)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
