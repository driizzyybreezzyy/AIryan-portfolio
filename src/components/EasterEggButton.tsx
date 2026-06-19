/* Small, self-explanatory easter-egg trigger in the navbar. Clicking it fires the
   same GOAL celebration as the Konami code (so it's verifiable without typing),
   and the hover tooltip teaches the keyboard combo. */
export default function EasterEggButton() {
  return (
    <button
      type="button"
      className="egg-btn"
      onClick={() => window.dispatchEvent(new CustomEvent("airyanfc:goal"))}
      aria-label="Easter egg — celebrate a goal"
      title="Click for a GOAL!  ·  or type ↑ ↑ ↓ ↓ ← → ← → B A"
    >
      <span className="egg-btn__icon" aria-hidden="true">
        🥚
      </span>
      <span className="egg-btn__tip" aria-hidden="true">
        Easter egg — click for a <b>GOAL!</b> 🎉
        <br />
        or type ↑ ↑ ↓ ↓ ← → ← → B A
      </span>
    </button>
  );
}
