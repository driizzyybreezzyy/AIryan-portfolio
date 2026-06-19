import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   "Match clock" scroll progress — a slim gradient bar across the top with a
   football riding its leading edge and a live minute (1′ → 90+′) that surfaces
   while you scroll and fades when you stop. Reads the page like a match.
   ──────────────────────────────────────────────────────────────────────────── */

export default function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    let idle = 0;
    const root = document.documentElement;

    const update = () => {
      const max = root.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const pct = (f * 100).toFixed(2) + "%";
      if (fillRef.current) fillRef.current.style.width = pct;
      if (ballRef.current) ballRef.current.style.left = pct;
      if (minRef.current) {
        minRef.current.style.left = pct;
        const minute = Math.max(1, Math.round(f * 90));
        minRef.current.textContent = (f >= 0.999 ? "90+" : String(minute)) + "′";
      }
      root.classList.add("mclock-live");
      clearTimeout(idle);
      idle = window.setTimeout(() => root.classList.remove("mclock-live"), 700);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      root.classList.remove("mclock-live");
    };
  }, []);

  return (
    <div className="mclock" aria-hidden="true">
      <div className="mclock__fill" ref={fillRef} />
      <div className="mclock__ball" ref={ballRef}>
        ⚽
      </div>
      <span className="mclock__min" ref={minRef}>
        1′
      </span>
    </div>
  );
}
