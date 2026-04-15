import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createGroupRoom } from "../../api";
import styles from "./NewRoomModal.module.css";

interface ApiError {
  response?: { data?: { message?: string } };
  message?: string;
}

function parseParticipants(input: string): number[] {
  return input
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v) && v > 0);
}

interface Props {
  onClose: () => void;
}

export function NewRoomModal({ onClose }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [participantIdsText, setParticipantIdsText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const createRoomMutation = useMutation({
    mutationFn: (payload: { name: string; participant_ids: number[] }) =>
      createGroupRoom(payload),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      const newRoomId = response.data?.id;
      onClose();
      if (newRoomId) navigate(`/rooms/${newRoomId}`);
    },
    onError: (err: unknown) => {
      const error = err as ApiError;
      setFormError(error.response?.data?.message || "创建房间失败");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const participant_ids = parseParticipants(participantIdsText);

    if (!cleanName) {
      setFormError("请输入群聊名称");
      return;
    }
    if (participant_ids.length === 0) {
      setFormError("请至少添加一个参与者 ID");
      return;
    }

    createRoomMutation.mutate({ name: cleanName, participant_ids });
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="创建新群聊"
    >
      <div className={styles.modal}>
        {/* Animated chrome border */}
        <span className={styles.chromeBorder} aria-hidden />
        <span className={styles.chromeBg} aria-hidden />

        <button
          className={styles.closeBtn}
          type="button"
          onClick={onClose}
          aria-label="关闭"
        >
          <span className={styles.closeBtnGlow} aria-hidden />
          <span className={styles.closeBtnIcon}>✕</span>
        </button>

        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoGlow} aria-hidden />
            <span className={styles.logoInner}>+</span>
          </div>
          <h2 className={styles.title}>
            <span className={styles.titleChrome}>创建</span>
            <span className={styles.titleNeon}>群聊</span>
          </h2>
          <p className={styles.hint}>输入群名并邀请好友的 ID 开始聊天</p>
        </header>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="modal-room-name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                autoComplete="off"
                autoFocus
              />
              <label htmlFor="modal-room-name" className={styles.label}>
                群聊名称
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldChrome}>
              <input
                id="modal-room-participants"
                className={styles.input}
                value={participantIdsText}
                onChange={(e) => setParticipantIdsText(e.target.value)}
                placeholder=" "
                autoComplete="off"
              />
              <label htmlFor="modal-room-participants" className={styles.label}>
                参与者 ID（英文逗号分隔）
              </label>
              <span className={styles.hologram} aria-hidden />
            </div>
          </div>

          {formError && <p className={styles.error}>⚠ {formError}</p>}

          <button
            type="submit"
            className={`${styles.button} ${createRoomMutation.isPending ? styles.buttonLoading : ""}`}
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
