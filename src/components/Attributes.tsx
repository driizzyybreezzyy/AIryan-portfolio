import { site } from "../data/site";
import { accentStyle } from "../data/grounds";
import { useReveal } from "../hooks/useReveal";
import Formation from "./Formation";
import Academy from "./Academy";

export default function Attributes() {
  const head = useReveal<HTMLDivElement>();
  const squad = useReveal<HTMLParagraphElement>();

  return (
    <section className="section" id="attributes" style={accentStyle("attributes")}>
      <div className="container">
        <div className="reveal" ref={head}>
          <p className="eyebrow">Attributes</p>
          <h2 className="section__title">The full skill tree</h2>
          <p className="section__lead">
            What I bring on the pitch — across the whole stack.
          </p>
        </div>

        <Formation />

        <p className="squad-label label reveal" ref={squad}>
          Full squad
        </p>
        <div className="attrs__grid">
          {site.skills.map((group, i) => (
            <AttrCard key={group.group} group={group} delay={i * 60} />
          ))}
        </div>

        <Academy />
      </div>
    </section>
  );
}

function AttrCard({
  group,
  delay,
}: {
  group: (typeof site.skills)[number];
  delay: number;
}) {
  const ref = useReveal<HTMLDivElement>({ delay });
  return (
    <div className="attr reveal" ref={ref}>
      <h3 className="attr__group">{group.group}</h3>
      <div className="attr__items">
        {group.items.map((item) => (
          <span className="attr__pill" key={item}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
