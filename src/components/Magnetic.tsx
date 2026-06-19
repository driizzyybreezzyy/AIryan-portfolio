import { useEffect, useRef, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Magnetic wrapper — its child (a button/link) leans toward the cursor while
   hovered and springs back on leave. Wraps in an inline-flex span so it composes
   with the child's own hover styles. Mouse-only + motion-safe; a no-op otherwise.
   ──────────────────────────────────────────────────────────────────────────── */

export default function Magnetic({
  children,
  strength = 0.35,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    let raf = 0;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;
    let active = false;

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      if (!active && Math.abs(cx) < 0.1 && Math.abs(cy) < 0.1) {
        el.style.transform = "";
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    const onEnter = () => {
      active = true;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
    };
    const onLeave = () => {
      active = false;
      tx = 0;
      ty = 0;
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
  }, [strength]);

  return (
    <span ref={ref} className="magnetic">
      {children}
    </span>
  );
}
