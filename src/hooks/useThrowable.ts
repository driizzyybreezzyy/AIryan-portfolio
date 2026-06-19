import { useEffect, type RefObject } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Drag-and-fling with spring-back. Grab the element, drag it anywhere; on release
   it springs back to its origin with a little overshoot. Sets `data-dragged` on a
   real drag so a click handler can tell a drag from a tap (and skip its action).
   Mouse-only + motion-safe; transition is disabled while active so it tracks 1:1.
   ──────────────────────────────────────────────────────────────────────────── */

export function useThrowable<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active = true
) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let ox = 0;
    let oy = 0;
    let vx = 0;
    let vy = 0;
    let dragging = false;
    let sx = 0;
    let sy = 0;
    let moved = 0;
    let raf = 0;

    const apply = () => {
      el.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px)`;
    };
    const spring = () => {
      vx += (0 - ox) * 0.2;
      vy += (0 - oy) * 0.2;
      vx *= 0.76;
      vy *= 0.76;
      ox += vx;
      oy += vy;
      if (Math.abs(ox) < 0.4 && Math.abs(oy) < 0.4 && Math.hypot(vx, vy) < 0.4) {
        el.style.transform = "";
        el.style.transition = "";
        raf = 0;
        return;
      }
      apply();
      raf = requestAnimationFrame(spring);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      moved = 0;
      sx = e.clientX - ox;
      sy = e.clientY - oy;
      vx = 0;
      vy = 0;
      cancelAnimationFrame(raf);
      raf = 0;
      el.style.transition = "none";
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const nx = e.clientX - sx;
      const ny = e.clientY - sy;
      vx = nx - ox;
      vy = ny - oy;
      ox = nx;
      oy = ny;
      moved += Math.abs(vx) + Math.abs(vy);
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (moved > 8) {
        el.dataset.dragged = "1";
        if (!raf) raf = requestAnimationFrame(spring);
      } else {
        el.style.transition = "";
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [ref, active]);
}
