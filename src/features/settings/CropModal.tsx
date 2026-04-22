import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CropModal.module.css";

interface Props {
  src: string; // object URL or data URL of the source image
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

const FRAME = 240; // diameter of the circular crop viewport (px)
const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function CropModal({ src, onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // offset is the translation of the image centre relative to the frame centre
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [userScale, setUserScale] = useState(1);
  const [loaded, setLoaded] = useState(false);

  // natural dimensions, set once image loads
  const natW = useRef(0);
  const natH = useRef(0);

  // ── Load image ────────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      natW.current = img.naturalWidth;
      natH.current = img.naturalHeight;
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  // ── Render canvas whenever offset/scale/loaded changes ────
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = FRAME;
    canvas.height = FRAME;

    // The image is rendered into the canvas at the given scale with the offset.
    // totalScale = how many source pixels map to one canvas pixel (inverted below)
    // We want: canvas covers FRAME×FRAME px of the *source*, centred on (natW/2 - ox/totalScale, natH/2 - oy/totalScale)

    // Displayed image size in canvas pixels
    const displayW = natW.current * userScale;
    const displayH = natH.current * userScale;

    // Top-left in canvas coords so that the image is centred + offset
    const drawX = FRAME / 2 - displayW / 2 + offset.x;
    const drawY = FRAME / 2 - displayH / 2 + offset.y;

    ctx.clearRect(0, 0, FRAME, FRAME);

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(FRAME / 2, FRAME / 2, FRAME / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(img, drawX, drawY, displayW, displayH);
    ctx.restore();
  }, [loaded, offset, userScale]);

  // ── Drag handling ─────────────────────────────────────────
  const dragStart = useRef<{ px: number; py: number; ox: number; oy: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.px;
    const dy = e.clientY - dragStart.current.py;

    // Clamp so the image always covers the circle
    const displayW = natW.current * userScale;
    const displayH = natH.current * userScale;
    const maxX = Math.max(0, (displayW - FRAME) / 2);
    const maxY = Math.max(0, (displayH - FRAME) / 2);

    setOffset({
      x: Math.max(-maxX, Math.min(maxX, dragStart.current.ox + dx)),
      y: Math.max(-maxY, Math.min(maxY, dragStart.current.oy + dy)),
    });
  }, [userScale]);

  const onPointerUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  // Recalculate clamp when scale changes
  useEffect(() => {
    const displayW = natW.current * userScale;
    const displayH = natH.current * userScale;
    const maxX = Math.max(0, (displayW - FRAME) / 2);
    const maxY = Math.max(0, (displayH - FRAME) / 2);
    setOffset((prev) => ({
      x: Math.max(-maxX, Math.min(maxX, prev.x)),
      y: Math.max(-maxY, Math.min(maxY, prev.y)),
    }));
  }, [userScale]);

  // ── Escape to cancel ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  // ── Confirm: export canvas as JPEG ────────────────────────
  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Export square canvas at full FRAME size
    const out = document.createElement("canvas");
    out.width = FRAME;
    out.height = FRAME;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0);
    onConfirm(out.toDataURL("image/jpeg", 0.85));
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onCancel} aria-label="关闭">✕</button>

        <p className={styles.title}>裁剪头像</p>

        {/* Canvas drag area */}
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
          {/* Decorative circle ring overlay */}
          <div className={styles.ring} aria-hidden />
        </div>

        {/* Zoom slider */}
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>缩小</span>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.05}
            value={userScale}
            onChange={(e) => setUserScale(Number(e.target.value))}
            className={styles.slider}
          />
          <span className={styles.sliderLabel}>放大</span>
        </div>

        {/* Actions */}
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
