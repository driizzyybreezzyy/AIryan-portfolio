import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";
import Magnetic from "./Magnetic";

export default function Contact() {
  const ref = useReveal<HTMLDivElement>();
  const mailto = `mailto:${site.identity.email}`;

  return (
    <section className="section contact" id="contact" style={accentStyle("contact")}>
      <div className="container">
        <div className="contact__inner reveal" ref={ref}>
          <p className="eyebrow" style={{ justifyContent: "center" }}>
            Transfer Enquiries
          </p>
          <h2 className="contact__heading">{site.contact.heading}</h2>
          <p className="contact__body">{site.contact.body}</p>

          {site.hero.status && (
            <p className="contact__avail">
              <span className="status-chip__dot" aria-hidden="true" />
              {site.hero.status} · Based in {site.identity.location}
            </p>
          )}

          <div className="contact__actions">
            <Magnetic>
              <a className="btn btn--primary" href={mailto}>
                {site.contact.primaryLabel} <span className="btn__arrow">→</span>
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
            {site.contact.socials.map((s) => (
              <Magnetic key={s.label}>
                <a
                  className="btn btn--ghost"
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
