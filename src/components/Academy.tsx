import { site } from "../data/site";
import { useReveal } from "../hooks/useReveal";

/* Education — "Youth Academy". Lives at the end of the Attributes section. */
export default function Academy() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div className="academy reveal" ref={ref}>
      <p className="eyebrow academy__label">Youth Academy</p>
      <div className="academy__grid">
        {site.academy.map((a) => (
          <div className="academy__item" key={a.school + a.detail}>
            <div className="academy__school">{a.school}</div>
            <div className="academy__detail">
              {a.location} — {a.detail}
            </div>
            <div className="academy__meta">{a.period}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
