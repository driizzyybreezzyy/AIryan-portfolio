import { useEffect, useRef, useState } from "react";

/* A stat value that "reshuffles" (slot-machine style) on hover, then lands back
   on the real number. Preserves any prefix/suffix (e.g. "100+", "8.65"). Honours
   reduced-motion by staying static. */

function parse(value: string) {
  const m = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/s);
  if (!m) return null;
  const decimals = m[2].includes(".") ? m[2].split(".")[1].length : 0;
  return { prefix: m[1], target: parseFloat(m[2]), suffix: m[3], decimals };
}

export default function ShuffleStat({ value }: { value: string }) {
  const parsed = parse(value);
  const [disp, setDisp] = useState(value);
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  if (!parsed) return <>{value}</>;

  const rand = () =>
    parsed.decimals > 0
      ? (Math.random() * parsed.target * 1.4).toFixed(parsed.decimals)
      : String(Math.floor(Math.random() * (parsed.target * 1.4 + 2)));

  const shuffle = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    cancelAnimationFrame(raf.current);
    const t0 = performance.now();
    const dur = 480;
    const tick = (t: number) => {
      if (t - t0 >= dur) {
        setDisp(value);
        return;
      }
      setDisp(parsed.prefix + rand() + parsed.suffix);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  const reset = () => {
    cancelAnimationFrame(raf.current);
    setDisp(value);
  };

  return (
    <span onPointerEnter={shuffle} onPointerLeave={reset}>
      {disp}
    </span>
  );
}
