import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";
import { useTilt } from "../hooks/useTilt";

export default function Honours() {
  const head = useReveal<HTMLDivElement>();

  return (
    <section className="section" id="honours" style={accentStyle("honours")}>
      <div className="container">
        <div className="reveal" ref={head}>
          <p className="eyebrow">Trophy Cabinet</p>
          <h2 className="section__title">Honours</h2>
          <p className="section__lead">Awards and published research.</p>
        </div>

        <div className="honours__grid" style={{ marginTop: "clamp(32px, 5vw, 52px)" }}>
          {site.honours.map((h, i) => (
            <Trophy key={h.title} honour={h} delay={i * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Trophy({
  honour,
  delay,
}: {
  honour: (typeof site.honours)[number];
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>({ delay });
  useTilt(ref, 6);
  const clickable = !!honour.href;
  return (
    <div
      className={clickable ? "trophy trophy--link reveal" : "trophy reveal"}
      ref={ref}
    >
      <span className="glare" aria-hidden="true" />
      <span className="trophy__icon" aria-hidden="true">
        {honour.icon}
      </span>
      <div className="trophy__body">
        <div className="trophy__title">{honour.title}</div>
        <span className="trophy__org">{honour.org}</span>
      </div>
      {clickable && (
        <>
          <span className="trophy__ext" aria-hidden="true">
            ↗
          </span>
          {/* stretched link makes the whole card clickable */}
          <a
            className="trophy__link"
            href={honour.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${honour.title} — opens in a new tab`}
          />
        </>
      )}
    </div>
  );
}
