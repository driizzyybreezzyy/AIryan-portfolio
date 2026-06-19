import { useState } from "react";
import { site } from "../data/site";
import { useReveal } from "../hooks/useReveal";
import Magnetic from "./Magnetic";

/* ─────────────────────────────────────────────────────────────────────────────
   "Starting XI" — the squad of skills laid out on a pitch (broadcast view:
   keeper on the left, attack on the right). Pick a formation to re-shape the
   eleven; positions are derived from the chosen shape. Pure-CSS pitch markings.
   ──────────────────────────────────────────────────────────────────────────── */

/** Position codes for a line of `n` players, by FIFA convention. */
function posCodes(line: "DEF" | "MID" | "FWD", n: number): string[] {
  if (line === "DEF") {
    if (n <= 3) return Array(n).fill("CB");
    if (n === 4) return ["LB", "CB", "CB", "RB"];
    return ["LWB", "CB", "CB", "CB", "RWB"].slice(0, n);
  }
  if (line === "MID") {
    if (n <= 1) return ["CM"];
    if (n === 2) return ["CM", "CM"];
    if (n === 3) return ["CM", "CDM", "CM"];
    if (n === 4) return ["LM", "CM", "CM", "RM"];
    return ["LM", "CM", "CDM", "CM", "RM"].slice(0, n);
  }
  if (n === 1) return ["ST"];
  if (n === 2) return ["ST", "ST"];
  return ["LW", "ST", "RW"];
}

export default function Formation() {
  const ref = useReveal<HTMLDivElement>();
  const [name, setName] = useState(site.lineup.formations[0].name);

  const current =
    site.lineup.formations.find((f) => f.name === name) ??
    site.lineup.formations[0];
  const [d, m, f] = current.name.split("-").map(Number);
  const squad = current.squad;
  const gk = squad[0];
  const outfield = squad.slice(1);

  // Keeper-first → forwards. Each column: its players + their position codes.
  const columns = [
    { players: [gk], pos: ["GK"] },
    { players: outfield.slice(0, d), pos: posCodes("DEF", d) },
    { players: outfield.slice(d, d + m), pos: posCodes("MID", m) },
    { players: outfield.slice(d + m, d + m + f), pos: posCodes("FWD", f) },
  ];

  return (
    <div className="lineup reveal" ref={ref}>
      <div className="lineup__head">
        <p className="label">
          Starting XI · {current.name} · <span className="lineup__style">{current.label}</span>
        </p>
        <div className="lineup__formations" role="group" aria-label="Choose formation">
          {site.lineup.formations.map((fm) => (
            <button
              key={fm.name}
              type="button"
              className={fm.name === name ? "formpill formpill--on" : "formpill"}
              aria-pressed={fm.name === name}
              onClick={() => setName(fm.name)}
            >
              {fm.name}
            </button>
          ))}
        </div>
      </div>

      <div
        className="pitch"
        key={current.name}
        role="img"
        aria-label={`${current.label} starting eleven in a ${current.name}: ${squad
          .map((p) => p.name)
          .join(", ")}.`}
      >
        <div className="pitch__markings" aria-hidden="true" />
        {columns.map((col, ci) => (
          <div className="pitch__col" key={ci}>
            {col.players.map((p, pi) => (
              <Magnetic key={p.name} strength={0.22}>
                <div className={p.captain ? "player player--cap" : "player"}>
                  <span className="player__badge">
                    <span className="player__rating">{p.rating}</span>
                    <span className="player__pos">{col.pos[pi]}</span>
                    {p.captain && (
                      <span className="player__cap" aria-hidden="true">
                        C
                      </span>
                    )}
                  </span>
                  <span className="player__name">{p.name}</span>
                </div>
              </Magnetic>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
