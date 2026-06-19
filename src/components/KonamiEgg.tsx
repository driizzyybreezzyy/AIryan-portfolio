import { useEffect } from "react";

/* Hidden easter-egg: type ↑ ↑ ↓ ↓ ← → ← → B A → a full-screen confetti rain and
   a "GOOOAL!" banner. Invisible until triggered, so it adds zero clutter. */

const SEQ = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function KonamiEgg() {
  useEffect(() => {
    let idx = 0;
    let active = false;

    const fire = () => {
      if (active) return;
      active = true;
      const colors = ["#e9c46a", "#1fb257", "#eaf6ee", "#e23b3b", "#6cabdd"];
      const layer = document.createElement("div");
      layer.className = "konami-rain";
      for (let i = 0; i < 70; i++) {
        const c = document.createElement("span");
        c.className = "kc";
        c.style.left = (Math.random() * 100).toFixed(2) + "vw";
        c.style.background = colors[i % colors.length];
        c.style.animationDuration = (1.6 + Math.random() * 1.6).toFixed(2) + "s";
        c.style.animationDelay = (Math.random() * 0.5).toFixed(2) + "s";
        layer.appendChild(c);
      }
      const banner = document.createElement("div");
      banner.className = "konami-banner";
      banner.textContent = "GOOOAL!";
      banner.addEventListener("animationend", () => banner.remove());
      document.body.appendChild(layer);
      document.body.appendChild(banner);
      window.setTimeout(() => {
        layer.remove();
        active = false;
      }, 4200);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === SEQ[idx]) {
        idx += 1;
        if (idx === SEQ.length) {
          idx = 0;
          fire();
        }
      } else {
        idx = k === SEQ[0] ? 1 : 0;
      }
    };
    const onGoal = () => fire(); // triggered by the easter-egg button
    window.addEventListener("keydown", onKey);
    window.addEventListener("airyanfc:goal", onGoal);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("airyanfc:goal", onGoal);
    };
  }, []);

  return null;
}
