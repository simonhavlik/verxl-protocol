# Verxl design language

**Status:** approved by Simon, 29 Oct 2026. **Reference:** [mnemosyne.ai](https://mnemosyne.ai/) — replicated as a frame, not copied.
**Search term:** `VERXL DESIGN`.

The short version: a quiet, evidence-first, near-black editorial system. One idea per section, one signature graphic, specific numbers, explicit limits. It should read like a well-made ESG report that actually carries its method — never like a dashboard skin.

---

## 1. Palette

| Token | Hex | Use |
|---|---|---|
| Ink | `#070A0F` | Page background |
| Surface | `#0A0F14` / `#0B1117` | Panels, cards, dropdowns |
| Map ink | `#080C12` | Map / footer / chart panels |
| Hairline | `rgba(255,255,255,0.08–0.12)` | Rules, borders |
| Mint | `#B8F6DD` | Primary accent, key labels, active data |
| Sage | `#7FAE9D` | Fills, secondary positive data |
| Sage deep | `#5F8A7A` | Filled buttons / active nav |
| Steel | `#8FA39B` | Secondary headings, structure |
| Muted | `#65737B` | Captions, metadata |
| Soft | `#8B989E` | Body copy on dark |
| Bone | `#F3F6F5` | Primary text |
| Rose | `#D99A9A` | Caution / error only |

Rules
- Mint is the only accent. Do not introduce blue, cobalt, cyan, teal, purple, violet or amber.
- No pure white backgrounds in product surfaces. No oversized bright fills.
- Surfaces are warm black, not slate-blue. No `#0F172A` / `#0C1220` legacy panels.
- Status dots are mint, not emerald. Charts use mint / sage / steel.
- `tailwind.config.js` remaps the old blue/cyan/indigo scales to mint/sage/steel; still avoid hard-coded blue hex values.

---

## 2. Typography

- **Display / body:** Helvetica Neue, falling back to Inter / system sans.
- **Labels / data:** JetBrains Mono / Menlo.
- Eyebrows: 8–10px, uppercase, `.16–.18em` tracking, muted; preceded by a 6px mint square.
- Headings: 2–3.8rem for section intros; 4.9–6.4rem for hero and About/Vision; tracking `-.045em` to `-.055em`; line-height `0.92–0.95`; weight 500.
- The second line of a two-line title is always muted steel, never a gradient.
- Body: 13–16px, line-height `1.35–1.65`, soft grey on ink.
- Data labels: 6.5–10px mono, uppercase.
- No letter-spaced all-caps sentences; labels only.

Signature hierarchy
1. Eyebrow → 2. two-line statement → 3. one specific paragraph → 4. evidence strip or graphic → 5. caveat.

---

## 3. Layout

- Container: `max-w-7xl`; gutters 16 / 24 / 32px.
- Vertical rhythm: sections `64–80px`; major intros `120–160px` where the page has room.
- Sticky shell: **24px Sepolia test-run bar + 68px nav**; full-height pages subtract 92px.
- Hero: `min-height: calc(100svh - 92px)`, content centred.
- Corners: 0–3px. No rounded cards, pills or floating bubbles.
- Structure with hairlines, not shadows or glows.
- Dense data is welcome; empty decorative blocks are not.
- Every section intro: left eyebrow, huge left title, right-aligned short caveat.
- Footers: a hairline, wordmark, 3 link columns, one legal row.

---

## 4. Shell

- Top bar: 24px, centred `SEPOLIA TEST RUN`, mint dot, mono 8.5px, no amber.
- Nav: 68px, wordmark + vector V mark, five or six core links plus a `Protocol` dropdown; active link = white + 1px mint underline.
- Right: compact balance, outlined Connect, external Aragon icon.
- Interim logo: vector V mark (two chevron lines) + `Verxl` wordmark. Final logo is Simon's; do not use `logo-square.jpg` in the UI.
- Footer: minimal, 12px links, mono column labels.

---

## 5. Hero and motion

- Left: eyebrow, huge two-line statement, ≤2-sentence specific paragraph, one mint-outline CTA and one ghost CTA, mono evidence strip.
- Right: one signature object — the Three.js constellation on the home page, the GeoJSON map on About/Vision.
- Interactive clearing demo: **fixed 384px high and full column width**; tab content scrolls inside; nothing may move or resize the window.
- Background: Shmack drifting orbs / dot matrix / hairline grid in mint and steel on interior pages. The hero's Three.js points and lines are ice/mint, never electric blue.
- Motion is slow and structural: drift, spotlight, hover rules. No bouncing, no layout shift.
- Do not autoplay anything that changes the position of a pane.

---

## 6. Signature graphics

**GeoJSON map** (`src/components/RouteMap.tsx`, About/Vision `MapPanel`)
- Europe from `world-atlas` + `d3-geo`; warm-black sea; EU fill mint at low opacity; hairline countries; graticule.
- Nodes: client (Paris) → EU edge (Frankfurt) → Prague bare metal; dashed ciphertext leg, solid compute leg; Arbitrum settlement in the caption.
- Always captioned: *Illustrative topology. Not a coverage map, SLA or latency guarantee.*
- Reused small in the terminal's `02 ROUTE` tab.

**Terminal**
- Browser chrome, four stages, fixed 594×384 at desktop; content scrolls inside; stage 02 includes the map.
- Values are specific: model, host, TTFT, fee, provider net.

**Evidence**
- Native tables / rows and editable bar shapes; no chart images.
- Every number gets a caption or method line: Sepolia window, canary cadence, $1,000 compute example, 50 bps parameters.

**Team**
- 4:5 portraits, equal weight, name 22px, mono role in mint, one-line remit; VŠE Praha credit.
- Simon's headshot: `public/team/simon-havlik-headshot.webp`; Pudong photo used in the founder note.

**Deck**
- 16:9, same ink/mint system; huge type, map, editable bars, speaker notes; only map and portraits are images.

**Transactional email**
- 560px dark report card; V mark; mint one-time code; hairlines; no images, no rounded corners. The OTP, provider-operator and render-check messages share the same shell.

---

## 7. Copy

Voice: evidence-first, dry, specific, human. A claim needs a number, a limit, or a receipt.

Signature lines
- “Inference that settles.”
- “Private by default. Fast by design.”
- “Measured, not promised.”
- “Ciphertext, by default.”
- “A horizon you can audit.”
- “The clearing is the product.”
- “Build on what clears.”

Rules
- One idea per section.
- Prefer nouns and numbers to adjectives.
- State the method and the boundary next to the claim.
- Sepolia is a demonstration, not mainnet; no enterprise SLA; no token.
- No fake metrics, fake customers or invented benchmarks.
- Avoid: autonomous, sovereign, machine intelligence, institutional precision, deterministic parity, seamless, revolutionary, empower, unlock the future, game-changing.
- No “xd” or emoji jokes in product copy.

---

## 8. Page blueprints

**Home** — Hero (3D + fixed demo) → `Every request settles.` console → `Measured, not promised.` telemetry → `Ciphertext, by default.` → settlement rail → footer.

**About + Vision** (one page, `/about`; `/vision` redirects)
1. Map hero: `Private by default. / Fast by design.`
2. Team: `Three roles. / One project.`
3. `Three claims. / With limits.`
4. Founder note with Pudong photo: `The model is not / the product.`
5. `A short list. / Of what this is not.`
6. `A horizon / you can audit.`
7. `Principles. / Hold us to them.`
8. `Build on what clears.` + contact.

**Chat** — same ink/mint; new V mark; compact welcome; no legacy green/amber/blue; no emerald dots; no slashing prompts.

---

## 9. Do not

- No blue/cobalt/cyan UI; no emerald or amber accents; no purple/teal gradients.
- No rounded cards, pills, glow blobs or glassmorphism.
- No empty “AI slop” divs or enormous decorative whitespace.
- No old logo asset; no old blue-tinted hex surfaces.
- No unsupported claims or fake numbers.
- No fixed-pane movement caused by content, tabs or streaming.
- No new section without an eyebrow, a clear claim, and a caveat/evidence line.

---

## 10. Implementation map

- `tailwind.config.js` — palette remap, fonts.
- `src/index.css` — Shmack/hero/demo CSS, hairlines.
- `src/components/Header.tsx` / `Footer.tsx` — shell.
- `src/components/Hero.tsx` — home hero, console, evidence, rail.
- `src/components/RouteMap.tsx` — shared GeoJSON map.
- `src/components/Vision.tsx` — About + Vision combined page.
- `src/components/Chat.tsx` — chat surfaces.
- `deck/Verxl_Protocol_Deck.pptx` — deck in the same language.
