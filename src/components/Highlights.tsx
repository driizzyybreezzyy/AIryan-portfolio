import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";
import { useTilt } from "../hooks/useTilt";

export default function Highlights() {
  const head = useReveal<HTMLDivElement>();

  return (
    <section className="section" id="highlights" style={accentStyle("highlights")}>
      <div className="container">
        <div className="reveal" ref={head}>
          <p className="eyebrow">Match Highlights</p>
          <h2 className="section__title">Highlights</h2>
          <p className="section__lead">
            Selected builds — the goals worth replaying.
          </p>
        </div>

        <div className="highlights__grid" style={{ marginTop: "clamp(32px, 5vw, 52px)" }}>
          {site.projects.map((p, i) => (
            <Match key={p.title} project={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Match({
  project,
  delay,
}: {
  project: (typeof site.projects)[number];
  delay: number;
}) {
  const ref = useReveal<HTMLAnchorElement>({ delay });
  useTilt(ref, 7);
  return (
    <a
      className={project.onTheme ? "match match--theme reveal" : "match reveal"}
      ref={ref}
      href={project.repo}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="glare" aria-hidden="true" />
      {project.onTheme && <span className="match__tag label">⚽ On theme</span>}
      {project.result && (
        <span className="match__result" aria-label={`Result: ${project.result}`}>
          {project.result}
        </span>
      )}
      <h3 className="match__title">
        {project.title}
        <span className="match__arrow" aria-hidden="true">↗</span>
      </h3>
      <div className="match__stack">
        {project.stack.map((s) => (
          <span className="chip" key={s}>
            {s}
          </span>
        ))}
      </div>
      <ul className="match__bullets">
        {project.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <span className="match__repo">
        View repo <span aria-hidden="true">→</span>
      </span>
    </a>
  );
}
