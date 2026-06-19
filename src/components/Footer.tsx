import { site } from "../data/site";

export default function Footer({ onReplay }: { onReplay: () => void }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__wordmark">
            <span className="crest__ai">AI</span>ryan FC
          </span>
          <span className="footer__tagline">{site.identity.tagline}</span>
          <span className="footer__copy">© 2026 {site.identity.name}</span>
        </div>
        <nav className="footer__nav" aria-label="Footer">
          {site.nav.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <button type="button" className="footer__replay" onClick={onReplay}>
            <span aria-hidden="true">↻</span> Replay walkout
          </button>
        </nav>
      </div>
    </footer>
  );
}
