import { useEffect, useRef, useState } from "react";
import { GROUNDS, hexA, type Ground } from "../data/grounds";

/* ─────────────────────────────────────────────────────────────────────────────
   AIryan FC — living stadium background.

   Each section of the page maps to a different, non-repeating ground (defined in
   src/data/grounds.ts). As you scroll, the background cross-fades to the next
   stadium and a venue label fades in. The whole image plane parallaxes with
   scroll AND the cursor, and a club-coloured wash drifts over it — so it feels
   alive and interactive, not static.

   Real photos are optional: drop files in `public/stadiums/` and they appear
   automatically. Until then, each ground falls back to a tasteful club-coloured,
   pitch-striped gradient so nothing ever looks broken.
   ──────────────────────────────────────────────────────────────────────────── */

function layerBackground(g: Ground): string {
  // Image on top (if present) over a club-coloured, pitch-striped fallback.
  const c = g.color;
  return [
    `linear-gradient(180deg, rgba(7,11,9,0.45) 0%, rgba(7,11,9,0.78) 70%, #070b09 100%)`,
    `url("${g.img}") center/cover no-repeat`,
    `radial-gradient(120% 90% at 50% 18%, ${hexA(c, 0.32)}, transparent 60%)`,
    `repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 46px, transparent 46px 92px)`,
    `linear-gradient(160deg, ${hexA(c, 0.16)}, #0a0f0c 70%)`,
  ].join(", ");
}

function useActiveSection(): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      GROUNDS.forEach((g, i) => {
        const el = document.getElementById(g.id);
        if (!el) return;
        const center = el.offsetTop + el.offsetHeight / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIndex(best);
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
    };
  }, []);
  return index;
}

export default function StadiumBackground() {
  const active = useActiveSection();
  const planeRef = useRef<HTMLDivElement>(null);
  const washRef = useRef<HTMLDivElement>(null);
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const current = GROUNDS[Math.min(active, GROUNDS.length - 1)];

  // Scroll + cursor parallax (skipped under reduced motion).
  useEffect(() => {
    if (reduced) return;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      px = e.clientX / window.innerWidth - 0.5;
      py = e.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      tx += (px - tx) * 0.07;
      ty += (py - ty) * 0.07;
      const scroll = window.scrollY * 0.06;
      if (planeRef.current) {
        planeRef.current.style.transform = `translate3d(${(-tx * 24).toFixed(2)}px, ${(-ty * 18 + scroll).toFixed(2)}px, 0) scale(1.14)`;
      }
      if (washRef.current) {
        washRef.current.style.transform = `translate3d(${(tx * 36).toFixed(2)}px, ${(ty * 30).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove);
    loop();
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="stadiumbg" aria-hidden="true">
      <div className="stadiumbg__plane" ref={planeRef}>
        {GROUNDS.map((g, i) => (
          <div
            key={g.id}
            className="stadiumbg__layer"
            style={{
              background: layerBackground(g),
              opacity: i === active ? 1 : 0,
            }}
          />
        ))}
      </div>

      {/* Drifting club-coloured wash for life/motion. */}
      <div
        className={reduced ? "stadiumbg__wash" : "stadiumbg__wash stadiumbg__wash--drift"}
        ref={washRef}
        style={{
          background: `radial-gradient(60% 50% at 30% 25%, ${hexA(current.color, 0.22)}, transparent 60%), radial-gradient(50% 50% at 80% 75%, ${hexA(current.color, 0.14)}, transparent 60%)`,
        }}
      />
      <div className="stadiumbg__vignette" />

      <div className="stadium-label" key={current.stadium}>
        <span className="stadium-label__club">
          <span
            className="stadium-pennant"
            style={{ color: current.color }}
            aria-hidden="true"
          />
          {current.club}
        </span>
        <span className="stadium-label__venue">{current.stadium}</span>
      </div>
    </div>
  );
}
