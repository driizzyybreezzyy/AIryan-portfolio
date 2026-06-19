import { useEffect, type RefObject } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Tactile 3D tilt. Attaches to an existing element ref: on hover the element
   tilts toward the pointer (spring-smoothed) and exposes --gx/--gy so a `.glare`
   child can track a moving highlight. Clears its inline transform on leave so the
   element's normal (reveal) styles resume. Mouse-only + motion-safe.
   ──────────────────────────────────────────────────────────────────────────── */

export function useTilt<T extends HTMLElement>(
  ref: RefObject<T | null>,
  max = 8
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let rx = 0;
    let ry = 0;
    let trx = 0;
    let trY = 0;
    let active = false;

    const loop = () => {
      rx += (trx - rx) * 0.14;
      ry += (trY - ry) * 0.14;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (!active && Math.abs(rx) < 0.05 && Math.abs(ry) < 0.05) {
        el.style.transform = "";
        el.style.transition = ""; // hand transform back to CSS
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const onEnter = () => {
      active = true;
      el.style.transition = "none"; // we drive transform per-frame; avoid CSS lag
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      trx = (0.5 - py) * 2 * max;
      trY = (px - 0.5) * 2 * max;
      el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    };
    const onLeave = () => {
      active = false;
      trx = 0;
      trY = 0;
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, max]);
}
