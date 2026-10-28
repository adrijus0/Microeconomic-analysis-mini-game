# Phase 3 rework prompt — Fallout Pip-Boy single-game site

> Status: **proposed, not executed**. This prompt is the go-ahead document for
> the rework requested after Phase 2 (`1b236a8`). It changes the product from
> “deck + four-game hub” to **one Fallout/Pip-Boy-styled game**, with theory
> reasoning instead of simulation statistics.
>
> Defaults are stated explicitly. If a default is wrong, change it here before
> starting; do not improvise destructive changes.

---

## 0. Current state (read first)

- Repo root: `/Users/adrijusskuodas/Desktop/Microeconomic Analysis`.
- Last commit: `1b236a8 Phase 2: engine + The Caravan Lockboxes`.
- `docs/index.html` — start screen with **▶ Presentation** and **🎮 Games**.
- `docs/deck.html` — 35-slide reveal.js deck (29 source frames + 4 Try-it +
  2 References + QR). It works from `file://` and offline.
- `docs/play.html` — hub + game runner. Routes: bare hub, `#allais` (playable),
  `#stp`, `#ellsberg`, `#framing` (coming soon), `#report`.
- `docs/js/engine.js` — scene → choice → lock → resolve → **simulate ×1,000**
  (canvas histograms, running average, mean/SD/P(worst)) → interlude → reveal.
- `docs/js/charts.js` — histogram/running-average charts.
- `docs/games/allais.js` — pure `verdict(choices, game)`, 105/105 tests.
- `docs/assets/` — original Allais sprites, card, background, university logo
  `ui/mif.png`, two Phase 1 plot SVGs.
- `docs/vendor/` — reveal.js, KaTeX, qrcode, Press Start 2P.
- LaTeX sources in `Microeconomic_analysis__Copy_/` are **read-only**.
- Nothing is pushed; `CONFIG.siteUrl` is a placeholder.

Read: `BRIEF.md` §2/§4/§8/§9/§13, `PLAN.md` §5.2 A and §5.4, `NOTES.md`,
`CONVERSION_NOTES.md` §8, `ASSETS.md` §1–§2, `slides.tex` frames 10–16/22,
and the current `docs/` implementation.

---

## 1. Goal

Ship **one game only**: The Caravan Lockboxes (Allais / common consequence),
in a **Fallout / Pip-Boy-inspired** presentation. No slides, no start-screen
logo, no four-game hub, no statistical simulation. The player should
experience a choice and then see the **expected-utility / independence
reasoning from the slides**, not a Monte Carlo dashboard.

The site should feel like a single CRT terminal in the wasteland:

- **Primary green: `rgb(18, 255, 18)` = `#12FF12`.**
- Near-black green backgrounds, phosphor glow, scanlines, monospace/Pip-Boy
  framing, pixel-art sprites.
- The same palette and framing on every remaining screen: boot/landing,
  game, reveal, Report Card, and any error/empty state.

Do **not** use copyrighted Fallout logos, characters, screenshots, or ripped
assets. “Pip-Boy-inspired” means green CRT, scanlines, terminal typography,
original pixel art; it does not mean copying a logo or UI bitmap.

---

## 2. Remove

1. **The entire slide deck from the shipped site.**
   - Remove `docs/deck.html` from the site and all links to it from
     `docs/index.html` / `docs/play.html`.
   - Move deck-only outputs out of `docs/` (recommended: `archive/phase1-deck/`
     outside `docs/`) rather than deleting history: `deck.html`, `css/deck.css`,
     `js/deck.js`, `js/tryit.js`, `vendor/reveal*`, `vendor/qrcode`, the QR
     slide, `assets/ui/mif.png`, the two Phase 1 plot SVGs, and any deck-only
     test scripts. If the team prefers deletion, delete those files; never
     touch the LaTeX sources.
   - Remove `render`/reveal.js/QR/KaTeX-plugin dependencies that the game does
     not use. Keep **KaTeX** (`vendor/katex/dist/`) because the game still
     renders formulas.
2. **The university logo everywhere.** Remove `assets/ui/mif.png`, the
   `ui_mif` config asset, the start-screen logo card, and every `<img>`/alt
   reference to it. No academic authors/supervisor block on the new landing
   screen unless the team explicitly asks; the default is a game terminal, not
   a title slide.
3. **The four-game hub and the three coming-soon routes.**
   - One game only: **The Caravan Lockboxes**.
   - Remove `#stp`, `#ellsberg`, `#framing`, their `CONFIG.games` entries,
     cards, coming-soon code and config copy.
   - `docs/index.html` becomes a single “enter the game” terminal screen.
     Optionally `docs/play.html` can be the same single-game screen; do not
     keep a card grid.
4. **The ×1,000 simulation stage and everything statistical that is not in the
   slides.**
   - Delete the simulation UI: canvas histograms, running-average line,
     mean, SD, P(worst), “1,000 runs”, “mean of runs”, and `charts.js` if it
     becomes unused.
   - Remove `simulations` from the config.
   - Keep the single seeded **outcome draw** (chest opening) and `?seed=42`
     reproducibility for demos; that is a draw, not a statistic.
   - Do not replace it with invented numbers, confidence intervals, p-values,
     regressions, or “expected value” tables. The slides give the theory; use
     that.

---

## 3. Keep / re-skin

- **One game:** The Caravan Lockboxes, two rounds A/B then C/D, the 20-second
  “weigh the cargo” interlude (visible countdown + Continue; `?fast=1` skips
  it), the seeded draw, and the reveal. Keep the interlude because it disguises
  the paired structure; do not add choices there.
- **Exact content** from the slides / `PLAN.md` §5.2 A:
  - A `{1.00 → 2400}`, B `{0.33 → 2500, 0.66 → 2400, 0.01 → 0}`,
    C `{0.33 → 2500, 0.67 → 0}`, D `{0.34 → 2400, 0.66 → 0}` caps at the
    existing ×1/1000 display rescale.
  - 82% A / 83% C (Kahneman & Tversky, 1979).
  - Verdicts A+C **No**, A+D **Yes**, B+C **Yes**, B+D **No**; A+C and B+D are
    mirrors. Keep `AllaisGame.verdict(choices, game)` derived from the
    lotteries; never pattern-match IDs.
  - Frame 11 formulas, frame 12 triangle (optional, via
    `Figures.triangleSVG()`), frame 22 `V(A)=943.2, V(B)=806.5, V(C)=326.7,
    V(D)=320.1`, source-frame “Slide 11/12/22” refs.
- **Report Card** (keep as a game-end terminal readout): pattern, EU verdict,
  benchmark, slide refs, CE/CRRA “Not measured in this game”. Restyle it in
  green/CRT; do not invent a CE or CRRA.
- **Pixel art:** keep the nine original Allais PNGs and `make_sprites.py`.
  They may remain desert-coloured inside green CRT frames; do not replace them
  with copyrighted Fallout art. If a green monochrome treatment is used, keep
  it subtle enough that the silhouettes remain distinguishable; never rely on
  colour alone.
- **Palette and type:** rewrite `theme.css` / `games.css` around
  `--pip-green: #12FF12` (exact RGB 18/255/18). Use near-black green panels,
  a dim green (`#0B7A0B`/`#0A5A0A`) for rules, `#8CFF8C` for secondary text,
  and a single warning red (`#FF3B2F`) only for violations/errors. Remove the
  VU blue/gold/burgundy palette from the shipped game surface. Use a
  monospace body and a pixel display face for headings; scanline overlay,
  soft phosphor glow, CRT vignette. Respect `prefers-reduced-motion` (no
  flicker/scan animation for those users). Keep text contrast high.
- **Same style everywhere:** index/landing, game stages, reveal, Report Card,
  empty/error panels, 404/unknown route. No page should still look like the
  old blue/cream deck.

---

## 4. New theory flow (replaces simulation)

Per round:

1. **Scene** — caravan halt, 2–3 lines.
2. **Choice** — two option cards; sprite, label, lottery as numbers and a
   stacked probability bar; no EV, no statistics.
3. **Lock in** — no take-backs; record `choices[round.id]`.
4. **Resolve** — seeded chest draw; show the payoff.
5. **Theory checkpoint** — replace the simulation with a short “what this
   choice implies” panel:
   - the chosen option vs the other option;
   - the expected-utility inequality for that choice, rendered with KaTeX
     (`A≻B ⇔ 0.34u(2400) > 0.33u(2500)`, etc.);
   - one sentence: “Under expected utility, this choice means …”;
   - no mean/SD/P(worst), no histogram, no simulated data.
6. **Interlude** after Round 1 (20 s / `?fast=1`).
7. Round 2 (choice → lock → resolve → theory checkpoint).
8. **Reveal** after **both** rounds are locked:
   - concept name “Allais paradox”, common consequence / certainty effect;
   - 2–4 sentences of plain explanation;
   - the two inequalities from frame 11, the `⊥` only for A+C/B+D, the
     conditional static block as in Phase 2;
   - “You vs. expected utility” panel with the player’s pattern and algebra;
   - benchmark 82/83 and the prospect-theory frame-22 values;
   - optional triangle (Slide 12), no second copy of the figure code;
   - link to the Report Card, then back to the entry screen.
9. **No simulation stage, no charts.js, no statistical claims.**

Keep `rng.js` for the draw and `?seed=42`; keep the per-round streams so the
same seed reproduces the draw. Do not describe a single draw as “expected” or
“average”.

---

## 5. Files / ownership

Coordinator (shared):
- `docs/index.html` (new terminal landing; no logo, no Presentation button).
- `docs/play.html` (single-game shell; remove hub cards/coming routes).
- `docs/js/engine.js` (remove simulate stage; add theory checkpoint; green
  Pip-Boy hooks; keep keyboard/touch/reduced motion/asset fallback).
- `docs/js/rng.js`, `docs/js/assets.js`, `docs/js/store.js`, `docs/js/hub.js`
  (hub either removed or reduced to one game/Report Card; delete
  coming-soon code).
- `docs/config.js` (one game; remove other games, simulations, logo, deck
  metadata; keep Allais numbers/slide refs).
- `docs/css/theme.css`, `docs/css/games.css`, `docs/css/games/allais.css`
  (new green CRT theme; remove old palette).
- Remove/archive deck-only files as in §2; remove `charts.js` if unused.

G1 (game logic/content):
- `docs/js/games/allais.js`, `tools/test_allais_verdicts.mjs`, any copy.
- The verdict function and 105/105 tests must still pass; do not change the
  four-pattern table.
- Return any config-entry changes in its report; do not edit `config.js`.

G2 (art):
- Only if the green treatment needs it: `tools/make_sprites.py` and the nine
  Allais PNGs. Do not replace original art with copyrighted Fallout art.
- Keep 32×32 sprites at integer 2×/4× display.

Reviewers (fresh):
- **Theory/content reviewer:** frames 10–16/22 vs the game copy; four patterns;
  no simulation/statistics; no invented numbers; formulas/refs; benchmark;
  reveal timing; no “Allais” before both locks.
- **Pip-Boy/layout reviewer:** 375/1280, `file://`, offline, no deck/logo
  links, no external requests, 0 console/page/KaTeX errors, no horizontal
  scroll, ≥44 px targets, reduced motion, missing art, green contrast,
  scanlines not blocking text, Report Card screenshot-friendly.

---

## 6. Acceptance criteria

- `docs/index.html` is a single green CRT terminal with **no logo**, no
  authors/supervisor block, no Presentation/deck link, and one clear
  “enter the game” action.
- Only one game exists; `#stp`, `#ellsberg`, `#framing` are gone. Bare
  `docs/play.html` and `#allais` lead to the same game; `#report` remains.
- No `docs/deck.html` in the shipped site and no link to it. Deck-only vendor/
  assets are archived outside `docs/` or deleted; LaTeX sources untouched.
- No simulation stage: no histogram, running average, mean, SD, P(worst),
  “1,000 runs”, `charts.js`, or `simulations` config. The flow has a theory
  checkpoint instead.
- The game still has both Allais rounds, interlude, seeded draw, all four
  verdicts, exact inequalities, 82/83 benchmark, Slide 11/12/22 refs, and the
  Report Card with CE/CRRA “Not measured in this game”.
- **Fallout/Pip-Boy palette:** `#12FF12` primary green, near-black green
  background, monospace/pixel terminal framing, scanlines, consistent across
  landing/game/reveal/Report Card. No VU blue/gold/burgundy on the shipped
  game surface.
- Works from `file://` and a GitHub Pages sub-path; no external requests;
  works offline; localStorage in try/catch; missing art fallback; reduced
  motion; keyboard `1`/`2`/`3` + Enter; tap targets ≥44; no h-scroll at
  375/1280; 0 console/page/KaTeX errors.
- `node tools/test_allais_verdicts.mjs` passes (105/105 or more);
  `python3 tools/check_assets.py` exits 0 with the remaining assets.
- Commit locally (`Phase 3: Pip-Boy single-game rework`), do not push; update
  `NOTES.md` and `CONVERSION_NOTES.md`; run fresh reviews; stop.

---

## 7. Defaults / decisions to confirm before destructive changes

- **One game:** Allais / The Caravan Lockboxes. Other paradoxes are not built.
- **Deck:** archive outside `docs/` (recommended) or delete; either way it is
  not shipped and not linked.
- **Logo:** remove `ui_mif` and the file; no university branding.
- **Simulation:** delete, do not hide; replace with the theory checkpoint.
- **Landing:** single terminal, one enter button; no four-card hub.
- **Interlude:** keep 20 s and `?fast=1`; no invented choices.
- **Report Card:** keep; CE/CRRA stay “Not measured in this game”.
- **Palette:** `#12FF12` exact; green monochrome UI; sprites may keep desert
  colours inside CRT frames.
- **No push**, no repo settings, no `CONFIG.siteUrl` change, no LaTeX edits.

**Stop after the rework, reviews, commit and report. Do not build the other
paradoxes.**
