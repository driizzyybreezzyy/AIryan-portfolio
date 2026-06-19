import { Suspense, lazy, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CardFallback from "./CardFallback";
import CanvasBoundary from "./CanvasBoundary";

/* ─────────────────────────────────────────────────────────────────────────────
   Click-to-enlarge card lightbox.

   Tapping the hero card opens this overlay with a big, fully-interactive version
   of the same holographic 3D card (move the mouse to tilt / catch the foil).
   Falls back to the styled DOM card where WebGL/motion is unavailable. Closes on
   Esc, backdrop click, or the close button; locks scroll and restores focus.
   ──────────────────────────────────────────────────────────────────────────── */

const PlayerCard3D = lazy(() => import("./PlayerCard3D"));

export default function CardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="cardmodal"
      role="dialog"
      aria-modal="true"
      aria-label="AIryan FC player card, enlarged"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        className="cardmodal__close"
        aria-label="Close enlarged card"
        onClick={onClose}
      >
        ×
      </button>

      <div className="cardmodal__card" onClick={(e) => e.stopPropagation()}>
        <CanvasBoundary fallback={<CardFallback />}>
          <Suspense fallback={<CardFallback />}>
            <PlayerCard3D />
          </Suspense>
        </CanvasBoundary>
      </div>

      <p className="cardmodal__hint">Move your mouse to tilt · Esc to close</p>
    </div>,
    document.body
  );
}
