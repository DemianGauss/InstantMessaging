import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CropModal.module.css";

interface Props {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

const FRAME = 240; // diameter of the circular crop viewport (px)
const MAX_ZOOM_MULTIPLIER = 4; // slider goes up to coverScale × 4

export function CropModal({ src, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // minScale is the "cover" scale computed after load; slider starts here
  const [minScale, setMinScale] = useState(1);
  const [userScale, setUserScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  const natW = useRef(0);
  const natH = useRef(0);

  // ── Load image ────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      natW.current = img.naturalWidth;
      natH.current = img.naturalHeight;
      imgRef.current = img;
      // Cover scale: smallest scale that fills the FRAME circle entirely
      const cover = Math.max(FRAME / img.naturalWidth, FRAME / img.naturalHeight);
      setMinScale(cover);
      setUserScale(cover);
      setOffset({ x: 0, y: 0 });
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  // ── Render canvas ─────────────────────────────────────────
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = FRAME;
    canvas.height = FRAME;

    const displayW = natW.current * userScale;
    const displayH = natH.current * userScale;
    const drawX = FRAME / 2 - displayW / 2 + offset.x;
    const drawY = FRAME / 2 - displayH / 2 + offset.y;

    ctx.clearRect(0, 0, FRAME, FRAME);
    ctx.save();
    ctx.beginPath();
    ctx.arc(FRAME / 2, FRAME / 2, FRAME / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, displayW, displayH);
    ctx.restore();
  }, [loaded, offset, userScale]);

  // ── Drag handling ─────────────────────────────────────────
  const dragStart = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const clampOffset = useCallback((ox: number, oy: number, scale: number) => {
    const displayW = natW.current * scale;
    const displayH = natH.current * scale;
    const maxX = Math.max(0, (displayW - FRAME) / 2);
    const maxY = Math.max(0, (displayH - FRAME) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, ox)),
      y: Math.max(-maxY, Math.min(maxY, oy)),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;
    setOffset(clampOffset(dragStart.current.ox + dx, dragStart.current.oy + dy, userScale));
  }, [userScale, clampOffset]);

  const onPointerUp = useCallback(() => { dragStart.current = null; }, []);

  // Re-clamp offset when scale changes
  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, userScale));
  }, [userScale, clampOffset]);

  // ── Escape ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  // ── Confirm ───────────────────────────────────────────────
  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const out = document.createElement("canvas");
    out.width = FRAME;
    out.height = FRAME;
    out.getContext("2d")?.drawImage(canvas, 0, 0);
    onConfirm(out.toDataURL("image/jpeg", 0.85));
  }

  const maxScale = minScale * MAX_ZOOM_MULTIPLIER;

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="关闭">✕</button>

        <p className={styles.title}>裁剪头像</p>

        <div
          className={styles.cropWrap}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {loaded ? (
            <canvas ref={canvasRef} width={FRAME} height={FRAME} className={styles.canvas} />
          ) : (
            <div className={styles.loading}>加载中…</div>
          )}
          <div className={styles.ring} aria-hidden />
        </div>

        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>缩小</span>
          <input
            type="range"
            min={minScale}
            max={maxScale}
            step={(maxScale - minScale) / 100}
            value={userScale}
            onChange={(e) => setUserScale(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderLabel}>放大</span>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>取消</button>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={!loaded}>
            <span className={styles.confirmChrome} aria-hidden />
            <span className={styles.confirmText}>确认裁剪</span>
          </button>
        </div>
      </div>
    </div>
  );
}
