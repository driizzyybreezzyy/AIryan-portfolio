import type { CSSProperties } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared "grounds" data — one football stadium per page section.

   This is the single source of truth for the per-section club identity: the
   stadium background, the section accent colour, the active-nav highlight and
   the "now playing at" label all read from here, so the whole page stays in sync
   as you scroll from club to club.
   ──────────────────────────────────────────────────────────────────────────── */

export interface Ground {
  id: string; // matches the section id it belongs to
  club: string;
  stadium: string;
  color: string; // club accent colour
  img: string; // photo in public/stadiums (falls back to a gradient if missing)
}

export const GROUNDS: Ground[] = [
  { id: "top", club: "Liverpool", stadium: "ANFIELD", color: "#e23b3b", img: "/stadiums/anfield.jpeg" },
  { id: "profile", club: "Real Madrid", stadium: "SANTIAGO BERNABÉU", color: "#e7c66b", img: "/stadiums/bernabeu.jpeg" },
  { id: "career", club: "Barcelona", stadium: "SPOTIFY CAMP NOU", color: "#c0185b", img: "/stadiums/campnou.jpeg" },
  { id: "highlights", club: "Bayern München", stadium: "ALLIANZ ARENA", color: "#e2433b", img: "/stadiums/allianz.jpeg" },
  { id: "honours", club: "Manchester City", stadium: "ETIHAD STADIUM", color: "#6cabdd", img: "/stadiums/etihad.jpeg" },
  { id: "attributes", club: "Borussia Dortmund", stadium: "SIGNAL IDUNA PARK", color: "#f4d000", img: "/stadiums/dortmund.jpeg" },
  { id: "contact", club: "Manchester United", stadium: "OLD TRAFFORD", color: "#e0394a", img: "/stadiums/oldtrafford.jpeg" },
];

/** Accent colour for a section id (gold fallback for anything unmapped). */
export function groundColor(id: string, fallback = "#e9c46a"): string {
  return GROUNDS.find((g) => g.id === id)?.color ?? fallback;
}

/** Inline style that sets the `--accent` CSS variable for a section id. */
export function accentStyle(id: string): CSSProperties {
  return { "--accent": groundColor(id) } as CSSProperties;
}

/** Translucent rgba() from a #rrggbb hex + alpha. */
export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
