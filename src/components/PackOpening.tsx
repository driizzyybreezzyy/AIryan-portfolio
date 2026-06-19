import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "../data/site";
import CanvasBoundary from "./CanvasBoundary";

/* ─────────────────────────────────────────────────────────────────────────────
   AIryan FC — pack opening.

   Tap the sealed pack → it tears in a burst of light → hands off to the cinematic
   3D walkout (WalkoutScene), which plays the figure walkout, traits tease and
   card reveal, then clears into the hero.

   Safety:
   - prefers-reduced-motion → skip everything, reveal immediately, no flash.
   - Skippable (button + Enter), keyboard-operable, auto-advances after ~6s.
   - Remembers "already opened" in localStorage so return visits skip straight in.
   - If WebGL fails, we degrade straight to the hero (no blank screen).
   ──────────────────────────────────────────────────────────────────────────── */

export const SEEN_KEY = "airyanfc_opened";

// The walkout pulls in three.js + postprocessing — load it only when opening.
const WalkoutScene = lazy(() => import("./WalkoutScene"));

/** Fallback that simply finishes if the 3D scene can't run (no-WebGL). */
function SkipToEnd({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    onDone();
  }, [onDone]);
  return null;
}

export default function PackOpening({ onComplete }: { onComplete: () => void }) {
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState<"pack" | "scene">("pack");
  // True once the walkout character file has downloaded, so the reveal shows the
  // real model instead of the placeholder figure on a fresh (network) visit.
  const [loading, setLoading] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const packStageRef = useRef<HTMLDivElement>(null);
  const packRef = useRef<HTMLButtonElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const autoTimer = useRef<number | null>(null);
  const done = useRef(false);
  const modelReady = useRef(false);
  const pendingOpen = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* localStorage may be unavailable; ignore */
    }
    onComplete();
  }, [onComplete]);

  // The actual pack-tear animation → hands off to the 3D walkout.
  const playTear = useCallback(() => {
    if (done.current) return;
    setLoading(false);
    gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setStage("scene") });
      tl.to(packRef.current, { scale: 1.08, duration: 0.2, ease: "power2.out" })
        .to(packRef.current, { rotateZ: -3, y: -8, duration: 0.14 })
        .set([burstRef.current, raysRef.current], { opacity: 0, scale: 0.2 })
        .to(burstRef.current, { opacity: 0.85, scale: 1, duration: 0.3, ease: "power2.out" }, "b")
        .to(raysRef.current, { opacity: 0.5, scale: 1, rotate: 16, duration: 0.5, ease: "power2.out" }, "b")
        .to(packStageRef.current, { opacity: 0, scale: 1.4, y: -30, duration: 0.34, ease: "power2.in" }, "b")
        .to([burstRef.current, raysRef.current], { opacity: 0, duration: 0.45, ease: "power2.inOut" }, "b+=0.4");
    });
  }, []);

  // Request the open — but hold for the model so the walkout never shows the
  // placeholder. If it's still downloading, show a brief "loading" and proceed
  // the moment it's ready (a hard cap guarantees we never hang).
  const open = useCallback(() => {
    if (stage !== "pack" || done.current) return;
    if (autoTimer.current) window.clearTimeout(autoTimer.current);
    if (modelReady.current) {
      playTear();
    } else {
      pendingOpen.current = true;
      setLoading(true);
    }
  }, [stage, playTear]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(SEEN_KEY) === "1";
    } catch {
      alreadySeen = false;
    }
    if (reduced || alreadySeen) {
      finish();
      return;
    }
    setActive(true);

    // Download the (heavy) walkout character up front and mark ready when the
    // bytes are cached; eagerly load the scene chunk too (its module-level
    // useFBX.preload parses it). markReady fires the tear if the user is waiting.
    const markReady = () => {
      if (modelReady.current) return;
      modelReady.current = true;
      if (pendingOpen.current) playTear();
    };
    const modelUrl = site.card.model?.url;
    if (modelUrl) {
      fetch(modelUrl, { cache: "force-cache" })
        .then((r) => r.arrayBuffer())
        .then(markReady)
        .catch(markReady);
    } else {
      markReady();
    }
    import("./WalkoutScene").catch(() => {});
    // Never hang: proceed (placeholder if need be) after a generous cap.
    const cap = window.setTimeout(markReady, 14000);
    return () => window.clearTimeout(cap);
  }, [finish, playTear]);

  // Auto-advance after a few seconds (gated on the model via open()).
  useEffect(() => {
    if (!active || stage !== "pack") return;
    autoTimer.current = window.setTimeout(() => open(), 5000);
    return () => {
      if (autoTimer.current) window.clearTimeout(autoTimer.current);
    };
  }, [active, stage, open]);

  if (!active) return null;

  return (
    <div className="pack" ref={overlayRef} role="dialog" aria-label="Open your AIryan FC pack">
      {stage === "pack" && (
        <>
          <div className="pack__rays" ref={raysRef} aria-hidden="true" />
          <div className="pack__burst" ref={burstRef} aria-hidden="true" />
          <div className="pack__inner" ref={packStageRef}>
            <button
              className="pack__art"
              ref={packRef}
              onClick={open}
              aria-label="Tap to open the pack and reveal the player card"
              autoFocus
            >
              <PackArt />
            </button>
            <div className="pack__prompt pack__pulse">
              {loading ? (
                "Loading walkout…"
              ) : (
                <>
                  Tap to <span>open</span>
                </>
              )}
            </div>
            <div className="pack__hint">
              {loading
                ? "Preparing your player"
                : "Reveal the 2026 Special walkout"}
            </div>
          </div>
        </>
      )}

      {stage === "scene" && (
        <CanvasBoundary fallback={<SkipToEnd onDone={finish} />}>
          <Suspense fallback={null}>
            <WalkoutScene onDone={finish} />
          </Suspense>
        </CanvasBoundary>
      )}

      <button className="pack__skip" onClick={finish}>
        Skip ↵
      </button>
    </div>
  );
}

/* Original AIryan FC pack artwork — gold/green, no real brand. */
function PackArt() {
  return (
    <svg viewBox="0 0 300 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="pk-body" x1="0" y1="0" x2="300" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16201B" />
          <stop offset="0.5" stopColor="#0F1612" />
          <stop offset="1" stopColor="#0A0F0C" />
        </linearGradient>
        <linearGradient id="pk-gold" x1="30" y1="20" x2="280" y2="400" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E9C46A" />
          <stop offset="0.5" stopColor="#C29A41" />
          <stop offset="1" stopColor="#E9C46A" />
        </linearGradient>
        <linearGradient id="pk-green" x1="0" y1="200" x2="300" y2="420" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1FB257" stopOpacity="0.35" />
          <stop offset="1" stopColor="#1FB257" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="pk-glow" cx="0.5" cy="0.4" r="0.6">
          <stop stopColor="#E9C46A" stopOpacity="0.4" />
          <stop offset="1" stopColor="#E9C46A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="6" y="6" width="288" height="408" rx="18" fill="url(#pk-body)" stroke="url(#pk-gold)" strokeWidth="4" />
      <rect x="6" y="200" width="288" height="214" rx="18" fill="url(#pk-green)" />
      <ellipse cx="150" cy="170" rx="120" ry="120" fill="url(#pk-glow)" />

      <path d="M150 70 L214 96 V160 C214 206 186 232 150 250 C114 232 86 206 86 160 V96 Z" fill="rgba(31,178,87,0.10)" stroke="url(#pk-gold)" strokeWidth="3" />
      <text x="150" y="170" textAnchor="middle" fontFamily="'Bebas Neue', Arial, sans-serif" fontSize="52" fill="url(#pk-gold)">AI</text>

      <text x="150" y="300" textAnchor="middle" fontFamily="'Bebas Neue', Arial, sans-serif" fontSize="34" letterSpacing="3" fill="#F3F7F3">AIRYAN FC</text>
      <text x="150" y="332" textAnchor="middle" fontFamily="'Space Grotesk', Arial, sans-serif" fontSize="13" letterSpacing="6" fill="#93A29A">2026 · SPECIAL PACK</text>

      <circle cx="6" cy="120" r="6" fill="#0A0F0C" />
      <circle cx="294" cy="120" r="6" fill="#0A0F0C" />
    </svg>
  );
}
