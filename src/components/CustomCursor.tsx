import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Slick custom cursor: a precise dot at the pointer + a ring that trails with
   spring lag and grows/fills when hovering anything interactive. Only enabled on
   fine pointers (mouse) without reduced-motion — touch/keyboard users keep the
   native cursor untouched. The dot stays pixel-accurate so clicking precision is
   never lost.
   ──────────────────────────────────────────────────────────────────────────── */

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, .formpill";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let shown = false;
    let raf = 0;

    const place = (el: HTMLElement | null, x: number, y: number) => {
      if (el) el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const spawnTrail = (px: number, py: number) => {
      const t = document.createElement("span");
      t.className = "cursor-trail";
      t.style.left = px + "px";
      t.style.top = py + "px";
      document.body.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    };

    const onMove = (e: PointerEvent) => {
      const speed = Math.hypot(e.clientX - mx, e.clientY - my);
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        rx = mx;
        ry = my;
        root.classList.add("cursor-on");
      }
      place(dotRef.current, mx, my);
      if (speed > 22) spawnTrail(mx, my); // faint comet only on fast moves
    };
    const onOver = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.(INTERACTIVE);
      root.classList.toggle("cursor-hover", !!t);
    };
    const onDown = () => root.classList.add("cursor-down");
    const onUp = () => root.classList.remove("cursor-down");
    const onLeave = () => {
      shown = false;
      root.classList.remove("cursor-on");
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      place(ringRef.current, rx, ry);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("mouseleave", onLeave);
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      root.classList.remove("has-cursor", "cursor-on", "cursor-hover", "cursor-down");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
