import { useEffect, useRef } from "react";

/**
 * Reveals an element on first scroll into view (once). Uses IntersectionObserver,
 * not GSAP ScrollTrigger, so it stays cheap and dependency-light. Respects
 * reduced-motion by revealing immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; delay?: number }
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.classList.add("is-in");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = options?.delay ?? 0;
            if (delay) {
              el.style.transitionDelay = `${delay}ms`;
            }
            el.classList.add("is-in");
            obs.unobserve(el);
          }
        });
      },
      { threshold: options?.threshold ?? 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [options?.threshold, options?.delay]);

  return ref;
}
