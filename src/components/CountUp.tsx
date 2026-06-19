import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Animated count-up. Parses a value like "50K+", "90%+", "15×" or "−33%" into a
   prefix / number / suffix, then ticks the number from 0 to target the first time
   it scrolls into view. Honours reduced-motion by showing the final value at once.
   ──────────────────────────────────────────────────────────────────────────── */

function parse(value: string) {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/s);
  if (!m) return null;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { prefix: m[1], target: parseFloat(m[2]), suffix: m[3], decimals };
}

function fmt(n: number, decimals: number) {
  return decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
}

export default function CountUp({
  value,
  duration = 1400,
}: {
  value: string;
  duration?: number;
}) {
  const parsed = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => {
    if (!parsed) return value;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return fmt(reduced ? parsed.target : 0, parsed.decimals);
  });

  useEffect(() => {
    if (!parsed) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(fmt(parsed.target, parsed.decimals));
      return;
    }

    let raf = 0;
    let started = false;
    let t0 = 0;
    const step = (t: number) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(fmt(parsed.target * eased, parsed.decimals));
      if (p < 1) raf = requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            raf = requestAnimationFrame(step);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!parsed) return <>{value}</>;
  return (
    <span ref={ref}>
      {parsed.prefix}
      {display}
      {parsed.suffix}
    </span>
  );
}
