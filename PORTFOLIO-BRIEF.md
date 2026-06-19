# PORTFOLIO_BRIEF.md — "DEV FC" Player-Card Portfolio (Build Spec for Claude Code)

> **How to use this file:** Put it in a **new, empty folder** (not the Moncy clone). Open that
> folder in VS Code, start Claude Code there, and paste the kickoff prompt below.

---

## ▶ Kickoff prompt (paste this into Claude Code first)

```
Read this entire PORTFOLIO_BRIEF.md, then build the portfolio it describes.

Scaffold a FRESH React + Vite + TypeScript project in this folder. It is a football /
trading-card themed 3D developer portfolio ("DEV FC") with a card-pack-opening reveal.
Implement every section using the EXACT content in the "Content" section (no invented
facts, no lorem ipsum). Follow the design system, the 3D + pack-opening spec, and the
animation spec precisely, and satisfy the Acceptance Checklist at the end.

Hard rules:
- ORIGINAL design only. Do NOT use or recreate EA Sports / EA FC / FIFA / FUT logos, their
  official card templates or artwork, real club crests, real player photos, or EA's
  typefaces. This is an original homage, not an official product. Generic football imagery
  (ball, pitch, floodlights) and a national flag are fine.
- Do NOT copy, import, or reference any file from the Moncy/Portfolio-Website clone or moncy.dev.
- Do NOT add any watermark, "built by", "made with Claude", template credit, or any third
  party's name anywhere in the UI, code, comments, or metadata. The only person named is
  Aryan Bhavsar.
- All of the player's real info (name, role, stats text, links) must ALSO exist as real
  semantic HTML, not only painted inside a 3D canvas — for screen readers and SEO.
- When finished, run `npm run dev` and `npm run build`, then fix every TypeScript and
  runtime error before telling me it's done.
```

---

## 1. Concept

A football / trading-card themed **3D developer portfolio** for **Aryan Bhavsar**, a
**Machine Learning Systems Engineer**. The conceit: Aryan is a star player, and the site is
his **player profile**. The hero is a **pack-opening reveal** into his own original
**player card**, which the visitor can tilt to catch a holographic foil shine. Every section
is reskinned in football language while presenting his real career.

Tone: premium, stadium-at-night, a little cinematic — confident and fun, never cheesy. This
is a maximalist direction, so execution detail matters: precise spacing, real motion
choreography, and a tasteful holographic effect are what sell it.

## 2. Tech stack (use exactly this)

- **React 18 + Vite + TypeScript**
- **three.js + @react-three/fiber + @react-three/drei** for the 3D (card, foil shader, ambiance)
- **GSAP + ScrollTrigger** for the pack-opening choreography and scroll reveals
  - As of April 30 2025, **GSAP and all former "Club" plugins are 100% free, incl. commercial
    use.** Use freely; no license key.
- Plain CSS with custom properties (one global stylesheet). No Tailwind, no CSS-in-JS.
- MIT/free deps only. No paid or trial assets.

Targets: clean `npm run build`, zero TypeScript errors, no console errors, Lighthouse
performance ≥ 90 desktop.

## 3. Non-negotiable rules

1. **Fresh build** from scratch in this folder. Never reuse the Moncy clone.
2. **Original football-card design** — no EA/FIFA/FUT logos, templates, crests, player art, or
   fonts (see §1 kickoff). It's "DEV FC", Aryan's own brand.
3. **No watermark / no attribution** of any kind. Footer is only `© 2026 Aryan Bhavsar` + nav.
4. **Only real content** (see §6); facts must stay accurate. Wording may be lightly themed.
5. **Accessibility, performance, and no-seizure-risk motion** are part of "done" (see §8–9).

## 4. Design system

Stadium-night premium with gold foil + pitch green, plus a holographic sheen reserved for the
card. Deliberately NOT a generic neon dev look.

### Color (CSS variables)
```
--bg:        #0A0F0C;   /* near-black, faint pitch-green undertone (NOT pure #000) */
--bg-elev:   #0F1612;
--bg-elev2:  #121A16;
--surface:   #16201B;
--text:      #F3F7F3;
--muted:     #93A29A;
--line:      rgba(243,247,243,0.12);
--gold:      #E9C46A;    /* premium foil accent */
--gold-deep: #C29A41;
--pitch:     #1FB257;    /* vibrant pitch green */
--floodlight:#EAF6EE;    /* cool white highlight */
--grad:      linear-gradient(105deg, #E9C46A 0%, #1FB257 100%);
/* Holographic foil — used ONLY on the card sheen overlay: */
--holo: linear-gradient(115deg,#ff6b9d,#feca57,#48dbfb,#1dd1a1,#5f27cd,#ff6b9d);
```
Use gold/green for accents and the card frame; reserve the holographic gradient for the
card's moving foil. Everything else stays quiet and dark.

### Typography (Google Fonts)
- **Numerals & jersey display:** `Bebas Neue` — the big OVR rating, stat numbers, and a few
  tall jersey-style headings. This is the iconic scoreboard/jersey look.
- **Headings / UI emphasis:** `Archivo` (use bold / expanded weights) — sporty, modern.
- **Body / UI:** `Space Grotesk`.
- Small technical labels (positions, dates, tags) in uppercase Space Grotesk with wide
  letter-spacing. *(Optional: `JetBrains Mono` for those labels if you want a dev-coded feel —
  keep total fonts ≤ 4.)*
- Fluid scale with `clamp()`. The card OVR is huge (think `clamp(3rem, 9vw, 7rem)`), tight.

### Layout & structure
- Centered container `max-width: 1200px`; side padding `clamp(20px, 5vw, 48px)`.
- Section rhythm `clamp(96px, 14vw, 180px)`.
- Each section gets a small uppercase **eyebrow** with its football name + a thin gold rule.
- **Numbering only on the Career timeline** (a real chronological sequence). Don't number
  everything.
- Subtle pitch-line motifs (thin lines/arcs) may frame sections — keep them faint.

## 5. Signature: pack-opening + interactive holographic card

This is the centerpiece. Three pieces:

### (a) The pack-opening (entry moment)
- On first load, a sealed **"DEV FC" pack** (original gold/green pack art — design it; no real
  brand) sits centered with a prompt: **"Tap to open."**
- On click/tap/Enter: the pack glows and tears, a **burst of light rays + gold sparks/confetti**
  fires, and Aryan's **player card** scales/flies up into the hero position and settles.
- Choreograph with a GSAP timeline. The light burst can be an additive radial sprite/plane in
  r3f or layered CSS/SVG — your call, but keep it smooth (~60fps).
- **Must have a visible "Skip" button** (keyboard-focusable) and should auto-advance if
  ignored for ~6s.
- **Reduced motion / safety:** if `prefers-reduced-motion`, skip the animation entirely and
  show the card immediately — **no flashing**. Even in full mode, cap flash brightness/rate so
  it's not a seizure risk (no rapid high-contrast strobing).
- Optional: remember "already opened" in `localStorage` so return visits skip straight to the
  card (this is a real Vite app, so localStorage is fine here).

### (b) The interactive player card (3D hero object)
- Render the card in `@react-three/fiber` as a rounded card mesh / textured plane that **tilts
  toward the pointer** (smooth lerp; subtle, never jerky). Optional gyro tilt on mobile.
- **Holographic foil:** a moving specular/rainbow sheen over a masked region of the card that
  shifts with tilt angle (custom shader, or a layered overlay using `--holo` with
  `mix-blend-mode: color-dodge/overlay` and angle-driven offset). Glossy and premium.
- **Card tier (locked):** a premium **"special" card** — gold frame + corners, a pitch-green
  inner panel, and the holographic rainbow foil as the signature sheen. Eye-catching, not gaudy.
- The card displays:
  - **Portrait slot — illustrated avatar (locked).** Use an ORIGINAL stylized **vector /
    illustrated avatar** (not a photo): a clean, slightly geometric character bust rendered as
    SVG, tinted in the card palette (gold rim light, pitch-green shadow, a subtle holographic
    edge). Ship a tasteful placeholder avatar (`PlayerAvatar.tsx` backed by `public/avatar.svg`)
    so it looks intentional out of the box, and document how Aryan swaps in his own illustrated
    avatar — an avatar-maker export, an AI-illustrated portrait, or a commissioned vector — by
    replacing that one file.
  - **OVR rating** (Bebas, large) — default **90**.
  - **Position chip** — default **"AI ENG"**.
  - **Club + Nation** — "Hitech Digital Solutions" + India.
  - **Six attribute stats — dev-themed (locked):**
    `SYS 90 · AI 93 · BLD 88 · SHP 90 · SCL 91 · RES 86`
    (SYS = ML systems / MLOps, AI = ML & GenAI, BLD = full-stack build, SHP = shipping /
    delivery, SCL = scale / performance, RES = research). Values + labels live in `site.ts` so
    Aryan can tweak, but ship with these.
- **Critical:** also output the card's text (name, role, OVR, stats) as real DOM/`aria` text,
  not only inside the canvas, for SEO + screen readers.

### (c) Stadium ambiance (subtle, behind content)
- Dark stadium-night feel: faint floodlight glows, drifting "camera-flash" sparkles, and a
  subtle perspective pitch-line grid receding into the dark. Keep it cheap and low-contrast.
- Canvas ambiance is decorative: `aria-hidden`, `pointer-events: none`, transparent
  (`gl={{ alpha:true }}`), `dpr={[1,2]}`, drei `<AdaptiveDpr>`. Reduced-motion → static.

## 6. Content (use verbatim facts; theme the wording, don't change facts)

> Store ALL of this in `src/data/site.ts` as a typed export; every component reads from it.
> This is the only file Aryan edits to update the site or his ratings.

### Identity
- **Name:** Aryan Bhavsar
- **Role / title:** Machine Learning Systems Engineer
- **Subtitle:** Forward-Deployed AI & Full-Stack
- **Location / Nation:** Ahmedabad, India
- **Email:** aryanbhavsar.ab23@gmail.com
- **Phone:** +91 7016814697  *(optional on a public site — see Privacy note §11)*
- **GitHub:** https://github.com/driizzyybreezzyy
- **LinkedIn:** https://linkedin.com/in/-aryan-bhavsar
- **LeetCode:** https://leetcode.com/u/driizzyybreezzyy/

### Hero (after the pack opens)
- Eyebrow: `DEV FC · 2026 SPECIAL`
- Big name: **ARYAN BHAVSAR** (jersey display)
- Position line: `AI ENG · MACHINE LEARNING SYSTEMS ENGINEER`
- One-liner:
  > I build production AI end to end — from fine-tuning the model to shipping the product.
- CTAs: **View highlights** → `#highlights`, **Sign me** → `#contact`. (Optional **Résumé** →
  `/resume.pdf` if added.)

### Season stats strip (real metrics, framed as a stat line)
- `90%+` — extraction accuracy
- `50,000+` — docs / day in production
- `33%` — operational cost cut
- `10×` — faster processing (15s → 1s per doc)

### Profile / "Scouting Report" (About)
> Scouting report — Aryan is a Machine Learning Systems Engineer who takes AI from prototype to
> production. Recently he led an in-house document-intelligence platform end to end — replacing
> paid cloud OCR and a legacy classifier with fine-tuned open-source OCR engines and LLMs/VLMs
> served on in-house GPUs — hitting 90%+ accuracy at zero inference cost while scaling past
> 50,000 documents a day. Earlier he researched multi-agent LLM systems and built deep-learning
> models for satellite imagery at ISRO. Comfortable across the whole pitch: fine-tuning and
> serving models, the inference layer, and the FastAPI + React product on top.

### Career / "Transfer History" (Experience — numbered, most recent first)
Each company = a club; dates = seasons; role = position; bullets = season highlights.

**Hitech Digital Solutions** — Ahmedabad, India — Sept 2025 – Present
- *Machine Learning Systems Engineer (Forward-Deployed AI & Full-Stack)* — Mar 2026 – Present
  - Architected and built an in-house real-estate document extraction & classification platform
    end to end (React/Vite frontend, FastAPI backend, SQLite job queue) as primary ML/full-stack
    engineer on a 4-person team.
  - Replaced a paid Azure OCR service and a legacy BERT classifier with fine-tuned open-source
    OCR (DocTR, Donut, Monkey OCR) and LLMs/VLMs (Qwen 2/2.5/3, Mistral, InternVL) using LoRA
    fine-tuning via Unsloth — 90%+ extraction accuracy at zero inference cost on in-house GPUs.
  - Engineered a vLLM inference layer with sidecar health monitoring and zero-downtime model
    hot-swapping; cut per-document time (deed 15s→1s, mortgage 25s→6s, classification 5s→0.5s)
    while scaling to 50,000+ documents/day in production.
  - Built a confidence-scoring system routing low-confidence predictions to manual review,
    cutting verification headcount from 500 to under 100 and contributing to a 33% operational
    cost reduction and 10% profit increase last quarter; deployed via RunPod & Docker.
  - **Star Performer of the Month & Quarter** for leading the document-intelligence platform.
- *Graduate Engineer Trainee (Jr. Data Scientist)* — Sept 2025 – Feb 2026
  - Built an Intelligent Pricing & Changelog Management System, benchmarking open-source models.
  - Applied GPT-4o Vision with chain-of-thought prompting on complex menu structures and hybrid
    reconciliation via Sentence-Transformers to track price elasticity and automate data entry
    with Pydantic schemas.

**Hyperface Technologies Pvt. Ltd.** — Bengaluru, India — Feb 2025 – Aug 2025
*AI Researcher (Generative AI Team)*
- Architected a multi-agent system with FastAPI integrated with LLMs (GPT-4, Gemini) for
  intelligent workflow automation.
- Engineered agent-level prompt strategies and pipeline logic, improving response accuracy and
  reducing latency.
- Built an evaluation framework using Hugging Face open-source models to benchmark LLMs.

**Indian Space Research Organisation (ISRO)** — Ahmedabad, India — Oct 2024 – Jan 2025
*Machine Learning Intern*
- Designed a deep-learning classifier to distinguish snow vs. cloud cover in satellite imagery
  using custom CNN architectures.
- Improved crop-yield prediction by aggregating multi-spectral imagery and analyzing temporal
  patterns.

### Academy (Education — show as the "youth academy" sub-block of Career)
- **Vellore Institute of Technology**, Chennai — B.Tech, Computer Science — CGPA 8.65 — 2021–2025
- **Zydus School for Excellence**, Ahmedabad — Higher Secondary (12th 84%, 10th 89%) — 2019–2021

### Highlights (Projects — match-highlight style cards, with repo links)
1. **Multi-Agent Real Estate Copilot** — Python · FastAPI · Gemini · Docker
   - Multi-agent backend routing queries between a vision-capable Property Agent and a
     text-based Tenancy Agent; Gemini Pro Vision for real-time property-image analysis in a
     Next.js chat UI.
   - Repo: https://github.com/driizzyybreezzyy/Multi-Agentic-Real-Estate
2. **Virtual Football Analysis** — YOLOv8 · OpenCV · Flask · CNN  *(lean into this one — it's
   on-theme: real-time player & ball tracking)*
   - Real-time player and ball tracking with YOLOv8 served via a Flask web app; automated
     event-based highlight generation using time-indexed detection.
   - Repo: https://github.com/driizzyybreezzyy/Football-Analysis

### Honours / "Trophy Cabinet" (Publications + award)
- 🏆 **Star Performer of the Month & Quarter** — Hitech Digital Solutions (internal award).
- 📄 **Deep Learning for Tea Leaf Disease Synthesis & Detection** — ScienceDirect —
  https://www.sciencedirect.com/science/article/pii/S2590123024020279
- 📄 **Markerless Data-based Cyclist Posture Detection using Deep Learning** — IEEE Xplore —
  https://ieeexplore.ieee.org/abstract/document/11135949

### Attributes (Skills — show under sporty attribute bars; group exactly like this)
- **Languages:** Python, Java, C++, SQL, JavaScript, R, HTML, CSS
- **ML / Deep Learning:** PyTorch, TensorFlow, Scikit-learn, OpenCV, CNNs, YOLOv8
- **GenAI & NLP:** GPT-4o, Gemini, Qwen, Mistral, InternVL, LangChain, RAG, CAG, LoRA / Unsloth
  fine-tuning, vLLM, OCR (DocTR, Donut, Monkey OCR), Sentence-Transformers, spaCy, multi-agent
  systems
- **Backend & Web:** FastAPI, Django, Flask, React, Vite, Next.js, Node.js
- **Cloud & DevOps:** GCP, Docker, RunPod, Git, GitHub & GitLab Actions
- **Databases:** PostgreSQL, MySQL, SQLite
- **Libraries & Tools:** Pandas, NumPy, BeautifulSoup, Playwright, Fuzzywuzzy, Pydantic

### Sign Me / "Transfer Enquiries" (Contact)
- Heading: `Open to transfers`
- Body: `Open to ML/AI engineering roles and interesting problems. Make an offer — my inbox is open.`
- Primary action: email button → aryanbhavsar.ab23@gmail.com (label: "Open transfer talks")
- Secondary: GitHub, LinkedIn, LeetCode.

### Footer
- `© 2026 Aryan Bhavsar` + the section nav. **Nothing else.** No EA/FIFA, no template/AI credit.

## 7. Information architecture (section order + football names)

1. **Nav** — fixed; left = "DEV FC" monogram/crest (original); right links:
   `Profile · Career · Highlights · Honours · Attributes · Sign me`. Blur bg on scroll.
   Mobile: accessible hamburger.
2. **Hero** — pack-opening → player card, name, position, OVR, CTAs, season-stats strip.
3. **Profile** (About / scouting report).
4. **Career** (Experience transfer-history timeline; Academy/education sub-block).
5. **Highlights** (Projects, 2 cards).
6. **Honours** (Trophy cabinet — award + 2 publications, external links).
7. **Attributes** (Skills, grouped with attribute-bar treatment).
8. **Sign me** (Contact).
9. **Footer.**

## 8. Animation spec (GSAP)

- Register `ScrollTrigger`. Wrap **all** motion in `gsap.matchMedia()` under
  `(prefers-reduced-motion: no-preference)`; reduced-motion users get a calm, fully visible page
  with the card already revealed and no flashing.
- **Pack-opening timeline:** prompt pulse → tear/glow → light burst + sparks → card scales up
  and settles → hero text staggers in. Skippable; auto-advance ~6s; safe flash levels.
- **Scroll reveals:** sections/cards fade + rise once on enter (`start:'top 85%'`, `once:true`);
  deal cards in with a slight stagger like a hand being dealt.
- **Card foil + tilt:** continuous, pointer-driven, smooth; pauses when off-screen/tab hidden.
- **Micro-interactions:** highlight cards lift + show an accent arrow on hover; clear visible
  keyboard focus everywhere.
- Use `gsap.context(..., scopeRef)` + `ctx.revert()` cleanup (React 18 StrictMode runs effects
  twice in dev). `useLayoutEffect` for pre-paint initial states (no flash of unstyled reveal).

## 9. Quality floor (all required for "done")

- **Responsive** 360px → ultrawide. Card and pack scale down cleanly; ambiance stays cheap on mobile.
- **Keyboard accessible:** skip-to-content link; pack "open"/"skip" operable by keyboard; logical
  focus order; visible focus rings; hamburger operable by keyboard.
- **Reduced motion** fully respected (pack, foil, ambiance, GSAP). **No strobing** in any mode.
- **Real semantic HTML:** one `<h1>`; `<header>/<nav>/<main>/<section>/<footer>`; proper heading
  order; the card's info exists as real text (not only in the canvas); `alt` text on images.
- **SEO/meta:** title, description, Open Graph tags, theme-color, favicon (an OG image is a plus).
- **Contrast** ≥ WCAG AA for body text. `font-display: swap` + preconnect to fonts (no layout shift).

## 10. Project structure & conventions

```
/ (repo root)
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  .gitignore            # ignore node_modules, dist
  README.md             # run / build / deploy + how to edit site.ts and ratings
  public/
    favicon.svg
    avatar.svg          # illustrated player avatar (placeholder shipped; Aryan can replace)
  src/
    main.tsx
    index.css           # tokens + all styles, comment-organized
    App.tsx
    data/
      site.ts           # ALL content + card ratings, typed
    hooks/
      useReveal.ts
    components/
      Navbar.tsx
      Hero.tsx
      PackOpening.tsx    # the pack + reveal choreography
      PlayerCard3D.tsx   # the holographic, tiltable card (r3f)
      PlayerAvatar.tsx   # the original illustrated avatar (SVG) shown on the card
      StadiumAmbiance.tsx# subtle background canvas
      Profile.tsx        # About / scouting report
      Career.tsx         # Experience timeline + Academy
      Highlights.tsx     # Projects
      Honours.tsx        # Publications + award
      Attributes.tsx     # Skills
      Contact.tsx        # Sign me
      Footer.tsx
```
- TypeScript strict; type the content object and props.
- Consistent CSS class convention (e.g. `card`, `card__ovr`); avoid generic selectors fighting
  over section padding.
- Comments may describe code, but never contain attributions or any third party's name.

## 11. Notes & recommendations

- **Privacy:** raw phone/email in page text invites scrapers. Default to email button + socials;
  include the phone only if Aryan wants it; consider lightly obfuscating the email.
- **Avatar:** the card uses an original illustrated vector avatar (not a photo). A placeholder
  ships in `PlayerAvatar.tsx` / `public/avatar.svg`; replace that one file to use a custom
  illustrated avatar (avatar-maker export, AI-illustrated portrait, or a designer's vector).
- **Easy theming:** content + ratings live in `site.ts`; colors/fonts are CSS variables — accent,
  OVR, stats, and text are all one-file edits. Note this in the README.

## 12. Deployment (include in README)

- Vercel or Netlify: framework preset **Vite**, build `npm run build`, output `dist`.
- Custom domain: add it in the host dashboard and update DNS.

## 13. Acceptance checklist (verify before declaring done)

- [ ] `npm install` succeeds; `npm run dev` runs with no console errors.
- [ ] `npm run build` passes with **zero** TypeScript errors; `npm run preview` works.
- [ ] Pack-opening plays, is **skippable**, keyboard-operable, and auto-advances; on reduced
      motion it skips with **no flashing**, card shown immediately.
- [ ] Player card renders in 3D as a premium **gold + holographic "special" card** with an
      original **illustrated avatar**, tilts to the pointer with a foil shine, and its text
      (name, role, OVR, stats) also exists as real HTML.
- [ ] All sections present, themed, and populated from `site.ts` — no lorem, no placeholder names.
- [ ] Stadium ambiance is subtle, `aria-hidden`, non-interactive, and cheap.
- [ ] Fully responsive 360px → desktop; keyboard navigable; visible focus; skip link works.
- [ ] No EA / FIFA / FUT logos, templates, crests, player art, or fonts. Original "DEV FC" only.
- [ ] No watermark / template / AI credit / other person's name anywhere (UI, code, metadata).
      Footer reads only `© 2026 Aryan Bhavsar` + nav.
- [ ] No files from the Moncy clone; no references to moncy.dev.
- [ ] README covers run / build / deploy / editing `site.ts` and ratings.