import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";
import CountUp from "./CountUp";

export default function Profile() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section className="section" id="profile" style={accentStyle("profile")}>
      <div className="container reveal" ref={ref}>
        <p className="eyebrow">Scouting Report</p>
        <div className="profile__grid">
          {/* Left column: title + compact production-impact figures (no separate band). */}
          <div className="profile__lead">
            <h2 className="section__title">
              From prototype <span className="hl">to production.</span>
            </h2>
            <div className="profile__stats" aria-label="Production impact">
              {site.impactStats.map((s) => (
                <div className="pstat" key={s.label}>
                  <span className="pstat__value">
                    <CountUp value={s.value} />
                  </span>
                  <span className="pstat__label">{s.label}</span>
                  {s.sub && <span className="pstat__sub">{s.sub}</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="profile__body profile__text">
            <p className="profile__verdict">{site.profile.verdict}</p>
            <ul className="profile__points">
              {site.profile.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            {site.identity.certifications && (
              <a
                className="profile__certs"
                href={site.identity.certifications}
                target="_blank"
                rel="noopener noreferrer"
              >
                View certifications <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
