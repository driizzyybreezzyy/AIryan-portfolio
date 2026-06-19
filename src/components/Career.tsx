import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";

/** A short crest monogram for a club name: parenthesised acronym (e.g. ISRO),
 *  otherwise the initials of the first two significant words. */
function crestText(club: string): string {
  const paren = club.match(/\(([^)]+)\)/);
  if (paren) return paren[1].slice(0, 4).toUpperCase();
  const words = club.replace(/[^A-Za-z ]/g, "").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function Career() {
  const head = useReveal<HTMLDivElement>();

  return (
    <section className="section" id="career" style={accentStyle("career")}>
      <div className="container">
        <div className="reveal" ref={head}>
          <p className="eyebrow">Transfer History</p>
          <h2 className="section__title">Career</h2>
          <p className="section__lead">
            Every club a chapter — most recent first.
          </p>
        </div>

        <ol className="timeline" style={{ marginTop: "clamp(36px, 5vw, 56px)" }}>
          {site.experience.map((exp, i) => (
            <TransferCard key={exp.club} exp={exp} index={i + 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function TransferCard({
  exp,
  index,
}: {
  exp: (typeof site.experience)[number];
  index: number;
}) {
  const ref = useReveal<HTMLLIElement>();
  return (
    <li className="xfer reveal" ref={ref}>
      <div className="xfer__num">{String(index).padStart(2, "0")}</div>
      <div className="xfer__card">
        <div className="xfer__head">
          <span className="xfer__idgrp">
            <span className="xfer__crest" aria-hidden="true">
              {crestText(exp.club)}
            </span>
            <h3 className="xfer__club">{exp.club}</h3>
          </span>
          <span className="xfer__period">{exp.period}</span>
        </div>
        <p className="xfer__loc">{exp.location}</p>

        {exp.roles.map((role) => (
          <div className="role" key={role.title + role.period}>
            <div className="role__head">
              <span className="role__title">{role.title}</span>
              <span className="role__period">{role.period}</span>
            </div>
            <ul className="role__bullets">
              {role.bullets.map((b, bi) => (
                <li key={bi}>{b}</li>
              ))}
            </ul>
            {role.badge && (
              <span className="role__badge">🏆 {role.badge}</span>
            )}
          </div>
        ))}
      </div>
    </li>
  );
}
