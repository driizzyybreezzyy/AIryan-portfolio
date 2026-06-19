import { useEffect, useRef } from "react";
import { GROUNDS } from "../data/grounds";

/* ─────────────────────────────────────────────────────────────────────────────
   Interactive dot-field background.

   A calm, ordered grid of faint dots. Around the cursor they spring gently apart
   and light up, with a soft radial glow — a clean "magnetic spotlight" rather
   than a busy web of lines. The tint eases toward the current section's club
   colour. Spring-smoothed, parallaxed, paused when hidden, static under
   reduced-motion. 2D canvas (no extra WebGL context).
   ──────────────────────────────────────────────────────────────────────────── */

interface Dot {
  hx: number;
  hy: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
}

function toRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasN = canvasRef.current;
    if (!canvasN) return;
    const canvas = canvasN;
    const ctxN = canvas.getContext("2d");
    if (!ctxN) return;
    const ctx = ctxN;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const GAP = 46; // grid spacing
    const R = 150; // cursor influence radius
    const MAG = 11; // max displacement

    let W = 0;
    let H = 0;
    let dots: Dot[] = [];
    const ptr = { x: -9999, y: -9999, has: false };
    const par = { x: 0, y: 0, tx: 0, ty: 0 };
    let cur = { r: 233, g: 196, b: 106 };

    function build() {
      dots = [];
      for (let y = GAP / 2; y < H; y += GAP) {
        for (let x = GAP / 2; x < W; x += GAP) {
          dots.push({ hx: x, hy: y, ox: 0, oy: 0, vx: 0, vy: 0 });
        }
      }
    }
    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    function activeColor() {
      const mid = window.scrollY + H / 2;
      let best = GROUNDS[0];
      let bd = Infinity;
      for (const g of GROUNDS) {
        const el = document.getElementById(g.id);
        if (!el) continue;
        const c = el.offsetTop + el.offsetHeight / 2;
        const d = Math.abs(c - mid);
        if (d < bd) {
          bd = d;
          best = g;
        }
      }
      return toRgb(best.color);
    }

    function draw(animate: boolean) {
      const gx = -par.x * 14;
      const gy = -par.y * 14;
      ctx.clearRect(0, 0, W, H);
      const cs = `${cur.r | 0},${cur.g | 0},${cur.b | 0}`;
      // Dots must read on the page: club-accent on dark, a dark neutral on light.
      const light = document.documentElement.getAttribute("data-theme") === "light";
      const dotCS = light ? "38, 52, 45" : cs;

      for (const d of dots) {
        let bright = 0;
        let tx = 0;
        let ty = 0;
        if (ptr.has) {
          const dx = d.hx - ptr.x;
          const dy = d.hy - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < R) {
            const f = 1 - dist / R;
            bright = f;
            // push gently AWAY from the cursor (parts the grid)
            tx = (dx / (dist || 1)) * f * MAG;
            ty = (dy / (dist || 1)) * f * MAG;
          }
        }
        if (animate) {
          d.vx += (tx - d.ox) * 0.12;
          d.vy += (ty - d.oy) * 0.12;
          d.vx *= 0.82;
          d.vy *= 0.82;
          d.ox += d.vx;
          d.oy += d.vy;
        }
        const a = 0.05 + bright * 0.55;
        const r = 1 + bright * 1.5;
        ctx.fillStyle = `rgba(${dotCS},${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.hx + d.ox + gx, d.hy + d.oy + gy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // soft light pooling under the cursor
      if (ptr.has) {
        const g = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, R * 1.15);
        g.addColorStop(0, `rgba(${cs},0.10)`);
        g.addColorStop(1, `rgba(${cs},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(ptr.x - R * 1.2, ptr.y - R * 1.2, R * 2.4, R * 2.4);
      }
    }

    resize();

    if (reduced) {
      cur = activeColor();
      draw(false);
      const onResize = () => {
        resize();
        cur = activeColor();
        draw(false);
      };
      const onTheme = () => draw(false);
      window.addEventListener("resize", onResize);
      window.addEventListener("airyanfc:theme", onTheme);
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("airyanfc:theme", onTheme);
      };
    }

    const onMove = (e: PointerEvent) => {
      ptr.x = e.clientX;
      ptr.y = e.clientY;
      ptr.has = true;
      par.tx = e.clientX / W - 0.5;
      par.ty = e.clientY / H - 0.5;
    };
    const onLeave = () => {
      ptr.has = false;
      ptr.x = -9999;
      ptr.y = -9999;
    };

    let raf = 0;
    let running = true;
    const frame = () => {
      if (!running) return;
      const tc = activeColor();
      cur.r += (tc.r - cur.r) * 0.03;
      cur.g += (tc.g - cur.g) * 0.03;
      cur.b += (tc.b - cur.b) * 0.03;
      par.x += (par.tx - par.x) * 0.05;
      par.y += (par.ty - par.y) * 0.05;
      draw(true);
      raf = requestAnimationFrame(frame);
    };
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerout", onLeave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={canvasRef} className="dotfield" aria-hidden="true" />;
}
