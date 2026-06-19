import { site } from "../data/site";
import PlayerAvatar from "./PlayerAvatar";

/* Static, fully accessible DOM player card — FUT layout with the real photo as
   the large centerpiece. Shown for reduced-motion / no-WebGL visitors, as the
   walkout's final card, and as the Suspense fallback while the 3D card loads.
   Carries no three.js dependency so it stays on the critical path. */
export default function CardFallback() {
  return (
    <div
      className="cardfallback"
      role="img"
      aria-label={`${site.identity.name} AIryan FC special card, overall ${site.card.ovr}`}
    >
      <div className="cardfallback__photo">
        <PlayerAvatar className="cardfallback__img" />
        <div className="cardfallback__badge">
          <span className="cardfallback__ovr">{site.card.ovr}</span>
          <span className="cardfallback__pos">{site.card.position}</span>
          <span className="cardfallback__flag" aria-hidden="true">
            <i style={{ background: "#FF9933" }} />
            <i style={{ background: "#fff" }} />
            <i style={{ background: "#138808" }} />
          </span>
        </div>
      </div>

      <div className="cardfallback__name">{site.identity.name.toUpperCase()}</div>

      <div className="cardfallback__stats">
        {site.card.stats.map((s) => (
          <div className="cardfallback__stat" key={s.key}>
            <b>{s.value}</b>
            <span>{s.key}</span>
          </div>
        ))}
      </div>

      <div className="cardfallback__club">
        {site.card.club} · {site.card.nation}
      </div>
    </div>
  );
}
