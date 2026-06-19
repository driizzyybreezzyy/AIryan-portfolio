import { useEffect, useMemo, useState } from "react";
import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import ThemeToggle from "./ThemeToggle";
import Magnetic from "./Magnetic";
import EasterEggButton from "./EasterEggButton";

const kickBall = () =>
  window.dispatchEvent(new CustomEvent("airyanfc:kick"));

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  const ids = useMemo(() => site.nav.map((n) => n.href.replace("#", "")), []);

  useEffect(() => {
    const all = ["top", ...ids];
    let raf = 0;
    const update = () => {
      setScrolled(window.scrollY > 24);
      // Scroll-spy: the active section is the last one whose top has crossed a
      // probe line near the top third of the viewport.
      const probe = window.scrollY + window.innerHeight * 0.32;
      let cur = "";
      for (const id of all) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= probe) cur = id;
      }
      setActive(cur);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ids]);

  return (
    <header className={scrolled ? "nav nav--scrolled" : "nav"}>
      <div className="container nav__inner">
        <div className="nav__left">
          <Magnetic strength={0.25}>
            <a
              className="crest"
              href="#top"
              aria-label="AIryan FC — home"
              onClick={kickBall}
            >
              <svg className="crest__mark" viewBox="0 0 64 64" aria-hidden="true">
            <defs>
              <linearGradient id="crest-g" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E9C46A" />
                <stop offset="1" stopColor="#1FB257" />
              </linearGradient>
            </defs>
            <path
              d="M32 6 L54 14 V32 C54 46 44 55 32 59 C20 55 10 46 10 32 V14 Z"
              stroke="url(#crest-g)"
              strokeWidth="3"
              fill="rgba(31,178,87,0.10)"
            />
          </svg>
          <span className="crest__text">
            <span className="crest__ai">AI</span>RYAN&nbsp;FC
          </span>
            </a>
          </Magnetic>
          <button
            type="button"
            className="crest__hint"
            onClick={kickBall}
            aria-label="Kick the football"
            title="Kick the ball"
          >
            bored? click me <span aria-hidden="true">⚽</span>
          </button>
        </div>

        <div className="nav__right">
          <nav aria-label="Primary">
          <button
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-links"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>

          <ul
            id="nav-links"
            className={open ? "nav__links nav__links--open" : "nav__links"}
          >
            {site.nav.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = id === active;
              return (
                <li key={link.href}>
                  <Magnetic strength={0.2}>
                    <a
                      className={isActive ? "nav__link nav__link--active" : "nav__link"}
                      href={link.href}
                      aria-current={isActive ? "true" : undefined}
                      style={accentStyle(id)}
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </a>
                  </Magnetic>
                </li>
              );
            })}
          </ul>
          </nav>
          <EasterEggButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
