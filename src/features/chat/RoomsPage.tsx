import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/auth-store";
import { createGroupRoom } from "./api";
import styles from "./RoomsPage.module.css";

/**
 * API error shape returned by the backend.
 */
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function parseParticipants(input: string): number[] {
  return input
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export function RoomsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [name, setName] = useState("");
  const [participantIdsText, setParticipantIdsText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createRoomMutation = useMutation({
    mutationFn: (payload: { name: string; participant_ids: number[] }) =>
      createGroupRoom(payload),
    onSuccess: async (response) => {
      setName("");
      setParticipantIdsText("");
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      const newRoomId = response.data?.id;
      if (newRoomId) {
        navigate(`/rooms/${newRoomId}`);
      }
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      setFormError(error.response?.data?.message || "创建房间失败");
    },
  });

  function onCreateRoom(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const participant_ids = parseParticipants(participantIdsText);

    if (!cleanName) {
      setFormError("请输入房间名称");
      return;
    }

    if (participant_ids.length === 0) {
      setFormError("请至少添加一个参与者 ID");
      return;
    }

    createRoomMutation.mutate({ name: cleanName, participant_ids });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.cardHeader}>
          <div className={styles.logo}>
            <span className={styles.logoGlow} aria-hidden />
            <span className={styles.logoInner}>💬</span>
          </div>
          <h1 className={styles.title}>
            <span className={styles.titleChrome}>聊天</span>
            <span className={styles.titleNeon}>大厅</span>
          </h1>
          <p className={styles.subtitle}>
            欢迎回来 · {user?.username ?? "旅行者"}
          </p>
          <p className={styles.hint}>从左侧选择聊天，或创建一个新的群聊</p>
        </header>

        <form className={styles.form} onSubmit={onCreateRoom} noValidate>
          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="room-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="room-name" className={styles.label}>
                房间名称
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="room-participants"
                className={styles.input}
                value={participantIdsText}
                onChange={(e) => setParticipantIdsText(e.target.value)}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="room-participants" className={styles.label}>
                参与者 ID (用英文逗号分隔)
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          {formError && <p className={styles.error}>⚠ {formError}</p>}

          <button
            type="submit"
            className={`${styles.button} ${
              createRoomMutation.isPending ? styles.buttonLoading : ""
            }`}
            disabled={createRoomMutation.isPending}
          >
            <span className={styles.buttonChrome} aria-hidden />
            <span className={styles.buttonText}>
              {createRoomMutation.isPending ? "正在创建..." : "立即创建"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
