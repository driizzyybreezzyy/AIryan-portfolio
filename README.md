# AIryan FC — Aryan Bhavsar Portfolio

A football / trading-card themed 3D developer portfolio for **Aryan Bhavsar**,
Machine Learning Systems Engineer. The hero is a **FUT-style pack-opening walkout**
that reveals an interactive, holographic **player card** you can tilt to catch a
foil shine, over an original animated stadium pitch.

Built with React 18 + Vite + TypeScript, three.js / @react-three/fiber for the 3D
card and stadium ambiance, and GSAP for the pack-opening choreography.

## Run

```bash
npm install
npm run dev      # local dev server (Vite)
```

Open the printed `localhost` URL.

## Build & preview

```bash
npm run build    # type-checks (tsc -b) then builds to dist/
npm run preview  # serve the production build locally
```

A clean build produces zero TypeScript errors.

## Editing content & ratings

**Everything lives in one file:** [`src/data/site.ts`](src/data/site.ts).

- **Card OVR** — `site.card.ovr` (default `90`).
- **Position chip** — `site.card.position` (default `"AI ENG"`).
- **Attribute stats** — `site.card.stats` (SYS / AI / BLD / SHP / SCL / RES).
- **Availability chip** — `site.hero.status` (e.g. `"Open to AI/ML roles"`); shown
  in the hero and contact section. Remove it to hide the chip.
- **Impact "match stats"** — `site.impactStats`: the big headline numbers that
  count up in the Profile section (docs/day, accuracy, etc.).
- **Starting XI** — `site.lineup`: the skills as one `squad` (ordered GK →
  defence → midfield → attack) shown on a pitch in Attributes, with a formation
  toggle (`formations`, e.g. `["4-3-3","4-4-2","3-5-2"]`). Any "D-M-F" shape
  summing to 10 outfielders works; positions are derived. `captain: true` adds
  the armband.
- **Project result badges** — `project.result` (e.g. `"MOTM"`, `"Hat-trick"`) on
  each Highlights card.
- **Identity, hero copy, season stats, profile, experience, academy, projects,
  honours, skills, contact** — all typed fields on the exported `site` object.
- **Phone privacy** — `site.identity.showPhone` is `false` by default; the public
  page uses the email button + socials. Flip to `true` to expose the number.

## Social-share preview image

`public/og.png` (1200×630) is the link-preview card recruiters see when the URL is
shared (wired up via Open Graph / Twitter meta tags in `index.html`). It's a static
image — replace the file to change it, or ask to have it regenerated if you update
the headline stats.

## Theming

Colors and fonts are CSS custom properties at the top of
[`src/index.css`](src/index.css) (`--gold`, `--pitch`, `--bg`, fonts, etc.).
Change the accent, background, or type in one place.

## Swapping the player avatar

The card portrait is backed by a single file: **`public/avatar.svg`**. Replace it
with your own square SVG or PNG portrait — an avatar-maker export, an
AI-illustrated portrait, or a commissioned vector — and nothing else needs to
change. It feeds both the 3D card texture and the static fallback card.

## A realistic human in the walkout (optional)

The walkout ships with a built-in stylized 3D figure. To use a **real, rigged,
walking human** instead:

1. Get a rigged model with a walk animation as a `.glb`:
   - **Ready Player Me** (readyplayer.me) — make an avatar from a selfie, download `.glb`.
   - or a **Mixamo** character + "Walking" clip, or a CC0 character (e.g. Quaternius).
2. Drop the file in `public/` (e.g. `public/player.glb`).
3. In [`src/data/site.ts`](src/data/site.ts) set `card.model`:
   ```ts
   model: { url: "/player.glb", scale: 1, yOffset: 0, walkClip: "Walk" }
   ```
   (`walkClip` is the animation clip name; omit it to use the model's first clip.)

If the file is missing or fails to load, the scene automatically falls back to the
built-in figure — no broken state.

## Stadium backgrounds (per-section grounds)

The page background shifts to a different football ground in each section
(Anfield → Bernabéu → Camp Nou → Allianz → Etihad → Signal Iduna Park → Old
Trafford), with scroll + cursor parallax and a drifting club-coloured wash.

Real photos live in `public/stadiums/` as landscape `.jpeg` files with the exact
names listed in [`public/stadiums/README.txt`](public/stadiums/README.txt)
(e.g. `anfield.jpeg`) — these are already in place. If a file is missing, that
section falls back to a tasteful club-coloured, pitch-striped gradient — nothing
looks broken. (Real stadium photos are copyrighted; use images you have the right
to use.) Edit the `GROUNDS` list in
[`src/components/StadiumBackground.tsx`](src/components/StadiumBackground.tsx) to
change which ground maps to which section (the `img` path must match the filename).

## Replaying the walkout

A **“↻ Replay walkout”** button in the footer re-plays the pack-opening at any time.
(The walkout is shown automatically on a first visit and remembered in
`localStorage`; the replay button clears that and runs it again.)

## Replacing the résumé

The “Résumé” button links to `public/resume.pdf`. Drop in your own PDF at that
path to update it.

## Accessibility & motion

- Respects `prefers-reduced-motion`: the pack-opening is skipped (card shown
  immediately, no flashing), the foil/tilt settle to a static angle, and the
  ambiance stops animating.
- The pack-opening is skippable (button + Enter), keyboard-operable, and
  auto-advances after ~6s. Return visits skip straight to the card
  (`localStorage`).
- The card's text (name, role, OVR, stats) also exists as real HTML for screen
  readers and SEO; there is one `<h1>`, semantic landmarks, and a skip link.

## Deployment

Deploy to **Vercel** or **Netlify**:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

For a custom domain, add it in the host dashboard and update your DNS records.
