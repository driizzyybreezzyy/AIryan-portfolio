import { useCallback, useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Profile from "./components/Profile";
import Career from "./components/Career";
import Highlights from "./components/Highlights";
import Honours from "./components/Honours";
import Attributes from "./components/Attributes";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PackOpening, { SEEN_KEY } from "./components/PackOpening";
import StadiumBackground from "./components/StadiumBackground";
import InteractiveBackground from "./components/InteractiveBackground";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import KickableBall from "./components/KickableBall";
import KonamiEgg from "./components/KonamiEgg";

export default function App() {
  const [revealed, setRevealed] = useState(false);
  // Bumping `runId` re-mounts the pack so the walkout plays again on replay.
  const [runId, setRunId] = useState(0);

  const handlePackComplete = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setRevealed(true);
  }, []);

  const replay = useCallback(() => {
    try {
      localStorage.removeItem(SEEN_KEY);
    } catch {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    setRevealed(false);
    setRunId((n) => n + 1);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <StadiumBackground />
      <InteractiveBackground />
      <div className="grain" aria-hidden="true" />
      <CustomCursor />
      {revealed && <ScrollProgress />}
      {revealed && <KickableBall />}
      <KonamiEgg />

      {!revealed && <PackOpening key={runId} onComplete={handlePackComplete} />}

      <Navbar />

      <main id="main">
        <Hero revealed={revealed} />
        <Profile />
        <Career />
        <Highlights />
        <Honours />
        <Attributes />
        <Contact />
      </main>

      <Footer onReplay={replay} />
    </>
  );
}
