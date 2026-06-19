import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   A kickable football. Grab and fling it (gravity, bounce, roll, spin); a hard
   flick scores a GOAL — confetti + "GOAL!" pop + a goals counter. It also reacts
   to SCROLL (the page jolts the ball up/down) and to clicking the AIryan crest
   (which boots it skyward). Mouse + touch; off under reduced-motion; pointer-
   events live only on the ball so it never blocks the UI.
   ──────────────────────────────────────────────────────────────────────────── */

export default function KickableBall() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLButtonElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!enabled) return;
    const ball = ballRef.current;
    const wrap = wrapRef.current;
    const score = scoreRef.current;
    if (!ball || !wrap || !score) return;

    const SIZE = 46;
    const M = 18;
    let x = M + 52;
    let y = window.innerHeight - SIZE - M;
    let vx = 0;
    let vy = 0;
    let ang = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let dvx = 0;
    let dvy = 0;
    let raf = 0;
    let sleeping = true;
    let goals = 0;
    let lastGoal = 0;
    let scoreTimer = 0;
    let trailTick = 0;

    const floor = () => window.innerHeight - SIZE - M;
    const right = () => window.innerWidth - SIZE - M;
    const render = () => {
      ball.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${ang.toFixed(1)}deg)`;
    };

    const step = () => {
      if (!dragging) {
        vy += 0.7;
        vx *= 0.992;
        x += vx;
        y += vy;
        if (x < M) {
          x = M;
          vx = -vx * 0.72;
        } else if (x > right()) {
          x = right();
          vx = -vx * 0.72;
        }
        if (y > floor()) {
          y = floor();
          vy = -vy * 0.68;
          vx *= 0.9;
          if (Math.abs(vy) < 1.1) vy = 0;
        }
        if (y < 0) {
          y = 0;
          vy = -vy * 0.6;
        }
        ang += vx * 1.4;
        if (y >= floor() - 0.5 && Math.abs(vy) < 0.4 && Math.abs(vx) < 0.25) {
          vx = 0;
          vy = 0;
          render();
          sleeping = true;
          raf = 0;
          return;
        }
      }
      if (!dragging) {
        const sp = Math.hypot(vx, vy);
        if (sp > 9 && (++trailTick & 1)) spawnTrail(x + SIZE / 2, y + SIZE / 2);
      }
      render();
      raf = requestAnimationFrame(step);
    };
    const wake = () => {
      if (sleeping) {
        sleeping = false;
        if (!raf) raf = requestAnimationFrame(step);
      }
    };

    const spawnTrail = (cx: number, cy: number) => {
      const t = document.createElement("span");
      t.className = "balltrail";
      t.style.left = (cx - 4).toFixed(1) + "px";
      t.style.top = (cy - 4).toFixed(1) + "px";
      wrap.appendChild(t);
      t.addEventListener("animationend", () => t.remove());
    };

    const celebrate = (cx: number, cy: number) => {
      const now = performance.now();
      if (now - lastGoal < 450) return; // debounce rapid kicks
      lastGoal = now;

      const colors = ["#e9c46a", "#1fb257", "#eaf6ee"];
      for (let i = 0; i < 16; i++) {
        const s = document.createElement("span");
        s.className = "confetti";
        const a = Math.random() * Math.PI * 2;
        const sp = 34 + Math.random() * 90;
        s.style.left = cx + "px";
        s.style.top = cy + "px";
        s.style.setProperty("--dx", (Math.cos(a) * sp).toFixed(1) + "px");
        s.style.setProperty("--dy", (Math.sin(a) * sp - 34).toFixed(1) + "px");
        s.style.background = colors[i % 3];
        wrap.appendChild(s);
        s.addEventListener("animationend", () => s.remove());
      }

      const g = document.createElement("span");
      g.className = "goaltext";
      g.textContent = "GOAL!";
      g.style.left = cx + "px";
      g.style.top = Math.max(60, cy - 30) + "px";
      wrap.appendChild(g);
      g.addEventListener("animationend", () => g.remove());

      goals += 1;
      score.textContent = `⚽ ${goals}`;
      score.classList.add("goalscore--show");
      score.classList.remove("goalscore--bump");
      void score.offsetWidth; // restart bump animation
      score.classList.add("goalscore--bump");
      clearTimeout(scoreTimer);
      scoreTimer = window.setTimeout(
        () => score.classList.remove("goalscore--show"),
        3200
      );
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      try {
        ball.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      lastX = e.clientX;
      lastY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
      dvx = 0;
      dvy = 0;
      vx = 0;
      vy = 0;
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      dvx = e.clientX - lastX;
      dvy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      x += dvx;
      y += dvy;
      ang += dvx * 1.4;
      render();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      try {
        ball.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < 6) {
        // keepie-uppie tap — bounce the ball straight up
        vy = -(13 + Math.random() * 5);
        vx = (Math.random() * 2 - 1) * 5;
      } else {
        vx = Math.max(-42, Math.min(42, dvx * 1.1));
        vy = Math.max(-42, Math.min(42, dvy * 1.1));
        if (Math.hypot(vx, vy) > 9) celebrate(x + SIZE / 2, y + SIZE / 2);
      }
      wake();
    };

    // Scroll jolts the ball (down-scroll pushes it down, up-scroll lifts it).
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      vy += Math.max(-24, Math.min(24, dy * 0.4));
      if (Math.abs(dy) > 1) wake();
    };
    // Clicking the AIryan crest boots the ball up (and scores if it lands well).
    const onCrestKick = () => {
      vy = -18;
      vx = (Math.random() * 2 - 1) * 9;
      celebrate(x + SIZE / 2, y + SIZE / 2);
      wake();
    };
    const onResize = () => {
      x = Math.min(x, right());
      y = Math.min(y, floor());
      render();
    };

    ball.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("airyanfc:kick", onCrestKick);
    window.addEventListener("resize", onResize);

    render();
    const hop = window.setTimeout(() => {
      vy = -15;
      vx = 4;
      wake();
    }, 1400);

    return () => {
      clearTimeout(hop);
      clearTimeout(scoreTimer);
      cancelAnimationFrame(raf);
      ball.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("airyanfc:kick", onCrestKick);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="balltoy" ref={wrapRef} aria-hidden="true">
      <span className="goalscore" ref={scoreRef} />
      <button
        type="button"
        className="ball"
        ref={ballRef}
        aria-label="Kick the football"
        title="Kick me ⚽"
      >
        ⚽
      </button>
    </div>
  );
}
