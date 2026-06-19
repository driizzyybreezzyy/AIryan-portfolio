import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { site } from "../data/site";
import CardFallback from "./CardFallback";
import CanvasBoundary from "./CanvasBoundary";
import CardModal from "./CardModal";
import Magnetic from "./Magnetic";
import ShuffleStat from "./ShuffleStat";
import { useThrowable } from "../hooks/useThrowable";

// The 3D card pulls in three.js — load it off the critical path, and only when
// the visitor isn't on reduced-motion and the browser supports WebGL.
const PlayerCard3D = lazy(() => import("./PlayerCard3D"));
// The live animated player, kept on the hero (lazy — reuses the cached FBX).
const HeroCharacter = lazy(() => import("./HeroCharacter"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/* The hero: name, position, OVR (on the card), one-liner, CTAs and the season
   stats strip. Hero text staggers in once the pack has opened (`revealed`). */
export default function Hero({ revealed }: { revealed: boolean }) {
  const scope = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  // Card is throwable once the 3D card has mounted (drag to fling, springs back).
  useThrowable(cardRef, use3D);
  // On phones the live character is dropped (clarity + one fewer WebGL canvas)
  // and the card is centred instead of tucked behind him.
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const openCard = (e?: React.MouseEvent) => {
    // If the card was dragged (thrown), swallow the click so it doesn't enlarge.
    const el = e?.currentTarget as HTMLElement | undefined;
    if (el?.dataset.dragged) {
      delete el.dataset.dragged;
      return;
    }
    setCardOpen(true);
  };
  const onCardKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setCardOpen(true);
    }
  };

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    setUse3D(!reduced && hasWebGL());
  }, []);

  useLayoutEffect(() => {
    if (!revealed) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-hero-stagger]", {
        y: 26,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "transform,opacity",
      });
    }, scope);
    return () => ctx.revert();
  }, [revealed]);

  return (
    <section className="hero section" id="top" ref={scope}>
      <div className="container hero__grid">
        <div className="hero__copy">
          {site.hero.status && (
            <p className="status-chip" data-hero-stagger>
              <span className="status-chip__dot" aria-hidden="true" />
              {site.hero.status}
            </p>
          )}
          <p className="hero__eyebrow" data-hero-stagger>
            {site.hero.eyebrow}
          </p>
          <h1 className="hero__name" data-hero-stagger>
            {site.hero.name}
          </h1>
          <p className="hero__position" data-hero-stagger>
            {site.hero.positionLine}
          </p>
          <p className="hero__oneliner" data-hero-stagger>
            {site.hero.oneLiner}
          </p>

          <div className="hero__ctas" data-hero-stagger>
            <Magnetic>
              <a className="btn btn--primary" href="#highlights">
                View highlights <span className="btn__arrow">→</span>
              </a>
            </Magnetic>
            <Magnetic>
              <a className="btn btn--ghost" href="#contact">
                Sign me
              </a>
            </Magnetic>
            <Magnetic>
              <a
                className="btn btn--ghost"
                href={site.identity.resume}
                target="_blank"
                rel="noopener noreferrer"
              >
                Résumé
              </a>
            </Magnetic>
          </div>

          <div className="season" data-hero-stagger aria-label="Career stats">
            {site.careerStats.map((stat) => (
              <div className="season__item" key={stat.label}>
                <span className="season__value">
                  <ShuffleStat value={stat.value} />
                </span>
                <span className="season__label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__stage" data-hero-stagger>
          {use3D ? (
            <>
              {/* live player behind, card floating in front (desktop only) */}
              {!compact && (
                <Suspense fallback={null}>
                  <HeroCharacter />
                </Suspense>
              )}
              <div
                className={compact ? "hero__card hero__card--center" : "hero__card"}
                ref={cardRef}
                role="button"
                tabIndex={0}
                aria-label="Enlarge player card"
                title="Click to enlarge · drag to fling"
                onClick={openCard}
                onKeyDown={onCardKey}
              >
                <CanvasBoundary fallback={<CardFallback />}>
                  <Suspense fallback={<CardFallback />}>
                    <PlayerCard3D />
                  </Suspense>
                </CanvasBoundary>
                <span className="hero__card-hint" aria-hidden="true">
                  ⤢ Click to enlarge
                </span>
              </div>
            </>
          ) : (
            <div
              className="hero__cardbtn"
              role="button"
              tabIndex={0}
              aria-label="Enlarge player card"
              title="Click to enlarge"
              onClick={openCard}
              onKeyDown={onCardKey}
            >
              <CardFallback />
            </div>
          )}
        </div>
      </div>

      <CardModal open={cardOpen} onClose={() => setCardOpen(false)} />
    </section>
  );
}
